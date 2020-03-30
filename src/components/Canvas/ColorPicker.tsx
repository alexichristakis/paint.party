import React, { useEffect } from "react";
import Animated, { Easing, onChange, useCode } from "react-native-reanimated";
import { StyleSheet } from "react-native";
import { State, TapGestureHandler } from "react-native-gesture-handler";
import {
  useValues,
  onGestureEvent,
  bInterpolate,
  withSpringTransition,
  withTransition,
  useSpringTransition,
  bin
} from "react-native-redash";
import Haptics from "react-native-haptic-feedback";
import { useMemoOne } from "use-memo-one";
import isNull from "lodash/isNull";

import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import CloseIcon from "@assets/svg/close.svg";
import CheckIcon from "@assets/svg/check.svg";

import ColorWheel from "./ColorWheel";
import { connect, ConnectedProps } from "react-redux";
import { CanvasActions } from "@redux/modules";

const { set, and, sub, or, eq, cond, call } = Animated;

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
}

export type ColorPickerConnectedProps = ConnectedProps<typeof connector>;

const mapStateToProps = (state: RootState) => ({
  colorSelected: !isNull(selectors.selectedColor(state))
});
const mapDispatchToProps = {
  draw: CanvasActions.draw
};

const ColorPicker: React.FC<ColorPickerProps &
  ColorPickerConnectedProps> = React.memo(
  ({ visible, colorSelected, draw }) => {
    const [tapState, colorSelectedValue] = useValues<State>(
      [State.UNDETERMINED, bin(colorSelected)],
      []
    );

    useEffect(() => {
      colorSelectedValue.setValue(bin(colorSelected));
    }, [colorSelected]);

    const [openTransition, pressInTransition] = useMemoOne(
      () => [
        withSpringTransition(visible, config),
        withTransition(
          or(eq(tapState, State.ACTIVE), eq(tapState, State.BEGAN)),
          { duration: 200, easing: Easing.inOut(Easing.ease) }
        )
      ],
      []
    );

    const [tapHandler] = useMemoOne(
      () => [onGestureEvent({ state: tapState })],
      []
    );

    useCode(
      () => [
        onChange(
          tapState,
          cond(eq(tapState, State.END), [
            call([], () => Haptics.trigger("impactLight")),
            set(visible, 0),
            cond(
              colorSelectedValue,
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

    const handleOnChoose = () => visible.setValue(0);

    const colorSelectedTransition = useSpringTransition(colorSelected, config);
    return (
      <>
        <ColorWheel
          onChoose={handleOnChoose}
          openTransition={openTransition}
          closeTransition={pressInTransition}
        />
        <TapGestureHandler maxDist={20} {...tapHandler}>
          <Animated.View
            style={{
              ...styles.button,
              transform: [
                { scale: bInterpolate(openTransition, 0, 1) },
                { scale: bInterpolate(pressInTransition, 1, 0.9) },
                { translateY: bInterpolate(openTransition, 75, -10) }
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
      </>
    );
  },
  (p, n) => p.colorSelected === n.colorSelected
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
export default connector(ColorPicker);
