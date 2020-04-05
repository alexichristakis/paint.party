import React, { useRef } from "react";
import { StyleSheet, StyleProp, ViewStyle } from "react-native";
import Animated, { useCode, onChange } from "react-native-reanimated";
import {
  TapGestureHandler,
  LongPressGestureHandler,
  State,
} from "react-native-gesture-handler";
import {
  useValues,
  onGestureEvent,
  bInterpolateColor,
  mix,
  bin,
  withTransition,
} from "react-native-redash";
import { useMemoOne } from "use-memo-one";

import { TextStyles, Colors, SCREEN_WIDTH } from "@lib";
import { useOnLayout } from "@hooks";

const { or, eq, and, defined, cond, call } = Animated;

export interface TouchableHighlightProps {
  style?: StyleProp<Animated.AnimateStyle<ViewStyle>>;
  waitFor?: any;
  enabled?: boolean;
  onPress: () => void;
  onLongPress?: () => void;
}

export const TouchableHighlight: React.FC<TouchableHighlightProps> = ({
  enabled = true,
  waitFor,
  onPress,
  onLongPress,
  style,
  children,
}) => {
  const { onLayout, height } = useOnLayout();

  const longPressRef = useRef<LongPressGestureHandler>(null);
  const tapRef = useRef<TapGestureHandler>(null);

  const [longPressState, tapState] = useValues(
    [State.UNDETERMINED, State.UNDETERMINED],
    []
  );

  const [x, y] = useValues([0, 0], []);

  const [longPressHandler, tapHandler] = useMemoOne(
    () => [
      onGestureEvent({ state: longPressState }),
      onGestureEvent({ state: tapState, x, y }),
    ],
    []
  );

  useCode(
    () => [
      onChange(tapState, cond(eq(tapState, State.END), call([], onPress))),
      onChange(
        longPressState,
        cond(
          eq(longPressState, State.ACTIVE),
          call([], onLongPress ? onLongPress : onPress)
        )
      ),
    ],
    []
  );

  const onPressIn = withTransition(
    and(
      or(
        eq(tapState, State.ACTIVE),
        eq(tapState, State.BEGAN),
        eq(longPressState, State.ACTIVE),
        eq(longPressState, State.BEGAN)
      ),
      bin(enabled)
    )
  );

  const backgroundColor = bInterpolateColor(
    onPressIn,
    Colors.background,
    Colors.grayBlue
  );

  const fillBorderRadius = mix(onPressIn, height, 0);
  const fillWidth = mix(onPressIn, 0, SCREEN_WIDTH);
  const fillHeight = mix(onPressIn, 0, height);
  const fillTop = mix(onPressIn, y, 0);
  const fillLeft = mix(onPressIn, x, 0);

  return (
    <TapGestureHandler
      ref={tapRef}
      waitFor={waitFor}
      simultaneousHandlers={longPressRef}
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
              height: fillHeight,
            },
          ]}
        />
        <LongPressGestureHandler
          ref={longPressRef}
          simultaneousHandlers={[tapRef]}
          {...longPressHandler}
        >
          <Animated.View>{children}</Animated.View>
        </LongPressGestureHandler>
      </Animated.View>
    </TapGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 10,
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
  },
  subtitle: {
    ...TextStyles.medium,
    marginTop: 5,

    color: Colors.gray,
  },
});
