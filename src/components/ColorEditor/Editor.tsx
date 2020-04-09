import React, { useState, useRef, useLayoutEffect } from "react";
import Animated, {
  useCode,
  Easing,
  greaterOrEq,
  interpolate,
} from "react-native-reanimated";
import { connect, ConnectedProps } from "react-redux";
import {
  TapGestureHandler,
  PanGestureHandler,
  State,
} from "react-native-gesture-handler";
import { StyleSheet, ViewStyle, StyleProp } from "react-native";
import {
  useValues,
  bin,
  onGestureEvent,
  withSpringTransition,
  mix,
  withTransition,
  clamp,
  hsv2color,
} from "react-native-redash";
import tinycolor from "tinycolor2";
import { useMemoOne } from "use-memo-one";

import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { PaletteActions } from "@redux/modules";
import {
  SCREEN_WIDTH,
  COLOR_BORDER_WIDTH,
  Colors,
  SCREEN_HEIGHT,
  colorHSV,
  SPRING_CONFIG,
  EDITOR_SIZE,
  INDICATOR_SIZE,
  EDITOR_LEFT,
  EDITOR_TOP,
  INDICATOR_MIN,
  INDICATOR_MAX,
  onPress,
} from "@lib";
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

export type EditorConnectedProps = ConnectedProps<typeof connector>;

const mapStateToProps = (state: RootState) => ({
  color: selectors.editingColor(state),
  active: selectors.editingActive(state),
});

const mapDispatchToProps = {
  setColor: PaletteActions.set,
};

export interface EditorProps {
  id: Animated.Value<number>;
  transition: Animated.Node<number>;
  x: Animated.Value<number>;
  y: Animated.Value<number>;
  width: Animated.Value<number>;
  height: Animated.Value<number>;
}

export const bInterpolate = (
  value: number,
  origin: number,
  destination: number
) => origin + value * (destination - origin);

const Editor: React.FC<EditorProps & EditorConnectedProps> = React.memo(
  ({ id, transition, color, x, y, width, height, setColor }) => {
    const indicatorPanRef = useRef<PanGestureHandler>(null);

    const [pan, undo, confirm] = useValues(
      [State.UNDETERMINED, State.UNDETERMINED, State.UNDETERMINED],
      []
    );
    const [, setRenderKey] = useState(0);

    const { h, s, v } = tinycolor(color).toHsv();
    const [
      indicatorPosX,
      indicatorPosY,
      interpolatedHue,
      cachedH,
      cachedS,
      cachedV,
    ] = useValues<number>([0, 0, 0, 0, 0, 0], []);

    useLayoutEffect(() => {
      // cached values for undo
      cachedH.setValue(h);
      cachedS.setValue(s);
      cachedV.setValue(v);

      // values used to interpolate new color
      interpolatedHue.setValue(h);
      indicatorPosX.setValue(mix(s, INDICATOR_MIN, INDICATOR_MAX));
      indicatorPosY.setValue(mix(v, INDICATOR_MIN, INDICATOR_MAX));
    }, [color]);

    const controlTransition = useMemoOne(
      () => withTransition(eq(transition, 1)),
      []
    );

    const [panHandler, undoHandler, confirmHandler] = useMemoOne(
      () => [
        onGestureEvent({
          state: pan,
          x: indicatorPosX,
          y: indicatorPosY,
        }),
        onGestureEvent({ state: undo }),
        onGestureEvent({ state: confirm }),
      ],
      [pan, undo, confirm, indicatorPosX, indicatorPosY]
    );

    const indicatorLeft = clamp(indicatorPosX, INDICATOR_MIN, INDICATOR_MAX);
    const indicatorTop = clamp(indicatorPosY, INDICATOR_MIN, INDICATOR_MAX);

    const interpolatedS = divide(
      sub(indicatorLeft, INDICATOR_MIN),
      INDICATOR_MAX - INDICATOR_MIN
    );

    const interpolatedV = divide(
      sub(indicatorTop, INDICATOR_MIN),
      INDICATOR_MAX - INDICATOR_MIN
    );

    const backgroundColor = colorHSV(
      interpolatedHue,
      interpolatedS,
      interpolatedV
    );

    const resetPositions = [
      set(interpolatedHue, cachedH),
      set(indicatorPosX, mix(cachedS, INDICATOR_MIN, INDICATOR_MAX)),
      set(indicatorPosY, mix(cachedV, INDICATOR_MIN, INDICATOR_MAX)),
      call([], () => setRenderKey((prevKey) => prevKey + 1)),
    ];

    useCode(
      () => [
        onPress(undo, resetPositions),
        onPress(confirm, [
          call([backgroundColor], ([color]) => {
            const hex = color.toString(16).substring(2);
            const newColor = tinycolor(hex).toHexString();

            setColor(newColor);
          }),
          set(id, -1),
        ]),
      ],
      []
    );

    const animatedEditorStyle = {
      top: mix(transition, y, EDITOR_TOP),
      left: mix(transition, x, EDITOR_LEFT),
      height: mix(transition, height, EDITOR_SIZE),
      width: mix(transition, width, EDITOR_SIZE),
      borderRadius: mix(transition, divide(height, 2), 30),
      backgroundColor,
    };

    const animatedIndicatorStyle = {
      opacity: transition,
      top: indicatorTop,
      left: indicatorLeft,
    };

    return (
      <>
        <Animated.View
          style={{
            ...styles.buttonContainer,
            marginTop: mix(controlTransition, -70, 70),
            opacity: controlTransition,
          }}
        >
          <TapGestureHandler {...undoHandler}>
            <Animated.View>
              <Undo width={40} height={40} />
            </Animated.View>
          </TapGestureHandler>

          <TapGestureHandler {...confirmHandler}>
            <Animated.View>
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
            value={interpolatedHue}
            range={[0, 360]}
          />
        </Animated.View>

        <PanGestureHandler ref={indicatorPanRef} {...panHandler}>
          <Animated.View style={[styles.editor, animatedEditorStyle]}>
            <Animated.View style={[styles.indicator, animatedIndicatorStyle]} />
          </Animated.View>
        </PanGestureHandler>
      </>
    );
  },
  (p, n) => p.color === n.color
);

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContainer: {
    position: "absolute",
    justifyContent: "space-around",
    width: EDITOR_SIZE,
    top: EDITOR_TOP + EDITOR_SIZE,
    flexDirection: "row",
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
    top: EDITOR_TOP + EDITOR_SIZE,
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 17,
    backgroundColor: Colors.mediumGray,
  },
  indicator: {
    width: INDICATOR_SIZE,
    height: INDICATOR_SIZE,
    borderRadius: INDICATOR_SIZE / 2,
    borderColor: Colors.white,
    borderWidth: 4,
    transform: [
      { translateX: -INDICATOR_SIZE / 2 },
      { translateY: -INDICATOR_SIZE / 2 },
    ],
  },
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(Editor);
