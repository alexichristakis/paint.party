import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, { useCode, Easing } from "react-native-reanimated";
import {
  useValue,
  mix,
  interpolateColor,
  timing,
  loop,
  useClock,
  delay,
} from "react-native-redash";
import moment from "moment";

import { Colors, DRAW_INTERVAL, CANVAS_PREVIEW_SIZE } from "@lib";

const { set, max, cond, eq, debug } = Animated;

export interface ProgressProps {
  index: number;
  time: number;
}

const Progress: React.FC<ProgressProps> = React.memo(
  ({ index, time, children }) => {
    const clock = useClock([]);
    const loopValue = useValue(1, []);

    const currentTime = moment().unix();

    const delta = Math.max(time - currentTime, 0);
    const value = timing({
      to: 1,
      from: 1 - delta / (DRAW_INTERVAL * 60),
      duration: delta * 1000,
    });

    useCode(
      () => [
        set(
          loopValue,
          cond(
            eq(value, 1),
            loop({
              clock,
              duration: 600 + Math.random() * index * 100,
              easing: Easing.inOut(Easing.ease),
              boomerang: true,
              autoStart: true,
            }),
            1
          )
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
    width: CANVAS_PREVIEW_SIZE + 10,
    height: CANVAS_PREVIEW_SIZE + 10,
    overflow: "visible",
    borderRadius: 5,
  },
});

export default Progress;
