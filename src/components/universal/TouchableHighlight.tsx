import React, { useRef } from "react";
import { StyleProp, ViewStyle } from "react-native";
import Animated, { useCode, onChange } from "react-native-reanimated";
import {
  TapGestureHandler,
  LongPressGestureHandler,
  State,
} from "react-native-gesture-handler";
import {
  useValues,
  onGestureEvent,
  mixColor,
  mix,
  bin,
  withTransition,
} from "react-native-redash";
import { useMemoOne } from "use-memo-one";

import { Colors } from "@lib";
import { useOnLayout } from "@hooks";

const { or, set, defined, eq, and, cond, call } = Animated;

export interface TouchableHighlightProps {
  style?: StyleProp<Animated.AnimateStyle<ViewStyle>>;
  waitFor?: any;
  enabled?: boolean;
  onPress: () => void;
  onLongPress?: () => void;
}

export const TouchableHighlight: React.FC<TouchableHighlightProps> = React.memo(
  ({ enabled = true, waitFor, onPress, onLongPress, style, children }) => {
    const { onLayout, height, width } = useOnLayout();

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
        onChange(tapState, cond(eq(tapState, State.END), [call([], onPress)])),
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

    const fill = useMemoOne(
      () => ({
        position: "absolute",
        backgroundColor: mixColor(
          onPressIn,
          Colors.background,
          Colors.grayBlue
        ),
        borderRadius: mix(onPressIn, height, 0),
        width: mix(onPressIn, 0, width),
        height: mix(onPressIn, 0, height),
        top: mix(onPressIn, y, 0),
        left: mix(onPressIn, x, 0),
      }),
      [width, height]
    );

    return (
      <TapGestureHandler
        ref={tapRef}
        waitFor={waitFor}
        maxDist={10}
        simultaneousHandlers={longPressRef}
        maxDurationMs={500}
        {...tapHandler}
      >
        <Animated.View onLayout={onLayout}>
          <Animated.View style={fill} />
          <LongPressGestureHandler
            ref={longPressRef}
            simultaneousHandlers={[tapRef]}
            maxDist={10}
            {...longPressHandler}
          >
            <Animated.View style={style}>{children}</Animated.View>
          </LongPressGestureHandler>
        </Animated.View>
      </TapGestureHandler>
    );
  },
  (p, n) => p.enabled === n.enabled
);
