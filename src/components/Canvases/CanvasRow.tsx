import React from "react";
import { View, StyleSheet, Text, TouchableHighlight } from "react-native";
import moment from "moment";

import { TextStyles, Colors } from "@lib";
import { Canvas } from "@redux/modules/canvas";
import { Countdown } from "@components/universal";

export interface CanvasRowProps {
  onPress: (canvasId: string) => void;
  canvas: Canvas;
}

export const CanvasRow: React.FC<CanvasRowProps> = ({ onPress, canvas }) => {
  const { id, name, authors, nextDrawAt, createdAt, expiresAt } = canvas;

  const handleOnPress = () => onPress(id);

  return (
    <TouchableHighlight
      underlayColor={Colors.grayBlue}
      onPress={handleOnPress}
      style={styles.container}
    >
      <>
        <Text style={styles.title}>{name}</Text>
        <View style={styles.row}>
          <Text style={styles.subtitle}>
            expires {moment.unix(expiresAt).fromNow()}
          </Text>
          <Text style={styles.subtitle}>
            next draw in{" "}
            <Countdown style={styles.subtitle} toDate={nextDrawAt} />
          </Text>
        </View>
      </>
    </TouchableHighlight>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingBottom: 10
  },
  row: {
    justifyContent: "space-between",
    flexDirection: "row"
  },
  title: {
    ...TextStyles.title
  },
  subtitle: {
    ...TextStyles.medium,
    marginTop: 5,

    color: Colors.gray
  }
});
