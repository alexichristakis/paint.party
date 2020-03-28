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
import Animated, { useCode, onChange } from "react-native-reanimated";
import Haptics from "react-native-haptic-feedback";
import {
  TapGestureHandler,
  LongPressGestureHandler,
  State
} from "react-native-gesture-handler";
import {
  useValues,
  onGestureEvent,
  bInterpolateColor,
  bInterpolate,
  withTransition
} from "react-native-redash";
import { useMemoOne } from "use-memo-one";

import { TextStyles, Colors, pluralize, SCREEN_WIDTH, canvasUrl } from "@lib";
import { Canvas } from "@redux/modules/canvas";
import { Countdown } from "@components/universal";
import { useOnLayout } from "@hooks";

const { or, eq, cond, call } = Animated;

export interface CanvasRowProps {
  style?: StyleProp<Animated.AnimateStyle<ViewStyle>>;
  onPress: (canvasId: string) => void;
  canvas: Canvas;
}

export const CanvasRow: React.FC<CanvasRowProps> = ({
  onPress,
  canvas: { id, name, authors, nextDrawAt, expiresAt },
  style
}) => {
  const { onLayout, height } = useOnLayout();

  const longPressRef = useRef<LongPressGestureHandler>(null);
  const tapRef = useRef<TapGestureHandler>(null);

  const [longPressState, tapState] = useValues(
    [State.UNDETERMINED, State.UNDETERMINED],
    []
  );

  const [x, y] = useValues([0, 0], []);

  const handleOnLongPress = () => {
    Haptics.trigger("impactMedium");
    Share.share({
      title: `share ${name}`,
      message: canvasUrl(id)
    });
  };

  const handleOnPress = () => onPress(id);

  const [longPressHandler, tapHandler] = useMemoOne(
    () => [
      onGestureEvent({ state: longPressState }),
      onGestureEvent({ state: tapState, x, y })
    ],
    []
  );

  useCode(
    () => [
      onChange(
        tapState,
        cond(eq(tapState, State.END), call([], handleOnPress))
      ),
      onChange(
        longPressState,
        cond(eq(longPressState, State.ACTIVE), call([], handleOnLongPress))
      )
    ],
    []
  );

  const onPressIn = withTransition(
    or(
      eq(tapState, State.ACTIVE),
      eq(tapState, State.BEGAN),
      eq(longPressState, State.ACTIVE),
      eq(longPressState, State.BEGAN)
    )
  );

  const backgroundColor = bInterpolateColor(
    onPressIn,
    Colors.background,
    Colors.grayBlue
  );

  const fillBorderRadius = bInterpolate(onPressIn, height, 0);
  const fillWidth = bInterpolate(onPressIn, 0, SCREEN_WIDTH);
  const fillHeight = bInterpolate(onPressIn, 0, height);
  const fillTop = bInterpolate(onPressIn, y, 0);
  const fillLeft = bInterpolate(onPressIn, x, 0);

  return (
    <TapGestureHandler
      ref={tapRef}
      simultaneousHandlers={[longPressRef]}
      maxDurationMs={500}
      {...tapHandler}
    >
      <Animated.View style={[style, styles.container]} onLayout={onLayout}>
        <Animated.View
          style={[
            styles.fill,
            {
              backgroundColor,
              borderRadius: fillBorderRadius,
              top: fillTop,
              left: fillLeft,
              width: fillWidth,
              height: fillHeight
            }
          ]}
        />
        <LongPressGestureHandler
          ref={longPressRef}
          simultaneousHandlers={[tapRef]}
          {...longPressHandler}
        >
          <Animated.View>
            <View style={styles.row}>
              <Text style={styles.title}>{name}</Text>
              <Countdown style={styles.subtitle} toDate={nextDrawAt} />
            </View>

            <View style={styles.row}>
              <Text style={styles.subtitle}>
                expires {moment.unix(expiresAt).fromNow()}
              </Text>
              <Text style={styles.subtitle}>
                {pluralize("author", authors)}
              </Text>
            </View>
          </Animated.View>
        </LongPressGestureHandler>
      </Animated.View>
    </TapGestureHandler>
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
