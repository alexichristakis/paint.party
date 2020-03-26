import React, { useCallback } from "react";
import Animated from "react-native-reanimated";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { bInterpolate, useTransition } from "react-native-redash";
import { useMemoOne } from "use-memo-one";

import { FillColors } from "@lib";

import { TouchableScale } from "./TouchableScale";

export interface BackgruondColorPickerProps {
  selected: string;
  onChoose: (color: string) => void;
}

interface ColorProps {
  color: string;
  selected: boolean;
  onChoose: (color: string) => void;
}

const Color: React.FC<ColorProps> = ({ color, selected, onChoose }) => {
  const transition = useTransition(selected);

  const handleOnChoose = useCallback(() => onChoose(color), []);

  const borderWidth = useMemoOne(() => bInterpolate(transition, 0, 4), []);

  return (
    <TouchableScale onPress={handleOnChoose}>
      <Animated.View
        style={[
          styles.color,
          {
            borderWidth,
            backgroundColor: color
          }
        ]}
      />
    </TouchableScale>
  );
};

export const BackgroundColorPicker: React.FC<BackgruondColorPickerProps> = React.memo(
  ({ onChoose, selected }) => {
    return (
      <View style={styles.container}>
        {FillColors.map((color, index) => (
          <Color
            key={index}
            {...{
              selected: selected === color,
              color,
              onChoose: () => onChoose(color)
            }}
          />
        ))}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    bottom: 0
  },
  color: {
    height: 60,
    width: 60,
    margin: 2
  }
});
