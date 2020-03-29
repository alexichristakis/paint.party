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
import { connect, ConnectedProps } from "react-redux";

import * as selectors from "@redux/selectors";
import { FillColors } from "@lib";
import CloseIcon from "@assets/svg/close.svg";
import { RootState } from "@redux/types";

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
const ANGLE_INCREMENT = (2 * Math.PI) / FillColors.length;

const config = {
  damping: 40,
  mass: 1,
  stiffness: 300,
  overshootClamping: false,
  restSpeedThreshold: 0.1,
  restDisplacementThreshold: 0.1
};

interface ColorProps {
  rotate: number;
  panRef: any;
  openTransition: Animated.Node<number>;
  closeTransition: Animated.Node<number>;
  color: string;
  onChoose: (color: string) => void;
}

const mapStateToProps = (state: RootState) => ({
  enabled: selectors.canvasEnabled(state)
});

const Color: React.FC<ColorProps> = React.memo(
  ({
    rotate,
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
              { rotate },
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
  (p, n) => p.color === n.color
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

export default Color;
