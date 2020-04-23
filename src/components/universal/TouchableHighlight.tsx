import React, { useRef } from "react";
import { StyleProp, ViewStyle } from "react-native";
import Animated, { useCode, onChange, Value } from "react-native-reanimated";
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
import flatten from "lodash/flatten";

import { Colors } from "@lib";
import { useOnLayout } from "@hooks";

const { or, set, defined, eq, and, cond, call } = Animated;

export interface TouchableHighlightProps {
  style?: StyleProp<Animated.AnimateStyle<ViewStyle>>;
  waitFor?: any;
  showEffect?: boolean;
  simultaneousHandlers?: React.RefObject<any> | React.RefObject<any>[];
  tapState: Animated.Value<State>;
  longPressState?: Animated.Value<State>;
}

export const TouchableHighlight: React.FC<TouchableHighlightProps> = ({
  waitFor,
  showEffect = true,
  simultaneousHandlers,
  longPressState = new Value(State.UNDETERMINED),
  tapState,
  style,
  children,
}) => {
  const { onLayout, height, width } = useOnLayout();

  const longPressRef = useRef<LongPressGestureHandler>(null);
  const tapRef = useRef<TapGestureHandler>(null);

  const [x, y] = useValues([0, 0], []);

  const [longPressHandler, tapHandler] = useMemoOne(
    () => [
      onGestureEvent({ state: longPressState }),
      onGestureEvent({ state: tapState, x, y }),
    ],
    []
  );

  const onPressIn = withTransition(
    and(
      or(
        eq(tapState, State.BEGAN),
        eq(longPressState, State.ACTIVE),
        eq(longPressState, State.BEGAN)
      ),
      bin(showEffect)
    )
  );

  const fill = useMemoOne(
    () => ({
      position: "absolute",
      backgroundColor: mixColor(onPressIn, Colors.background, Colors.grayBlue),
      borderRadius: mix(onPressIn, height, 0),
      width: mix(onPressIn, 0, width),
      height: mix(onPressIn, 0, height),
      top: mix(onPressIn, y, 0),
      left: mix(onPressIn, x, 0),
    }),
    [width, height]
  );

  const handlers = simultaneousHandlers ? flatten([simultaneousHandlers]) : [];
  return (
    <TapGestureHandler
      ref={tapRef}
      waitFor={waitFor}
      maxDist={5}
      simultaneousHandlers={[longPressRef, ...handlers]}
      maxDurationMs={500}
      {...tapHandler}
    >
      <Animated.View onLayout={onLayout}>
        <Animated.View style={fill} />
        <LongPressGestureHandler
          ref={longPressRef}
          simultaneousHandlers={[tapRef, ...handlers]}
          maxDist={5}
          {...longPressHandler}
        >
          <Animated.View style={style}>{children}</Animated.View>
        </LongPressGestureHandler>
      </Animated.View>
    </TapGestureHandler>
  );
};
