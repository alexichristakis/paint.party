import React, { useRef } from "react";
import Animated, {
  Easing,
  interpolate,
  onChange,
  useCode
} from "react-native-reanimated";
import { StyleSheet } from "react-native";
import {
  State,
  PanGestureHandler,
  TapGestureHandler
} from "react-native-gesture-handler";
import {
  useValues,
  onGestureEvent,
  bInterpolate,
  withDecay,
  withSpringTransition,
  useSpringTransition,
  withTransition
} from "react-native-redash";
import Haptics from "react-native-haptic-feedback";
import { useMemoOne } from "use-memo-one";

import { FillColors, onGestureChange } from "@lib";
import CloseIcon from "@assets/svg/close.svg";

const { set, or, eq, neq, sub, cond, call } = Animated;

const COLOR_SIZE = 60;
const ANGLE_INCREMENT = 360 / FillColors.length;

const config = {
  damping: 40,
  mass: 1,
  stiffness: 300,
  overshootClamping: false,
  restSpeedThreshold: 0.1,
  restDisplacementThreshold: 0.1
};

export interface ColorPickerProps {
  enabled: boolean;
  visible: Animated.Value<0 | 1>;
  cell: number;
  onChoose: (cell: number, color: string) => void;
}

interface ColorProps {
  index: number;
  panRef: any;
  enabled: boolean;
  openTransition: Animated.Node<number>;
  enabledTransition: Animated.Node<number>;
  color: string;
  onChoose: (color: string) => void;
}

const Color: React.FC<ColorProps> = ({
  index,
  color: backgroundColor,
  panRef,
  openTransition,
  enabledTransition,
  enabled,
  onChoose
}) => {
  const [state, prevState] = useValues(
    [State.UNDETERMINED, State.UNDETERMINED],
    []
  );

  const activeTransition = useMemoOne(
    () =>
      withTransition(or(eq(state, State.BEGAN), eq(state, State.ACTIVE)), {
        duration: 200,
        easing: Easing.inOut(Easing.ease)
      }),
    []
  );

  const handleOnChoose = () => {
    Haptics.trigger("impactMedium");
    onChoose(backgroundColor);
  };

  useCode(
    () => [
      onGestureChange(state, prevState, [
        cond(eq(state, State.END), call([], handleOnChoose)),
        cond(
          eq(state, State.BEGAN),
          call([], () => Haptics.trigger("impactLight"))
        )
      ])
    ],
    []
  );

  const tapHandler = onGestureEvent({
    state
  });

  const [scale, borderRadius, opacity, translateY] = useMemoOne(
    () => [
      bInterpolate(activeTransition, 1, 1.45),
      bInterpolate(activeTransition, COLOR_SIZE / 2, COLOR_SIZE / 4),
      bInterpolate(enabledTransition, 0.5, 1),
      bInterpolate(openTransition, 0, 150)
    ],
    []
  );

  return (
    <TapGestureHandler
      {...tapHandler}
      simultaneousHandlers={panRef}
      maxDeltaX={10}
      maxDeltaY={10}
      enabled={enabled}
    >
      <Animated.View
        style={{
          opacity,
          alignItems: "center",
          transform: [
            { rotate: `${index * ANGLE_INCREMENT}deg` },
            { translateY }
          ]
        }}
      >
        <Animated.View
          style={[
            styles.color,
            {
              // borderWidth,
              borderRadius,
              backgroundColor,
              transform: [{ scale }]
            }
          ]}
        />
      </Animated.View>
    </TapGestureHandler>
  );
};

export const ColorPicker: React.FC<ColorPickerProps> = React.memo(
  ({ onChoose, cell, enabled, visible }) => {
    const panRef = useRef<PanGestureHandler>(null);
    const [dragX, dragY, velocityX, velocityY] = useValues<number>(
      [0, 0, 0, 0],
      []
    );
    const [panState, tapState] = useValues<State>(
      [State.UNDETERMINED, State.UNDETERMINED],
      []
    );

    const openTransition = useMemoOne(
      () => withSpringTransition(visible, config),
      []
    );

    const enabledTransition = useSpringTransition(enabled, config);

    const [panHandler, tapHandler] = useMemoOne(
      () => [
        onGestureEvent({
          translationX: dragX,
          translationY: dragY,
          state: panState,
          velocityX,
          velocityY
        }),
        onGestureEvent({ state: tapState })
      ],
      []
    );

    const scroll = useMemoOne(
      () =>
        withDecay({
          state: panState,
          value: sub(dragX, dragY),
          velocity: sub(velocityX, velocityY)
        }),
      []
    );

    const angle = (index: number) =>
      interpolate(scroll, {
        inputRange: [0, 100],
        outputRange: [index * ANGLE_INCREMENT, (index + 1) * ANGLE_INCREMENT]
      });

    useCode(
      () => [
        onChange(tapState, cond(eq(tapState, State.END), [set(visible, 0)]))
      ],
      []
    );

    const translateY = bInterpolate(openTransition, 75, -10);
    const rotate = interpolate(scroll, {
      inputRange: [0, 100],
      outputRange: [1, 2]
    });
    const scale = bInterpolate(openTransition, 0, 1);
    return (
      <PanGestureHandler ref={panRef} {...panHandler}>
        <Animated.View
          style={[styles.container, { transform: [{ translateY }] }]}
        >
          <Animated.View style={{ transform: [{ rotate }] }}>
            {FillColors.map((color, index) => (
              <Color
                key={index}
                {...{
                  index,
                  panRef,
                  onChoose: color => onChoose(cell, color),
                  openTransition,
                  enabledTransition,
                  enabled,
                  color
                }}
              />
            ))}
          </Animated.View>
          <TapGestureHandler {...tapHandler}>
            <Animated.View
              style={[styles.closeButton, { transform: [{ scale }] }]}
            >
              <CloseIcon width={70} height={70} />
            </Animated.View>
          </TapGestureHandler>
        </Animated.View>
      </PanGestureHandler>
    );
  },
  (p, n) => p.enabled === n.enabled && p.cell === n.cell
);

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    alignItems: "center",
    bottom: 0
  },
  color: {
    position: "absolute",
    borderWidth: 3,
    height: COLOR_SIZE,
    width: COLOR_SIZE
  },
  closeButton: {
    position: "absolute",
    bottom: 35
  }
});
