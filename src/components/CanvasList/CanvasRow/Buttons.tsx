import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { TextStyles, Colors } from "@lib";

const Buttons: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.button}>
        <Text style={styles.label}>leave</Text>
      </View>
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
