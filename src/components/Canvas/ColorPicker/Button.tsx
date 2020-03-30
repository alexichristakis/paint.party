import React, { useEffect } from "react";
import Animated, { Easing, onChange, useCode } from "react-native-reanimated";
import { StyleSheet } from "react-native";
import { State, TapGestureHandler } from "react-native-gesture-handler";
import {
  useValues,
  onGestureEvent,
  bInterpolate,
  withTransition,
  useSpringTransition,
  bin
} from "react-native-redash";
import Haptics from "react-native-haptic-feedback";
import { useMemoOne } from "use-memo-one";
import { connect, ConnectedProps } from "react-redux";
import isNull from "lodash/isNull";

import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { CanvasActions, VisualizationActions } from "@redux/modules";
import CloseIcon from "@assets/svg/close.svg";
import CheckIcon from "@assets/svg/check.svg";

const { set, or, eq, cond, call } = Animated;

const config = {
  damping: 40,
  mass: 1,
  stiffness: 300,
  overshootClamping: false,
  restSpeedThreshold: 0.1,
  restDisplacementThreshold: 0.1
};

export interface ButtonProps {
  state: Animated.Value<State>;
  visible: Animated.Value<0 | 1>;
  openTransition: Animated.Node<number>;
}

export type ButtonConnectedProps = ConnectedProps<typeof connector>;

const mapStateToProps = (state: RootState) => ({
  isColorSelected: !isNull(selectors.selectedColor(state))
});
const mapDispatchToProps = {
  draw: VisualizationActions.draw
};

const Button: React.FC<ButtonProps & ButtonConnectedProps> = React.memo(
  ({ state, visible, openTransition, isColorSelected, draw }) => {
    const [isColorSelectedValue] = useValues<State>([bin(isColorSelected)], []);

    useEffect(() => {
      isColorSelectedValue.setValue(bin(isColorSelected));
    }, [isColorSelected]);

    const pressInTransition = useMemoOne(
      () =>
        withTransition(or(eq(state, State.ACTIVE), eq(state, State.BEGAN)), {
          duration: 200,
          easing: Easing.inOut(Easing.ease)
        }),
      []
    );

    const [tapHandler] = useMemoOne(() => [onGestureEvent({ state })], []);

    useCode(
      () => [
        onChange(
          state,
          cond(eq(state, State.END), [
            call([], () => Haptics.trigger("impactLight")),
            set(visible, 0),
            cond(
              isColorSelectedValue,
              [
                //
                call([], () => draw())
              ],
              [
                //
              ]
            )
          ])
        )
      ],
      []
    );

    const colorSelectedTransition = useSpringTransition(
      isColorSelected,
      config
    );
    return (
      <TapGestureHandler maxDist={20} {...tapHandler}>
        <Animated.View
          style={{
            ...styles.button,
            transform: [
              { scale: bInterpolate(pressInTransition, 1, 0.9) },
              { translateY: bInterpolate(openTransition, 100, -10) }
            ]
          }}
        >
          <Animated.View
            style={{
              position: "absolute",
              transform: [
                { scale: bInterpolate(colorSelectedTransition, 1, 0.5) }
              ]
            }}
          >
            <CloseIcon width={70} height={70} />
          </Animated.View>
          <Animated.View
            style={{
              position: "absolute",
              opacity: colorSelectedTransition,
              transform: [{ scale: colorSelectedTransition }]
            }}
          >
            <CheckIcon width={70} height={70} />
          </Animated.View>
        </Animated.View>
      </TapGestureHandler>
    );
  },
  (p, n) => p.isColorSelected === n.isColorSelected
);

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    bottom: 60
  }
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(Button);
