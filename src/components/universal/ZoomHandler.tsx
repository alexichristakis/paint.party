import React from "react";
import { StyleSheet } from "react-native";
import Animated, { useCode } from "react-native-reanimated";
import {
  useValues,
  onGestureEvent,
  translate,
  pinchBegan,
  vec,
} from "react-native-redash";
import { State, PinchGestureHandler } from "react-native-gesture-handler";

import { useVectors, SCREEN_WIDTH } from "@lib";
import isEqual from "lodash/isEqual";

const { set, cond, eq, or, multiply } = Animated;
const { UNDETERMINED, END, ACTIVE } = State;

export interface ZoomHandlerProps {}

const CANVAS = vec.create(SCREEN_WIDTH, SCREEN_WIDTH);
const CENTER = vec.divide(CANVAS, 2);

const ZoomHandler: React.FC<ZoomHandlerProps> = React.memo(
  ({ children }) => {
    const [origin, pinch, focal, translation, offset] = useVectors(
      [
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
      ],
      []
    );

    const [scale, scaleOffset] = useValues([1, 1], []);
    const [pinchState] = useValues([UNDETERMINED], []);

    const pinchGestureHandler = onGestureEvent({
      scale,
      state: pinchState,
      focalX: focal.x,
      focalY: focal.y,
    });

    const adjustedFocal = vec.sub(focal, vec.add(CENTER, offset));
    useCode(
      () => [
        vec.set(
          translation,
          vec.add(pinch, origin, vec.multiply(-1, scale, origin))
        ),
        cond(pinchBegan(pinchState), vec.set(origin, adjustedFocal)),
        cond(
          eq(pinchState, ACTIVE),
          vec.set(pinch, vec.sub(adjustedFocal, origin))
        ),
        cond(eq(pinchState, END), [
          vec.set(offset, vec.add(offset, translation)),
          set(scaleOffset, multiply(scale, scaleOffset)),
          set(scale, 1),
          vec.set(translation, 0),
          vec.set(focal, 0),
          vec.set(pinch, 0),
        ]),
      ],
      []
    );

    const animatedStyle = {
      transform: [
        ...translate(vec.add(offset, translation)),
        { scale: multiply(scaleOffset, scale) },
      ],
    };

    return (
      <PinchGestureHandler {...pinchGestureHandler}>
        <Animated.View pointerEvents={"box-none"} style={styles.container}>
          <Animated.View style={animatedStyle}>{children}</Animated.View>
        </Animated.View>
      </PinchGestureHandler>
    );
  },
  (p, n) => isEqual(p, n)
);

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default ZoomHandler;
