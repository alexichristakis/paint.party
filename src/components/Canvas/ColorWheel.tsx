import React, { useRef } from "react";
import Animated, {
  Easing,
  onChange,
  useCode,
  debug
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
  withTransition
} from "react-native-redash";
import Haptics from "react-native-haptic-feedback";
import { useMemoOne } from "use-memo-one";

const {
  divide,
  atan,
  defined,
  set,
  or,
  eq,
  sub,
  cond,
  add,
  call,
  multiply
} = Animated;

const COLOR_SIZE = 60;

export interface ColorWheelProps {
  radius: number;
  colors: string[];
  enabled: Animated.Node<number>;
  visible: Animated.Node<number>;
  closing: Animated.Node<number>;
  onChoose: (color: string) => void;
  angleOffset?: number;
}

interface ColorProps {
  radius: number;
  rotate: number;
  panRef: any;
  visible: Animated.Node<number>;
  closing: Animated.Node<number>;
  color: string;
  onChoose: (color: string) => void;
}

const Color: React.FC<ColorProps> = React.memo(
  ({
    rotate,
    radius,
    color: backgroundColor,
    panRef,
    visible,
    onChoose,
    closing
  }) => {
    const [state] = useValues([State.UNDETERMINED], []);

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
        onChange(state, cond(eq(state, State.END), call([], handleOnChoose)))
      ],
      []
    );

    const tapHandler = onGestureEvent({
      state
    });

    return (
      <TapGestureHandler
        {...tapHandler}
        simultaneousHandlers={panRef}
        maxDeltaX={10}
        maxDeltaY={10}
      >
        <Animated.View
          style={{
            alignItems: "center",
            transform: [
              { rotate },
              { translateY: bInterpolate(visible, 0, radius) },
              { translateY: bInterpolate(closing, 0, -30) }
            ]
          }}
        >
          <Animated.View
            style={[
              styles.color,
              {
                borderRadius: bInterpolate(
                  activeTransition,
                  COLOR_SIZE / 2,
                  COLOR_SIZE / 4
                ),
                backgroundColor,
                transform: [{ scale: bInterpolate(activeTransition, 1, 1.45) }]
              }
            ]}
          />
        </Animated.View>
      </TapGestureHandler>
    );
  },
  (p, n) => p.color === n.color
);

const ColorWheel: React.FC<ColorWheelProps> = ({
  colors,
  radius,
  onChoose,
  closing,
  enabled,
  visible,
  angleOffset = 0
}) => {
  const panRef = useRef<PanGestureHandler>(null);

  const [
    x,
    y,
    translationX,
    translationY,
    velocityX,
    velocityY,
    velocity,
    angle
  ] = useValues<number>([0, 0, 0, 0, 0, 0, 0, 0], []);

  const [panState] = useValues<State>([State.UNDETERMINED], []);

  const [panHandler] = useMemoOne(
    () => [
      onGestureEvent({
        state: panState,
        x,
        y,
        velocityX,
        velocityY,
        translationX,
        translationY
      })
    ],
    []
  );

  useCode(
    () => [
      set(
        angle,
        sub(
          atan(
            divide(sub(x, translationX), multiply(-1, sub(y, translationY)))
          ),
          atan(divide(x, multiply(-1, y)))
        )
      ),

      set(
        velocity,
        divide(
          sub(multiply(x, velocityY), multiply(y, velocityX)),
          add(multiply(x, x), multiply(y, y)) // add 1 to avoid NaN
        )
      )
    ],
    []
  );

  const rotate = withDecay({
    velocity,
    value: cond(defined(angle), multiply(-1, angle)),
    state: panState
  });

  const opacity = bInterpolate(enabled, 0.5, 1);

  const rotationStyle = {
    transform: [
      { rotate: cond(defined(rotate), rotate, 0) },
      { rotate: bInterpolate(visible, -Math.PI / 4, 0) }
    ]
  };

  const angleIncrement = (2 * Math.PI) / colors.length;
  return (
    <PanGestureHandler ref={panRef} {...panHandler}>
      <Animated.View
        pointerEvents={enabled ? "auto" : "none"}
        style={[rotationStyle, { opacity }]}
      >
        {colors.map((color, index) => (
          <Color
            key={index}
            rotate={angleIncrement * index + angleOffset}
            {...{ color, radius, panRef, onChoose, visible, closing }}
          />
        ))}
      </Animated.View>
    </PanGestureHandler>
  );
};

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
    bottom: 20
  }
});

export default ColorWheel;
