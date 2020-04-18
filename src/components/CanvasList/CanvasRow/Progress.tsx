import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, { useCode, Easing } from "react-native-reanimated";
import {
  mix,
  interpolateColor,
  timing,
  loop,
  useClock,
  useValues,
} from "react-native-redash";
import moment from "moment";

import { Colors, DRAW_INTERVAL, CANVAS_ROW_PREVIEW_SIZE } from "@lib";

const { divide, multiply, sub, set, cond, eq } = Animated;

export interface ProgressProps {
  index: number;
  time: number;
}

const Progress: React.FC<ProgressProps> = React.memo(
  ({ index, time = 0, children }) => {
    const currentTime = moment().unix();

    const clock = useClock([]);
    const [loopValue, delta] = useValues(
      [1, Math.max(time - currentTime, 0)],
      [time]
    );

    const value = timing({
      to: 1,
      from: sub(1, divide(delta, DRAW_INTERVAL * 60)),
      duration: multiply(delta, 1000),
    });

    useCode(
      () => [
        cond(
          eq(value, 1),
          [
            set(delta, 0),
            set(
              loopValue,
              sub(
                1,
                loop({
                  clock,
                  duration: 600 + Math.random() * index * 100,
                  easing: Easing.inOut(Easing.ease),
                  boomerang: true,
                  autoStart: true,
                })
              )
            ),
          ],
          [set(loopValue, 1)]
        ),
      ],
      [value]
    );

    const backgroundColor = interpolateColor(value, {
      inputRange: [0, 0.5, 1],
      outputRange: [Colors.red, Colors.orange, Colors.green],
    });

    const scale = mix(loopValue, 0.95, 1);
    const opacity = mix(loopValue, 0.5, 1);

    return (
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ scale }],
              opacity,
              backgroundColor,
            },
          ]}
        />
        <View style={{ position: "absolute" }}>{children}</View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    width: CANVAS_ROW_PREVIEW_SIZE + 10,
    height: CANVAS_ROW_PREVIEW_SIZE + 10,
    overflow: "visible",
    borderRadius: 5,
  },
});

export default Progress;
