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
import {
  State,
  PanGestureHandler,
  PinchGestureHandler,
} from "react-native-gesture-handler";

import { CANVAS_SIZE, useVectors, SCREEN_HEIGHT } from "@lib";
import isEqual from "lodash/isEqual";

const { set, neq, and, cond, eq, or, multiply } = Animated;
const { BEGAN, UNDETERMINED, ACTIVE } = State;

export interface ZoomPanHandlerProps {
  onGestureBegan: Animated.Adaptable<number>;
}

const CANVAS = vec.create(CANVAS_SIZE, SCREEN_HEIGHT);
const CENTER = vec.divide(CANVAS, 2);

const ZoomPanHandler: React.FC<ZoomPanHandlerProps> = React.memo(
  ({ onGestureBegan, children }) => {
    const [origin, pinch, focal, drag, translation, offset] = useVectors(
      [
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
      ],
      []
    );

    const [scale, scaleOffset] = useValues([1, 1], []);
    const [pinchState, panState] = useValues([UNDETERMINED, UNDETERMINED], []);

    const pinchGestureHandler = onGestureEvent({
      scale,
      state: pinchState,
      focalX: focal.x,
      focalY: focal.y,
    });

    const panGestureHandler = onGestureEvent({
      state: panState,
      translationX: drag.x,
      translationY: drag.y,
    });

    const adjustedFocal = vec.sub(focal, vec.add(CENTER, offset));
    useCode(
      () => [
        vec.set(
          translation,
          vec.add(
            pinch,
            origin,
            vec.multiply(drag, scaleOffset),
            vec.multiply(-1, scale, origin)
          )
        ),
        cond(or(pinchBegan(pinchState), eq(panState, BEGAN)), onGestureBegan),
        cond(pinchBegan(pinchState), vec.set(origin, adjustedFocal)),
        cond(
          eq(pinchState, ACTIVE),
          vec.set(pinch, vec.sub(adjustedFocal, origin))
        ),
        cond(and(neq(pinchState, ACTIVE), neq(panState, ACTIVE)), [
          vec.set(offset, vec.add(offset, translation)),
          set(scaleOffset, multiply(scale, scaleOffset)),
          set(scale, 1),
          vec.set(translation, 0),
          vec.set(focal, 0),
          vec.set(drag, 0),
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
          <PanGestureHandler {...panGestureHandler}>
            <Animated.View style={animatedStyle}>{children}</Animated.View>
          </PanGestureHandler>
        </Animated.View>
      </PinchGestureHandler>
    );
  },
  (p, n) => isEqual(p, n)
);

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
  },
});

export default ZoomPanHandler;
