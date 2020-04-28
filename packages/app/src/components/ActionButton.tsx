import React from "react";
import { StyleSheet } from "react-native";
import { State, TapGestureHandler } from "react-native-gesture-handler";
import Haptics from "react-native-haptic-feedback";
import Animated, { Easing } from "react-native-reanimated";
import {
  onGestureEvent,
  useValues,
  withSpringTransition,
  mix,
  withTransition,
} from "react-native-redash";
import { useMemoOne } from "use-memo-one";

import Plus from "@assets/svg/plus.svg";
import Grid from "@assets/svg/grid.svg";
import Dots from "@assets/svg/dots.svg";

const { onChange, or, useCode, cond, eq, not, call, set } = Animated;

const config = {
  damping: 50,
  mass: 1,
  stiffness: 500,
  overshootClamping: false,
  restSpeedThreshold: 0.1,
  restDisplacementThreshold: 0.1,
};

export interface ActionButtonProps {
  onPressAction1: () => void;
  onPressAction2: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = React.memo(
  ({ onPressAction1, onPressAction2 }) => {
    const [state, action1State, action2State] = useValues(
      [State.UNDETERMINED, State.UNDETERMINED, State.UNDETERMINED],
      []
    );
    const [active] = useValues([0], []);

    const handler = onGestureEvent({ state });
    const action1Handler = onGestureEvent({ state: action1State });
    const action2Handler = onGestureEvent({ state: action2State });

    const [
      mainPressedTransition,
      activeTransition,
      action1PressedTransition,
      action2PressedTransition,
    ] = useMemoOne(
      () => [
        withSpringTransition(
          or(eq(state, State.BEGAN), eq(state, State.ACTIVE)),
          config
        ),
        withTransition(active, { easing: Easing.elastic(1), duration: 400 }),
        withTransition(eq(action1State, State.BEGAN)),
        withTransition(eq(action2State, State.BEGAN)),
      ],
      []
    );

    useCode(
      () => [
        onChange(
          state,
          cond(eq(state, State.END), [
            set(active, not(active)),
            call([], () => {
              Haptics.trigger("impactLight");
            }),
          ])
        ),
        onChange(
          action1State,
          cond(
            eq(action1State, State.END),
            call([], () => {
              Haptics.trigger("impactLight");
              onPressAction1();
            })
          )
        ),
        onChange(
          action2State,
          cond(
            eq(action2State, State.END),
            call([], () => {
              Haptics.trigger("impactLight");
              onPressAction2();
            })
          )
        ),
      ],
      []
    );

    const scale = (transition: Animated.Node<number>) => ({
      scale: mix(transition, 1, 0.8),
    });

    const translate = mix(activeTransition, 0, -90);
    return (
      <Animated.View style={styles.buttonContainer}>
        <TapGestureHandler {...action1Handler}>
          <Animated.View
            style={[
              styles.button,
              {
                transform: [
                  { translateY: translate },
                  scale(action1PressedTransition),
                ],
              },
            ]}
          >
            <Grid width={50} height={50} />
          </Animated.View>
        </TapGestureHandler>

        <TapGestureHandler {...action2Handler}>
          <Animated.View
            style={[
              styles.button,
              {
                transform: [
                  { translateX: translate },
                  scale(action2PressedTransition),
                ],
              },
            ]}
          >
            <Dots width={50} height={50} />
          </Animated.View>
        </TapGestureHandler>

        <TapGestureHandler maxDist={20} {...handler}>
          <Animated.View
            style={{
              transform: [
                scale(mainPressedTransition),
                { rotate: mix(activeTransition, 0, Math.PI / 4) },
              ],
            }}
          >
            <Plus width={75} height={75} />
          </Animated.View>
        </TapGestureHandler>
      </Animated.View>
    );
  }
);

const styles = StyleSheet.create({
  button: {
    position: "absolute",
  },
  buttonContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    right: 20,
    bottom: 40,
  },
});

export default ActionButton;
