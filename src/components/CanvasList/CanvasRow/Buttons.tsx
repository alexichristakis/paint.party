import React from "react";
import { View, StyleSheet, Text } from "react-native";

import { TextStyles, Colors } from "@lib";
import { TouchableScale } from "@components/universal";

export interface CanvasRowButtonsProps {
  onPress: () => void;
}

const Buttons: React.FC<CanvasRowButtonsProps> = ({ onPress }) => {
  return (
    <View style={styles.container}>
      <TouchableScale onPress={onPress}>
        <View style={styles.button}>
          <Text style={styles.label}>leave</Text>
        </View>
      </TouchableScale>
      {/* <View style={styles.button}>
        <Text style={styles.label}>rename</Text>
      </View> */}
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
    backgroundColor: Colors.red,
    padding: 20,
  },
  label: {
    ...TextStyles.medium,
    color: Colors.background,
  },
});

export default Buttons;
