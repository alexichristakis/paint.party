import React from "react";
import { StyleSheet, View, StyleProp, ViewStyle } from "react-native";
import Animated, { useCode, Extrapolate } from "react-native-reanimated";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import {
  useValues,
  onGestureEvent,
  withOffset,
  clamp
} from "react-native-redash";

import { useOnLayout } from "@hooks";
import { Colors } from "@lib";
import { useMemoOne } from "use-memo-one";

const { set, debug, cond, onChange, call, eq, interpolate } = Animated;

export interface SliderProps {
  onCompleteDrag: (val: number) => void;
  range: [number, number];
  value: Animated.Value<number>;
  style?: StyleProp<ViewStyle>;
}

const SLIDER_SIZE = 30;

export const Slider: React.FC<SliderProps> = ({
  onCompleteDrag,
  value,
  range,
  style
}) => {
  const { onLayout, width } = useOnLayout();
  const [state] = useValues([State.UNDETERMINED], []);
  const [translationX, velocityX] = useValues([0, 0], []);

  const handler = onGestureEvent({
    state,
    translationX,
    velocityX
  });

  const translateX = useMemoOne(
    () => clamp(withOffset(translationX, state), 0, width - SLIDER_SIZE),
    [width]
  );

  useCode(
    () => [
      set(
        value,
        interpolate(translateX, {
          inputRange: [0, width ? width - SLIDER_SIZE : width],
          outputRange: range,
          extrapolate: Extrapolate.CLAMP
        })
      ),
      onChange(
        state,
        cond(
          eq(state, State.END),
          call([value], ([val]) => onCompleteDrag(val))
        )
      )
    ],
    [value, width]
  );

  return (
    <Animated.View style={[styles.container, style]} onLayout={onLayout}>
      <View style={styles.track} />
      <Animated.View
        style={[
          styles.track,
          {
            marginLeft: -width,
            backgroundColor: Colors.blue,
            transform: [{ translateX }]
          }
        ]}
      />
      <PanGestureHandler {...handler}>
        <Animated.View
          style={[styles.slider, { transform: [{ translateX }] }]}
        />
      </PanGestureHandler>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    justifyContent: "center"
  },
  track: {
    position: "absolute",
    width: "100%",
    height: 2,
    backgroundColor: Colors.lightGray
  },
  slider: {
    width: SLIDER_SIZE,
    height: SLIDER_SIZE,
    borderRadius: SLIDER_SIZE / 2,
    backgroundColor: Colors.grayBlue
  }
});
