import React, { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Extrapolate,
  interpolate,
  lessThan
} from "react-native-reanimated";

import { transformOrigin } from "react-native-redash";

const { PI } = Math;

interface CircularProgressProps {
  theta: Animated.Node<number>;
  bg: ReactNode;
  fg: ReactNode;
  radius: number;
}

interface HalfCircleProps {
  children: ReactNode;
  radius: number;
}

const HalfCircle = ({ children, radius }: HalfCircleProps) => {
  return (
    <View
      style={{
        width: radius * 2,
        height: radius,
        overflow: "hidden"
      }}
    >
      <View
        style={{
          width: radius * 2,
          height: radius * 2,
          borderRadius: radius,
          overflow: "hidden"
        }}
      >
        {children}
      </View>
    </View>
  );
};

export default ({ theta, bg, fg, radius }: CircularProgressProps) => {
  const rotate = interpolate(theta, {
    inputRange: [PI, 2 * PI],
    outputRange: [0, PI],
    extrapolate: Extrapolate.CLAMP
  });

  return (
    <View style={{ transform: [{ rotate: "180deg" }] }}>
      <HalfCircle {...{ radius }}>{fg}</HalfCircle>
      <Animated.View
        style={{
          ...StyleSheet.absoluteFillObject,
          transform: transformOrigin({ x: 0, y: radius / 2 }, { rotate })
        }}
      >
        <HalfCircle {...{ radius }}>{bg}</HalfCircle>
      </Animated.View>
    </View>
  );
};
