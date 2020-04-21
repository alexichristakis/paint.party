import React from "react";
import Animated from "react-native-reanimated";
import { mix } from "react-native-redash";
import { StyleSheet, View, Text } from "react-native";
import moment from "moment";

import { Colors, TextStyles, POPUP_SIZE } from "@lib";
import { useOnLayout } from "@hooks";

export interface LabelProps {
  transition: Animated.Node<number>;
}

export interface LabelInternalProps {
  time: number;
  color: string;
}

const Label: React.FC<LabelProps & LabelInternalProps> = React.memo(
  ({ transition, time, color }) => {
    const { width, onLayout } = useOnLayout();

    const transform = [{ translateX: mix(transition, 0, -width) }];
    return (
      <View pointerEvents={"none"} style={styles.container}>
        <Animated.View
          style={{ ...styles.label, transform }}
          onLayout={onLayout}
        >
          <Text style={styles.text} numberOfLines={2}>
            {color}
            {"\n"}
            {moment.unix(Number(time)).fromNow()}
          </Text>
        </Animated.View>
      </View>
    );
  },
  (p, n) => p.color === n.color && p.time === n.time
);

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    overflow: "hidden",
    borderRadius: 25,
    left: 0,
  },
  label: {
    borderRadius: 25,
    paddingLeft: POPUP_SIZE + 10,
    minHeight: POPUP_SIZE + 10,
    paddingRight: 15,
    backgroundColor: Colors.mediumGray,
    justifyContent: "center",
  },
  text: {
    ...TextStyles.medium,
    textAlign: "left",
  },
});

export default Label;
