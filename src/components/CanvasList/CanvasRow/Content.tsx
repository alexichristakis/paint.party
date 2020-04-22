import React from "react";
import { View, StyleSheet, Text } from "react-native";
import moment from "moment";

import {
  TextStyles,
  Colors,
  pluralize,
  SCREEN_WIDTH,
  CANVAS_ROW_PREVIEW_SIZE,
} from "@lib";
import { Canvas } from "@redux/modules/canvas";
import { CanvasPreview } from "@components/universal";

import Clock from "@assets/svg/clock.svg";
import Pencil from "@assets/svg/pencil.svg";

import Progress from "./Progress";

export interface ContentProps {
  canvas: Canvas;
}

const Content: React.FC<ContentProps> = React.memo(
  ({
    canvas: { id, name, backgroundColor, authors, nextDrawAt, expiresAt },
  }) => (
    <>
      <Progress time={nextDrawAt}>
        <CanvasPreview
          forceReload
          size={CANVAS_ROW_PREVIEW_SIZE}
          {...{ backgroundColor, id }}
        />
      </Progress>
      <View style={styles.right}>
        <Text style={styles.title}>{name}</Text>
        <View style={styles.row}>
          <Text style={styles.subtitle}>
            <Pencil width={12} height={12} /> {pluralize("author", authors)}
          </Text>
          <Text style={styles.subtitle}>
            <Clock width={12} height={12} />{" "}
            {moment.unix(expiresAt).fromNow(true)} left
          </Text>
        </View>
      </View>
    </>
  ),
  (p, n) =>
    p.canvas.id === n.canvas.id && p.canvas.nextDrawAt === n.canvas.nextDrawAt
);

const styles = StyleSheet.create({
  right: {
    alignSelf: "stretch",
    justifyContent: "space-between",
    width: SCREEN_WIDTH - CANVAS_ROW_PREVIEW_SIZE - 40,
  },
  row: {
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
  },
  title: {
    ...TextStyles.title,
    marginTop: -10,
    fontSize: 26,
  },
  subtitle: {
    ...TextStyles.medium,
    marginTop: 5,
    color: Colors.gray,
  },
});

export default Content;
