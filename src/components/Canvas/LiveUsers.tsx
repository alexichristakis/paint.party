import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, { useCode, Easing } from "react-native-reanimated";
import { useValues, loop, useClocks, bInterpolate } from "react-native-redash";
import { useSelector } from "react-redux";

import * as selectors from "@redux/selectors";
import { TextStyles, Colors } from "@lib";

const { set } = Animated;

export interface LiveUsersProps {}

export const LiveUsers: React.FC<LiveUsersProps> = () => {
  const [clock] = useClocks(1, []);
  const [value] = useValues([0], []);

  const positions = useSelector(selectors.numberOfLiveUsers);

  useCode(
    () => [
      set(
        value,
        loop({
          clock,
          duration: 550,
          easing: Easing.inOut(Easing.ease),
          boomerang: true,
          autoStart: true
        })
      )
    ],
    []
  );

  const opacity = bInterpolate(value, 0.5, 1);

  if (!positions) return null;

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <View style={styles.indicator} />
      <Text style={styles.text}>
        {positions} user{positions > 1 ? "s" : ""} live
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center"
  },
  indicator: {
    marginTop: 3,
    marginRight: 5,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.red
  },
  text: {
    ...TextStyles.medium
  }
});
