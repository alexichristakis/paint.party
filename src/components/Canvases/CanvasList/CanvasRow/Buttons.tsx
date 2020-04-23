import React from "react";
import { View, StyleSheet, Text } from "react-native";

import { TextStyles, Colors } from "@lib";
import { TouchableScale } from "@components/universal";

export interface CanvasRowButtonsProps {
  onPressLeave: () => void;
  onPressRename: () => void;
}

const Buttons: React.FC<CanvasRowButtonsProps> = ({
  onPressLeave,
  onPressRename,
}) => {
  return (
    <View style={styles.container}>
      <TouchableScale onPress={onPressRename}>
        <View style={{ ...styles.button, backgroundColor: Colors.blue }}>
          <Text style={styles.label}>rename</Text>
        </View>
      </TouchableScale>
      <TouchableScale onPress={onPressLeave}>
        <View style={{ ...styles.button, backgroundColor: Colors.red }}>
          <Text style={styles.label}>leave</Text>
        </View>
      </TouchableScale>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: "100%",
    paddingHorizontal: 10,
    flexDirection: "row",
  },
  button: {
    marginRight: 10,
    borderRadius: 10,
    borderWidth: 1,
    padding: 20,
  },
  label: {
    ...TextStyles.medium,
    color: Colors.background,
  },
});

export default Buttons;
