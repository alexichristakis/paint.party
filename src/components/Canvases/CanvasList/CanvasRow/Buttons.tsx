import React from "react";
import {
  View,
  StyleSheet,
  Text,
  LayoutChangeEvent,
  ViewStyle,
  StyleProp,
} from "react-native";

import { TextStyles, Colors } from "@lib";
import { TouchableScale } from "@components/universal";
import Animated from "react-native-reanimated";

export interface CanvasRowButtonsProps {
  style: StyleProp<Animated.AnimateStyle<ViewStyle>>;
  onLayout: (event: LayoutChangeEvent) => void;
  onPressLeave: () => void;
  onPressRename: () => void;
}

const Buttons: React.FC<CanvasRowButtonsProps> = ({
  style,
  onLayout,
  onPressLeave,
  onPressRename,
}) => {
  return (
    <Animated.View onLayout={onLayout} style={[styles.container, style]}>
      <TouchableScale toScale={0.9} onPress={onPressRename}>
        <View style={{ ...styles.button, backgroundColor: Colors.blue }}>
          <Text style={styles.label}>rename</Text>
        </View>
      </TouchableScale>
      <TouchableScale toScale={0.9} onPress={onPressLeave}>
        <View style={{ ...styles.button, backgroundColor: Colors.red }}>
          <Text style={styles.label}>leave</Text>
        </View>
      </TouchableScale>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    right: 0,
    alignItems: "center",
    position: "absolute",
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
