import React from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import Animated from "react-native-reanimated";
import { mix, useSpringTransition } from "react-native-redash";

import Send from "@assets/svg/send.svg";

import { TouchableScale } from "./TouchableScale";

export interface CreateButtonProps {
  onPress: () => void;
  loading?: boolean;
  valid: boolean;
  dependencies: React.DependencyList;
}

export const CreateButton: React.FC<CreateButtonProps> = ({
  loading,
  valid,
  onPress,
  dependencies,
}) => {
  const transition = useSpringTransition(valid && !loading);

  if (loading) {
    return (
      <Animated.View
        style={[
          styles.sendButton,
          {
            transform: [
              {
                scale: mix(transition, 1, 0),
              },
            ],
            opacity: mix(transition, 1, 0),
          },
        ]}
      >
        <ActivityIndicator size="large" style={{ width: 50, height: 50 }} />
      </Animated.View>
    );
  }

  return (
    <TouchableScale
      enabled={valid}
      onPress={onPress}
      dependencies={dependencies}
      style={styles.sendButton}
    >
      <Animated.View
        style={{
          transform: [{ scale: transition }],
          opacity: transition,
        }}
      >
        <Send height={50} width={50} />
      </Animated.View>
    </TouchableScale>
  );
};

const styles = StyleSheet.create({
  sendButton: {
    position: "absolute",
    top: 10,
    right: 10,
    alignSelf: "center",
  },
});
