import React, { useRef } from "react";
import Animated, {
  Easing,
  useCode,
  interpolate,
  Extrapolate
} from "react-native-reanimated";
import { StyleSheet, Text } from "react-native";
import tinycolor from "tinycolor2";
import {
  State,
  TapGestureHandler,
  LongPressGestureHandler
} from "react-native-gesture-handler";
import {
  useValues,
  onGestureEvent,
  bInterpolate,
  withSpringTransition,
  withTransition
} from "react-native-redash";
import Haptics from "react-native-haptic-feedback";
import { useMemoOne } from "use-memo-one";
import { connect, ConnectedProps } from "react-redux";

import * as selectors from "@redux/selectors";
import {
  colorHSV,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  COLOR_WHEEL_RADIUS,
  COLOR_BORDER_WIDTH,
  COLOR_SIZE
} from "@lib";
import { RootState } from "@redux/types";
import {
  PaletteActions,
  CanvasActions,
  VisualizationActions
} from "@redux/modules";

const { color, onChange, set, or, eq, sub, cond, add, call } = Animated;

export interface SwatchProps {
  index: number;
  active: Animated.Adaptable<0 | 1>;
  absoluteY: Animated.Value<number>;
  x0: Animated.Value<number>;
  x: Animated.Value<number>;
  y: Animated.Value<number>;
  panRef: any;
  editingColor: Animated.Value<number>;
  openTransition: Animated.Node<number>;
}

export type SwatchConnectedProps = ConnectedProps<typeof connector>;

const mapStateToProps = (state: RootState, props: SwatchProps) => ({
  fill: selectors.color(state, props),
  rotate: selectors.angleIncrement(state) * props.index
});

const mapDispatchToProps = {
  setColor: PaletteActions.set,
  selectColor: VisualizationActions.selectColor
};

const Swatch: React.FC<SwatchProps & SwatchConnectedProps> = React.memo(
  ({
    active,
    setColor,
    index,
    editingColor, // shared value between all colors
    x0,
    x,
    y,
    absoluteY,
    rotate,
    fill,
    panRef,
    openTransition,
    selectColor
  }) => {
    const tapRef = useRef<TapGestureHandler>(null);
    const longPressRef = useRef<LongPressGestureHandler>(null);

    const [editing] = useValues([0], []);

    const [longPressState, tapState] = useValues(
      [State.UNDETERMINED, State.UNDETERMINED],
      []
    );

    const [activeTransition, editingTransition] = useMemoOne(
      () => [
        withTransition(
          or(
            eq(tapState, State.ACTIVE),
            eq(tapState, State.BEGAN),
            eq(longPressState, State.ACTIVE),
            eq(longPressState, State.BEGAN)
          ),
          {
            duration: 200,
            easing: Easing.inOut(Easing.ease)
          }
        ),
        withSpringTransition(or(editing, active))
      ],
      []
    );

    const handleOnChoose = () => {
      Haptics.trigger("impactMedium");
      selectColor(fill);
    };

    useCode(
      () => [
        onChange(
          tapState,
          cond(eq(tapState, State.END), call([], handleOnChoose))
        ),
        onChange(
          longPressState,
          cond(
            eq(longPressState, State.ACTIVE),
            [
              set(editing, 1),
              set(editingColor, 1),
              call([], () => Haptics.trigger("impactMedium"))
            ],
            cond(eq(longPressState, State.END), [
              call([interpolatedColor], ([color]) => {
                Haptics.trigger("impactHeavy");

                const hex = color.toString(16).substring(2);
                const newColor = tinycolor(hex).toHexString();

                setColor(newColor, index);
              }),
              set(editingColor, 0),
              set(x, 0),
              set(y, 0),
              set(editing, 0)
            ])
          )
        )
      ],
      [fill]
    );

    const [longPressHandler, tapHandler] = useMemoOne(
      () => [
        onGestureEvent({ state: longPressState }),
        onGestureEvent({ state: tapState })
      ],
      []
    );

    const { h, s, v, r, g, b } = useMemoOne(() => {
      const c = tinycolor(fill);

      return { ...c.toHsv(), ...c.toRgb() };
    }, [fill]);

    const interpolatedColor = useMemoOne(
      () =>
        colorHSV(
          h,
          interpolate(add(s, x), {
            inputRange: [
              sub(s, SCREEN_WIDTH / 2, x0),
              s,
              add(s, sub(SCREEN_WIDTH / 2, x0))
            ],
            outputRange: [0.1, s, 1],
            extrapolate: Extrapolate.CLAMP
          }),
          interpolate(add(v, y), {
            inputRange: [
              sub(v, SCREEN_HEIGHT, sub(absoluteY, y)),
              v,
              add(v, sub(absoluteY, y))
            ],
            outputRange: [0.1, v, 1],
            extrapolate: Extrapolate.CLAMP
          })
        ),
      [fill]
    );

    const backgroundColor = cond(editing, interpolatedColor, color(r, g, b));
    const borderRadius = bInterpolate(
      activeTransition,
      COLOR_SIZE / 2,
      COLOR_SIZE / 4
    );
    const colorTransform = [
      { scale: bInterpolate(activeTransition, 1, 1.45) },
      { scale: bInterpolate(editingTransition, 1, 1.3) }
    ];
    const colorContainerTransform = [
      { rotate },
      { translateX: bInterpolate(openTransition, 0, COLOR_WHEEL_RADIUS) }
    ];

    return (
      <TapGestureHandler
        {...tapHandler}
        simultaneousHandlers={[panRef, longPressRef]}
        maxDurationMs={500}
        maxDeltaX={10}
        maxDeltaY={10}
      >
        <Animated.View
          style={{
            alignItems: "center",
            justifyContent: "center",
            transform: colorContainerTransform
          }}
        >
          <LongPressGestureHandler
            {...longPressHandler}
            simultaneousHandlers={[tapRef, panRef]}
          >
            <Animated.View
              style={[
                styles.color,
                {
                  backgroundColor,
                  borderRadius,
                  transform: colorTransform
                }
              ]}
            />
          </LongPressGestureHandler>
        </Animated.View>
      </TapGestureHandler>
    );
  },
  (p, n) => p.fill === n.fill && p.index === n.index
);

const styles = StyleSheet.create({
  color: {
    position: "absolute",
    borderWidth: COLOR_BORDER_WIDTH,
    height: COLOR_SIZE,
    width: COLOR_SIZE
  }
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(Swatch);
