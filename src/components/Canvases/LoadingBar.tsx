import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet, ActivityIndicator } from "react-native";
import Animated, { useCode, debug } from "react-native-reanimated";
import { connect, ConnectedProps } from "react-redux";

import { RootState } from "@redux/types";
import * as selectors from "@redux/selectors";
import { SB_HEIGHT, TextStyles, Colors } from "@lib";
import {
  useTransition,
  mix,
  useSpringTransition,
  useValue,
  loop,
} from "react-native-redash";
import { useOnLayout } from "@hooks";

const connector = connect(
  (state: RootState) => ({
    loading: selectors.isFetchingCanvases(state),
  }),
  {}
);

export type LoadingBarConnectedProps = ConnectedProps<typeof connector>;

export interface LoadingBarProps {}

const LoadingBar: React.FC<LoadingBarProps & LoadingBarConnectedProps> = ({
  loading,
}) => {
  const { onLayout, height } = useOnLayout();
  const transition = useSpringTransition(loading);

  const breathing = loop({ duration: 600, autoStart: true, boomerang: true });

  const translateY = mix(transition, -SB_HEIGHT - 5 - height, 0);
  const opacity = mix(breathing, 0.5, 1);
  return (
    <Animated.View
      onLayout={onLayout}
      style={{ ...styles.container, transform: [{ translateY }] }}
    >
      <ActivityIndicator size="small" />
      <Animated.Text style={{ ...styles.text, opacity }}>
        updating canvases...
      </Animated.Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    // alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    top: SB_HEIGHT + 5,
    right: 25,
    left: 25,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.lightGreen,
  },
  text: {
    ...TextStyles.medium,
    marginLeft: 10,
  },
});

export default connector(LoadingBar);
