import React from "react";
import {
  View,
  StyleSheet,
  Text,
  StyleProp,
  ViewStyle,
  Share,
} from "react-native";
import moment from "moment";
import Animated from "react-native-reanimated";
import Haptics from "react-native-haptic-feedback";

import {
  TextStyles,
  Colors,
  pluralize,
  SCREEN_WIDTH,
  canvasUrl,
  CANVAS_PREVIEW_SIZE,
  CANVAS_ROW_PREVIEW_SIZE,
} from "@lib";
import { Canvas } from "@redux/modules/canvas";
import { TouchableHighlight, CanvasPreview } from "@components/universal";

import Clock from "@assets/svg/clock.svg";
import Pencil from "@assets/svg/pencil.svg";

import Progress from "./Progress";

export interface CanvasRowProps {
  index: number;
  style?: StyleProp<Animated.AnimateStyle<ViewStyle>>;
  onPress: (canvasId: string) => void;
  canvas: Canvas;
}

export const CanvasRow: React.FC<CanvasRowProps> = ({
  onPress,
  index,
  style,
  canvas: { id, name, backgroundColor, authors, nextDrawAt, expiresAt },
}) => {
  const handleOnLongPress = () => {
    Haptics.trigger("impactMedium");
    Share.share({
      title: `share ${name}`,
      message: canvasUrl(id),
    });
  };

  const handleOnPress = () => onPress(id);

  return (
    <TouchableHighlight
      style={[styles.container, style]}
      onPress={handleOnPress}
      onLongPress={handleOnLongPress}
    >
      <Progress index={index} time={nextDrawAt}>
        <CanvasPreview
          size={CANVAS_ROW_PREVIEW_SIZE}
          {...{ backgroundColor, id }}
        />
      </Progress>
      <View style={styles.right}>
        <Text style={styles.title}>{name}</Text>
        <View style={styles.row}>
          <Text style={styles.subtitle}>
            <Clock width={12} height={12} />{" "}
            {moment.unix(expiresAt).fromNow(true)} left
          </Text>
          <Text style={styles.subtitle}>
            <Pencil width={12} height={12} /> {pluralize("author", authors)}
          </Text>
        </View>
      </View>
    </TouchableHighlight>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 5,
    paddingTop: 5,
  },
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
  fill: {
    position: "absolute",
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
