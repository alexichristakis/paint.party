import React, { useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  StyleProp,
  ViewStyle,
  Share
} from "react-native";
import moment from "moment";
import Animated from "react-native-reanimated";
import Haptics from "react-native-haptic-feedback";

import { TextStyles, Colors, pluralize, SCREEN_WIDTH, canvasUrl } from "@lib";
import { Canvas } from "@redux/modules/canvas";
import { Countdown, TouchableHighlight } from "@components/universal";

export interface CanvasRowProps {
  style?: StyleProp<Animated.AnimateStyle<ViewStyle>>;
  onPress: (canvasId: string) => void;
  canvas: Canvas;
}

export const CanvasRow: React.FC<CanvasRowProps> = ({
  onPress,
  style,
  canvas: { id, name, authors, nextDrawAt, expiresAt }
}) => {
  const handleOnLongPress = () => {
    Haptics.trigger("impactMedium");
    Share.share({
      title: `share ${name}`,
      message: canvasUrl(id)
    });
  };

  const handleOnPress = () => onPress(id);

  return (
    <TouchableHighlight
      style={[style, styles.container]}
      onPress={handleOnPress}
      onLongPress={handleOnLongPress}
    >
      <View style={styles.row}>
        <Text style={styles.title}>{name}</Text>
        <Countdown style={styles.subtitle} toDate={nextDrawAt} />
      </View>

      <View style={styles.row}>
        <Text style={styles.subtitle}>
          expires {moment.unix(expiresAt).fromNow()}
        </Text>
        <Text style={styles.subtitle}>{pluralize("author", authors)}</Text>
      </View>
    </TouchableHighlight>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingBottom: 10
  },
  row: {
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row"
  },
  fill: {
    position: "absolute"
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
