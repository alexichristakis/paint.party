import React from "react";
import { StyleSheet, View, StyleProp, ViewStyle } from "react-native";
import Animated, { useCode, Extrapolate } from "react-native-reanimated";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import { useValues, onGestureEvent, clamp } from "react-native-redash";

import { useOnLayout } from "@hooks";
import { Colors } from "@lib";

const {
  set,
  add,
  neq,
  debug,
  multiply,
  cond,
  onChange,
  divide,
  sub,
  call,
  eq,
  interpolate
} = Animated;

export interface SliderProps {
  onCompleteDrag?: (val: number) => void;
  range: [number, number];
  value: Animated.Value<number>;
  trackColor?: Animated.Node<number | string | undefined> | string;
  style?: StyleProp<Animated.AnimateStyle<ViewStyle>>;
}

const SLIDER_SIZE = 30;

export const Slider: React.FC<SliderProps> = ({
  onCompleteDrag,
  value,
  trackColor,
  range,
  style
}) => {
  const { onLayout, width } = useOnLayout();
  const [state] = useValues([State.UNDETERMINED], []);
  const [sliderPosition] = useValues<number>([0], []);

  const handler = onGestureEvent({
    state,
    x: sliderPosition
  });

  const left = clamp(
    sub(sliderPosition, SLIDER_SIZE / 2),
    0,
    width - SLIDER_SIZE
  );

  useCode(
    () => [
      onChange(value, [
        cond(neq(state, State.ACTIVE), [
          set(
            sliderPosition,
            add(
              multiply(width - SLIDER_SIZE, divide(value, range[1])),
              SLIDER_SIZE / 2
            )
          )
        ])
      ]),

      set(
        value,
        interpolate(left, {
          inputRange: [0, width ? width - SLIDER_SIZE : width],
          outputRange: range,
          extrapolate: Extrapolate.CLAMP
        })
      ),

      onChange(
        state,
        cond(
          eq(state, State.END),
          call([value], ([val]) => (onCompleteDrag ? onCompleteDrag(val) : {}))
        )
      )
    ],
    [value, width]
  );

  return (
    <PanGestureHandler {...handler}>
      <Animated.View style={[styles.container, style]} onLayout={onLayout}>
        <View style={styles.track}>
          <Animated.View
            style={[
              styles.track,
              {
                backgroundColor: trackColor ? trackColor : Colors.lightblue,
                marginLeft: -width,
                left
              }
            ]}
          />
        </View>
        <Animated.View style={[styles.slider, { left }]} />
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    justifyContent: "center"
  },
  track: {
    position: "absolute",
    overflow: "hidden",
    width: "100%",
    height: 4,
    borderRadius: 5,
    backgroundColor: Colors.lightGray
  },
  slider: {
    width: SLIDER_SIZE,
    height: SLIDER_SIZE,
    borderRadius: SLIDER_SIZE / 2,
    backgroundColor: Colors.lightGray
  }
});
