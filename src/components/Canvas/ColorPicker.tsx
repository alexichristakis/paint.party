import React from "react";
import Animated, {
  interpolate,
  concat,
  onChange,
  useCode
} from "react-native-reanimated";
import { StyleSheet, TouchableOpacity } from "react-native";
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
  useSpringTransition
} from "react-native-redash";
import { useMemoOne } from "use-memo-one";

import { FillColors } from "@lib";
import CloseIcon from "@assets/svg/close.svg";

const { set, eq, sub, cond } = Animated;

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
  rotateZ: Animated.Node<string>;
  enabled: boolean;
  openTransition: Animated.Node<number>;
  enabledTransition: Animated.Node<number>;
  color: string;
  onChoose: (color: string) => void;
}

const Color: React.FC<ColorProps> = ({
  color,
  rotateZ,
  openTransition,
  enabledTransition,
  enabled,
  onChoose
}) => {
  const handleOnChoose = () => onChoose(color);

  return (
    <Animated.View
      style={{
        opacity: bInterpolate(enabledTransition, 0.5, 1),
        transform: [{ rotateZ }]
      }}
    >
      <TouchableOpacity disabled={!enabled} onPress={handleOnChoose}>
        <Animated.View
          style={[
            styles.color,
            {
              marginTop: bInterpolate(openTransition, 0, 150),
              backgroundColor: color
            }
          ]}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

export const ColorPicker: React.FC<ColorPickerProps> = React.memo(
  ({ onChoose, cell, enabled, visible }) => {
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

    useCode(
      () => [
        onChange(tapState, cond(eq(tapState, State.END), [set(visible, 0)]))
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

    const rotateZ = (index: number) =>
      concat(
        interpolate(scroll, {
          inputRange: [0, 100],
          outputRange: [
            (index * 360) / FillColors.length,
            ((index + 1) * 360) / FillColors.length
          ]
        }),
        "deg"
      );

    return (
      <PanGestureHandler {...panHandler}>
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ translateY: bInterpolate(openTransition, 70, 0) }]
            }
          ]}
        >
          {FillColors.map((color, index) => (
            <Color
              key={index}
              {...{
                onChoose: color => onChoose(cell, color),
                rotateZ: rotateZ(index),
                openTransition,
                enabledTransition,
                enabled,
                color
              }}
            />
          ))}
          <TapGestureHandler {...tapHandler}>
            <Animated.View
              style={{
                position: "absolute",
                bottom: 30,
                transform: [{ scale: bInterpolate(openTransition, 0, 1) }]
              }}
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
    borderWidth: 3,
    position: "absolute",
    height: 60,
    width: 60,
    borderRadius: 30
  }
});
