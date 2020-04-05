import React, { useState, useRef } from "react";
import { View } from "react-native";
import Animated, { useCode, Easing } from "react-native-reanimated";
import { connect, ConnectedProps } from "react-redux";

import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { PaletteActions } from "@redux/modules";
import {
  TapGestureHandler,
  PanGestureHandler,
  State,
} from "react-native-gesture-handler";
import { StyleSheet } from "react-native";
import {
  SCREEN_WIDTH,
  COLOR_BORDER_WIDTH,
  Colors,
  SCREEN_HEIGHT,
  colorHSV,
  SPRING_CONFIG,
} from "@lib";
import {
  useValues,
  bin,
  onGestureEvent,
  withSpringTransition,
  mix,
  withTransition,
  clamp,
  useSpringTransition,
} from "react-native-redash";
import tinycolor from "tinycolor2";
import { useMemoOne } from "use-memo-one";

import { Slider } from "@components/universal";
import Check from "@assets/svg/check_line.svg";
import Undo from "@assets/svg/undo.svg";

const {
  onChange,
  min,
  max,
  multiply,
  abs,
  neq,
  debug,
  and,
  not,
  call,
  cond,
  eq,
  greaterThan,
  set,
  add,
  sub,
  divide,
  modulo,
} = Animated;

export type ColorEditorState = {
  id: Animated.Value<number>;
  color: {
    h: Animated.Value<number>;
    s: Animated.Value<number>;
    v: Animated.Value<number>;
  };
  layout: {
    x: Animated.Value<number>;
    y: Animated.Value<number>;
    width: Animated.Value<number>;
    height: Animated.Value<number>;
  };
};

export const ColorEditorContext = React.createContext<ColorEditorState>(
  {} as ColorEditorState
);

export type ColorEditorConnectedProps = ConnectedProps<typeof connector>;

export interface ColorEditorProps extends ColorEditorState {}

const mapStateToProps = (state: RootState) => ({
  active: selectors.editingActive(state),
});

const mapDispatchToProps = {
  closeEditor: PaletteActions.closeEditor,
  setColor: PaletteActions.set,
};

const EDITOR_SIZE = SCREEN_WIDTH - 50;
const INDICATOR_SIZE = 20;
const LEFT = (SCREEN_WIDTH - EDITOR_SIZE) / 2;
const TOP = (SCREEN_HEIGHT - EDITOR_SIZE) / 2;
const INDICATOR_MIN = INDICATOR_SIZE / 2;
const INDICATOR_MAX = EDITOR_SIZE - INDICATOR_SIZE + 5;
const TRANSITION_DURATION = 300;

const ColorEditor: React.FC<
  ColorEditorProps & ColorEditorConnectedProps
> = React.memo(
  ({ id, color, setColor, closeEditor, active, layout }) => {
    const indicatorPanRef = useRef<PanGestureHandler>(null);
    const tapRef = useRef<TapGestureHandler>(null);

    const [_, setRenderKey] = useState(0);
    const [tapState, undoState, confirmState, indicatorPanState] = useValues(
      [
        State.UNDETERMINED,
        State.UNDETERMINED,
        State.UNDETERMINED,
        State.UNDETERMINED,
      ],
      []
    );

    const [
      indicatorDragX,
      indicatorDragY,
      indicatorPosX,
      indicatorPosY,
      hue,
    ] = useValues<number>([0, 0, 0, 0, 0, 0, 0, 0, 0], []);

    const indicatorPanHandler = onGestureEvent({
      state: indicatorPanState,
      translationX: indicatorDragX,
      translationY: indicatorDragY,
      x: indicatorPosX,
      y: indicatorPosY,
    });

    const tapHandler = onGestureEvent({ state: tapState });
    const undoHandler = onGestureEvent({ state: undoState });
    const confirmHandler = onGestureEvent({ state: confirmState });

    const [
      transition,
      pressInTransition,
      undoPressIn,
      confirmPressIn,
    ] = useMemoOne(
      () => [
        withTransition(and(neq(id, -1), bin(active)), {
          duration: TRANSITION_DURATION,
          easing: Easing.inOut(Easing.ease),
        }),
        withSpringTransition(eq(tapState, State.BEGAN)),
        withTransition(eq(undoState, State.BEGAN)),
        withTransition(eq(confirmState, State.BEGAN)),
      ],
      [active]
    );

    const [controlTransition] = useMemoOne(
      () => [withSpringTransition(eq(transition, 1), SPRING_CONFIG)],
      [active]
    );

    const indicatorLeft = clamp(indicatorPosX, INDICATOR_MIN, INDICATOR_MAX);
    const indicatorTop = clamp(indicatorPosY, INDICATOR_MIN, INDICATOR_MAX);

    const s = divide(
      sub(indicatorLeft, INDICATOR_MIN),
      INDICATOR_MAX - INDICATOR_MIN
    );

    const v = divide(
      sub(indicatorTop, INDICATOR_MIN),
      INDICATOR_MAX - INDICATOR_MIN
    );

    const backgroundColor = colorHSV(hue, s, v);

    const resetPositions = [
      set(hue, color.h),
      set(indicatorPosX, mix(color.s, INDICATOR_MIN, INDICATOR_MAX)),
      set(indicatorPosY, mix(color.v, INDICATOR_MIN, INDICATOR_MAX)),
      call([], () => setRenderKey((prevState) => prevState + 1)),
    ];

    useCode(
      () => [
        onChange(
          confirmState,
          cond(eq(confirmState, State.END), [
            [
              call([backgroundColor], ([color]) => {
                const hex = color.toString(16).substring(2);
                const newColor = tinycolor(hex).toHexString();

                setColor(newColor);
              }),
              set(id, -1),
            ],
          ])
        ),
      ],
      []
    );

    useCode(
      () => [
        onChange(tapState, cond(eq(tapState, State.END), set(id, -1))),
        onChange(id, cond(neq(id, -1), resetPositions)),
        onChange(undoState, cond(eq(undoState, State.END), resetPositions)),
      ],
      []
    );

    useCode(
      () => [
        cond(
          and(eq(id, -1), not(transition), bin(active)),
          call([], closeEditor)
        ),
      ],
      [active]
    );

    const animatedEditorStyle = {
      opacity: bin(active),
      transform: [{ scale: mix(pressInTransition, 1, 0.95) }],
      top: mix(transition, layout.y, TOP),
      left: mix(transition, layout.x, LEFT),
      height: mix(transition, layout.height, EDITOR_SIZE),
      width: mix(transition, layout.width, EDITOR_SIZE),
      borderRadius: mix(transition, divide(layout.height, 2), 30),
      backgroundColor,
    };

    const scale = (transition: Animated.Node<number>) => ({
      scale: mix(transition, 1, 0.8),
    });

    return (
      <View style={styles.container} pointerEvents={active ? "auto" : "none"}>
        <TapGestureHandler
          ref={tapRef}
          waitFor={indicatorPanRef}
          {...tapHandler}
        >
          <Animated.View
            style={{
              ...styles.background,
              opacity: mix(transition, 0, 0.7),
            }}
          />
        </TapGestureHandler>
        <Animated.View
          style={{
            ...styles.buttonContainer,
            marginTop: mix(controlTransition, -70, 70),
            opacity: controlTransition,
          }}
        >
          <TapGestureHandler {...undoHandler}>
            <Animated.View style={{ transform: [scale(undoPressIn)] }}>
              <Undo width={40} height={40} />
            </Animated.View>
          </TapGestureHandler>

          <TapGestureHandler {...confirmHandler}>
            <Animated.View style={{ transform: [scale(confirmPressIn)] }}>
              <Check width={40} height={40} />
            </Animated.View>
          </TapGestureHandler>
        </Animated.View>

        <Animated.View
          style={{
            ...styles.sliderContainer,
            marginTop: mix(controlTransition, -10, 10),
            opacity: controlTransition,
          }}
        >
          <Slider
            style={{ width: EDITOR_SIZE - 50 }}
            trackColor={backgroundColor}
            value={hue}
            range={[0, 360]}
          />
        </Animated.View>

        <PanGestureHandler ref={indicatorPanRef} {...indicatorPanHandler}>
          <Animated.View style={[styles.editor, animatedEditorStyle]}>
            <Animated.View
              style={{
                ...styles.indicator,
                opacity: transition,
                top: indicatorTop,
                left: indicatorLeft,
                transform: [
                  { translateX: -INDICATOR_SIZE / 2 },
                  { translateY: -INDICATOR_SIZE / 2 },
                ],
              }}
            />
          </Animated.View>
        </PanGestureHandler>
      </View>
    );
  },
  (p, n) => p.active === n.active
);

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.gray,
  },
  editor: {
    overflow: "hidden",
    position: "absolute",
    borderWidth: COLOR_BORDER_WIDTH,
  },
  sliderContainer: {
    position: "absolute",
    top: TOP + EDITOR_SIZE,
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 17,
    backgroundColor: Colors.mediumGray,
  },
  buttonContainer: {
    position: "absolute",
    justifyContent: "space-around",
    width: EDITOR_SIZE,
    top: TOP + EDITOR_SIZE,
    flexDirection: "row",
  },
  indicator: {
    width: INDICATOR_SIZE,
    height: INDICATOR_SIZE,
    borderRadius: INDICATOR_SIZE / 2,
    borderColor: Colors.white,
    borderWidth: 4,
  },
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(ColorEditor);
