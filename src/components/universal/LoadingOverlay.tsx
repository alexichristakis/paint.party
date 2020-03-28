import React from "react";
import { ActivityIndicator, StyleSheet, View, Text } from "react-native";
import Animated from "react-native-reanimated";
import { useTransition } from "react-native-redash";

import { Colors } from "@lib";

export interface LoadingOverlayProps {
  loading: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ loading }) => {
  const loadingOverlayOpacity = useTransition(loading);
  return (
    <Animated.View
      pointerEvents={loading ? "auto" : "none"}
      style={[styles.loadingOverlay, { opacity: loadingOverlayOpacity }]}
    >
      <ActivityIndicator style={styles.loadingIndicator} size={"large"} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center"
  },
  loadingIndicator: {
    width: 80,
    height: 80,
    backgroundColor: Colors.transGray,
    transform: [{ scale: 1.5 }],
    borderRadius: 15
  },
  text: {}
});
