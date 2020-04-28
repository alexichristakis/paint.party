import React from "react";
import { ActivityIndicator, StyleSheet, View, Text } from "react-native";
import Animated from "react-native-reanimated";
import { useTransition } from "react-native-redash";

import { Colors, TextStyles } from "@lib";

export interface LoadingOverlayProps {
  loading: boolean;
  text?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  text,
  loading,
}) => {
  const loadingOverlayOpacity = useTransition(loading);
  return (
    <Animated.View
      pointerEvents={loading ? "auto" : "none"}
      style={[styles.loadingOverlay, { opacity: loadingOverlayOpacity }]}
    >
      <View style={styles.container}>
        <ActivityIndicator style={styles.loadingIndicator} size={"large"} />
        {text ? <Text style={styles.text}>{text}</Text> : null}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.transGray,
    padding: 20,
    borderRadius: 15,
  },
  loadingIndicator: {
    width: 80,
    height: 80,

    transform: [{ scale: 1.5 }],
  },
  text: {
    ...TextStyles.medium,
    marginTop: 15,
    // textTransform: "uppercase",
    color: Colors.lightGray,
  },
});
