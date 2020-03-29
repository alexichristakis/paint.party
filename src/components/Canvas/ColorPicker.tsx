import React from "react";
import Animated, { Easing, onChange, useCode } from "react-native-reanimated";
import { StyleSheet } from "react-native";
import { State, TapGestureHandler } from "react-native-gesture-handler";
import {
  useValues,
  onGestureEvent,
  bInterpolate,
  withSpringTransition,
  useSpringTransition,
  withTransition
} from "react-native-redash";
import { useMemoOne } from "use-memo-one";
import { connect, ConnectedProps } from "react-redux";

import * as selectors from "@redux/selectors";
import CloseIcon from "@assets/svg/close.svg";
import { RootState } from "@redux/types";
import { Colors, OuterWheel, InnerWheel } from "@lib";

import ColorWheel from "./ColorWheel";

const {
  divide,
  not,
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

export type ColorPickerConnectedProps = ConnectedProps<typeof connector>;

const mapStateToProps = (state: RootState) => ({
  enabled: selectors.canvasEnabled(state)
});

const ColorPicker: React.FC<ColorPickerProps & ColorPickerConnectedProps> = ({
  onChoose,
  enabled,
  visible
}) => {
  const enabledTransition = useSpringTransition(enabled, config);

  const [tapState] = useValues<State>([State.UNDETERMINED], []);

  const tapHandler = useMemoOne(() => onGestureEvent({ state: tapState }), []);

  useCode(
    () => [onChange(tapState, cond(eq(tapState, State.END), set(visible, 0)))],
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

  const scale = bInterpolate(openTransition, 0, 1);
  const translateY = bInterpolate(openTransition, 75, -10);

  const scaleStyle = {
    transform: [{ scale }, { scale: bInterpolate(closeTransition, 1, 0.9) }]
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
      <ColorWheel
        radius={170}
        colors={OuterWheel}
        visible={openTransition}
        enabled={enabledTransition}
        closing={closeTransition}
        onChoose={onChoose}
      />
      <ColorWheel
        radius={100}
        angleOffset={0.1}
        colors={InnerWheel}
        visible={openTransition}
        enabled={enabledTransition}
        closing={closeTransition}
        onChoose={onChoose}
      />

      <TapGestureHandler {...tapHandler}>
        <Animated.View style={[styles.closeButton, scaleStyle]}>
          <CloseIcon width={70} height={70} />
        </Animated.View>
      </TapGestureHandler>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    alignItems: "center",
    bottom: 0
  },

  closeButton: {
    position: "absolute",
    bottom: 10
  }
});

const connector = connect(mapStateToProps, {});
export default connector(ColorPicker);
