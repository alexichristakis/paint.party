import React, { useEffect, useContext, useMemo } from "react";
import Animated, { Easing, onChange, useCode } from "react-native-reanimated";
import { StyleSheet } from "react-native";
import { State, TapGestureHandler } from "react-native-gesture-handler";
import {
  useValues,
  onGestureEvent,
  mix,
  withTransition,
  useSpringTransition,
  bin,
  useTransition,
  useGestureHandler,
} from "react-native-redash";
import Haptics from "react-native-haptic-feedback";
import { useMemoOne } from "use-memo-one";
import { connect, ConnectedProps } from "react-redux";
import isNull from "lodash/isNull";

import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { VisualizationActions, PaletteActions } from "@redux/modules";

import EditIcon from "@assets/svg/edit.svg";
import CheckIcon from "@assets/svg/check.svg";
import { DrawContext, useReduxAction, connectToDraw } from "@hooks";

const { set, or, eq, cond, call } = Animated;

const config = {
  damping: 40,
  mass: 1,
  stiffness: 300,
  overshootClamping: false,
  restSpeedThreshold: 0.1,
  restDisplacementThreshold: 0.1,
};

export interface ButtonProps {
  state: Animated.Value<State>;
  visible: Animated.Value<0 | 1>;
  openTransition: Animated.Node<number>;
}

export type ButtonConnectedProps = {
  color: string;
};

const Button: React.FC<ButtonProps> = React.memo(
  ({ state, visible, openTransition }) => {
    const { draw, color } = useContext(DrawContext);

    const pressInTransition = useMemoOne(
      () =>
        withTransition(or(eq(state, State.ACTIVE), eq(state, State.BEGAN)), {
          duration: 200,
          easing: Easing.inOut(Easing.ease),
        }),
      []
    );

    const isColorSelected = !!color.length;
    const colorSelectedTransition = useTransition(isColorSelected, {
      easing: Easing.inOut(Easing.ease),
    });

    const tapHandler = useGestureHandler({ state }, []);
    const openPalettes = useReduxAction(PaletteActions.openEditor);

    useCode(
      () => [
        onChange(
          state,
          cond(eq(state, State.END), [
            call([], () => Haptics.trigger("impactLight")),
            cond(
              eq(colorSelectedTransition, 1),
              [
                //
                set(visible, 0),
                call([], draw),
              ],
              [
                //
                call([], openPalettes),
              ]
            ),
          ])
        ),
      ],
      [colorSelectedTransition, draw]
    );

    return useMemo(
      () => (
        <TapGestureHandler maxDist={20} {...tapHandler}>
          <Animated.View
            style={{
              ...styles.button,
              transform: [
                { scale: mix(pressInTransition, 1, 0.9) },
                { translateY: mix(openTransition, 100, -10) },
              ],
            }}
          >
            <Animated.View
              style={{
                position: "absolute",
                transform: [{ scale: mix(colorSelectedTransition, 1, 0.5) }],
              }}
            >
              <EditIcon width={70} height={70} />
            </Animated.View>
            <Animated.View
              style={{
                position: "absolute",
                opacity: colorSelectedTransition,
                transform: [{ scale: colorSelectedTransition }],
              }}
            >
              <CheckIcon width={70} height={70} />
            </Animated.View>
          </Animated.View>
        </TapGestureHandler>
      ),
      [openTransition, pressInTransition, tapHandler, colorSelectedTransition]
    );
  }
);

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    bottom: 60,
  },
});

export default Button;
