import React, { useRef } from "react";
import Animated, { Easing, onChange, useCode } from "react-native-reanimated";
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
import { useSelector } from "react-redux";

import * as selectors from "@redux/selectors";
import { FillColors } from "@lib";
import CloseIcon from "@assets/svg/close.svg";

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
  visible: Animated.Value<0 | 1>;
  onChoose: (color: string) => void;
}

interface ColorProps {
  index: number;
  panRef: any;
  openTransition: Animated.Node<number>;
  closeTransition: Animated.Node<number>;
  color: string;
  onChoose: (color: string) => void;
}

const Color: React.FC<ColorProps> = React.memo(
  ({
    index,
    color: backgroundColor,
    panRef,
    openTransition,
    onChoose,
    closeTransition
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
              { rotate: `${index * ANGLE_INCREMENT}deg` },
              { translateY: bInterpolate(openTransition, 0, 150) },
              { translateY: bInterpolate(closeTransition, 0, -30) }
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
  (p, n) => p.color === n.color && p.index === n.index
);

export const ColorPicker: React.FC<ColorPickerProps> = React.memo(
  ({ onChoose, visible }) => {
    const enabled = useSelector(selectors.canvasEnabled);

    const enabledTransition = useSpringTransition(enabled, config);

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
    ] = useValues<number>(
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      []
    );

    const [panState, tapState] = useValues<State>(
      [State.UNDETERMINED, State.UNDETERMINED],
      []
    );

    const [openTransition, closeTransition] = useMemoOne(
      () => [
        withSpringTransition(visible, config),
        withTransition(
          or(eq(tapState, State.ACTIVE), eq(tapState, State.BEGAN)),
          { duration: 200, easing: Easing.inOut(Easing.ease) }
        )
      ],
      []
    );

    const [panHandler, tapHandler] = useMemoOne(
      () => [
        onGestureEvent({
          state: panState,
          x,
          y,
          velocityX,
          velocityY,
          translationX,
          translationY
        }),
        onGestureEvent({ state: tapState })
      ],
      []
    );

    useCode(
      () => [
        onChange(tapState, cond(eq(tapState, State.END), set(visible, 0))),
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
            add(multiply(x, x), multiply(y, y))
          )
        )
      ],
      []
    );

    const rotate = withDecay({
      velocity,
      value: cond(defined(angle), multiply(-1, angle), 0),
      state: panState
    });

    const translateY = bInterpolate(openTransition, 75, -10);
    const scale = bInterpolate(openTransition, 0, 1);

    const opacity = bInterpolate(enabledTransition, 0.5, 1);
    return (
      <PanGestureHandler ref={panRef} {...panHandler}>
        <Animated.View
          style={[styles.container, { transform: [{ translateY }] }]}
        >
          <Animated.View
            pointerEvents={enabled ? "auto" : "none"}
            style={{
              transform: [
                { rotate },
                {
                  rotate: bInterpolate(openTransition, -Math.PI / 4, 0)
                }
              ],
              opacity
            }}
          >
            {FillColors.map((color, index) => (
              <Color
                key={index}
                {...{
                  color,
                  index,
                  panRef,
                  onChoose,
                  openTransition,
                  closeTransition
                }}
              />
            ))}
          </Animated.View>
          <TapGestureHandler {...tapHandler}>
            <Animated.View
              style={[
                styles.closeButton,
                {
                  transform: [
                    { scale },
                    { scale: bInterpolate(closeTransition, 1, 0.9) }
                  ]
                }
              ]}
            >
              <CloseIcon width={70} height={70} />
            </Animated.View>
          </TapGestureHandler>
        </Animated.View>
      </PanGestureHandler>
    );
  },
  () => true
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
    bottom: 20
  }
});
