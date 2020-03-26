import React from "react";
import Animated, { divide, useCode, max, debug } from "react-native-reanimated";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import {} from "react-native-gesture-handler";
import { useSelector } from "react-redux";
import moment from "moment";

import * as selectors from "@redux/selectors";

import { Countdown } from "./Countdown";

export interface ColorPickerProps {
  cell: number;
  onChooseColor: (color: string) => void;
}

interface ColorProps {
  enabled: boolean;
  color: string;
  onPress: (color: string) => void;
}

const Color: React.FC<ColorProps> = ({ color, enabled, onPress }) => {
  return (
    <TouchableOpacity
      disabled={!enabled}
      style={{ opacity: enabled ? 1 : 0.5 }}
      onPress={() => onPress(color)}
    >
      <View
        style={{
          marginHorizontal: 10,
          height: 50,
          width: 50,
          backgroundColor: color
        }}
      />
    </TouchableOpacity>
  );
};

export const ColorPicker: React.FC<ColorPickerProps> = ({
  cell,
  onChooseColor
}) => {
  const canvasActiveAt = useSelector(selectors.canvasActiveAt);

  const enabled = moment().unix() > canvasActiveAt;

  if (cell > -1)
    return (
      <Animated.View style={styles.container}>
        <Countdown toDate={canvasActiveAt} />
        <Animated.View
          style={{
            flexDirection: "row"
            // transform: [{ scale: divide(1, scale) }]
          }}
        >
          <Color enabled={enabled} color="red" onPress={onChooseColor} />
          <Color enabled={enabled} color="blue" onPress={onChooseColor} />
          <Color enabled={enabled} color="green" onPress={onChooseColor} />
        </Animated.View>
      </Animated.View>
    );

  return null;
};

const styles = StyleSheet.create({
  container: {
    bottom: 50,
    position: "absolute"
  }
});
