import React, { useRef } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { Easing, useCode, onChange } from "react-native-reanimated";
import {
  bin,
  useValues,
  onGestureEvent,
  timing,
  translate,
  clamp,
} from "react-native-redash";
import { useMemoOne } from "use-memo-one";
import {
  PanGestureHandler,
  State,
  PinchGestureHandler,
} from "react-native-gesture-handler";

import { CANVAS_SIZE } from "@lib";

const {
  set,
  cond,
  eq,
  or,
  add,
  sub,
  pow,
  min,
  max,
  debug,
  multiply,
  divide,
  lessThan,
  spring,
  defined,
  decay,
  timing: reanimatedTiming,
  call,
  diff,
  acc,
  not,
  abs,
  block,
  startClock,
  stopClock,
  clockRunning,
  Value,
  Clock,
  event,
} = Animated;

function scaleDiff(value: Animated.Adaptable<number>) {
  const tmp = new Value(1);
  const prev = new Value(1);
  return [set(tmp, divide(value, prev)), set(prev, value), tmp];
}

function dragDiff(
  value: Animated.Adaptable<number>,
  updating: Animated.Adaptable<0 | 1>
) {
  const tmp = new Value(0);
  const prev = new Value(0);
  return cond(
    updating,
    [set(tmp, sub(value, prev)), set(prev, value), tmp],
    set(prev, 0)
  );
}

// returns linear friction coeff. When `value` is 0 coeff is 1 (no friction), then
// it grows linearly until it reaches `MAX_FRICTION` when `value` is equal
// to `MAX_VALUE`
function friction(value: Animated.Adaptable<number>) {
  const MAX_FRICTION = 5;
  const MAX_VALUE = 100;
  return max(
    1,
    min(MAX_FRICTION, add(1, multiply(value, (MAX_FRICTION - 1) / MAX_VALUE)))
  );
}

function speed(value: Animated.Adaptable<number>) {
  const clock = new Clock();
  const dt = diff(clock);
  return cond(lessThan(dt, 1), 0, multiply(1000, divide(diff(value), dt)));
}

const MIN_SCALE = 1;
const MAX_SCALE = 4;

function scaleRest(value: Animated.Adaptable<number>) {
  return cond(
    lessThan(value, MIN_SCALE),
    MIN_SCALE,
    cond(lessThan(MAX_SCALE, value), MAX_SCALE, value)
  );
}

function scaleFriction(
  value: Animated.Adaptable<number>,
  rest: Animated.Adaptable<number>,
  delta: Animated.Adaptable<number>
) {
  const MAX_FRICTION = 20;
  const MAX_VALUE = 0.5;
  const res = multiply(value, delta);
  const howFar = abs(sub(rest, value));
  const friction = max(
    1,
    min(MAX_FRICTION, add(1, multiply(howFar, (MAX_FRICTION - 1) / MAX_VALUE)))
  );
  return cond(
    lessThan(0, howFar),
    multiply(value, add(1, divide(add(delta, -1), friction))),
    res
  );
}

function runTiming(
  clock: Animated.Clock,
  value: Animated.Adaptable<number>,
  dest: Animated.Adaptable<number>,
  startStopClock = true
) {
  const state = {
    finished: new Value(0),
    position: new Value(0),
    frameTime: new Value(0),
    time: new Value(0),
  };

  const config = {
    toValue: new Value(0),
    duration: 300,
    easing: Easing.inOut(Easing.cubic),
  };

  return [
    cond(clockRunning(clock), 0, [
      set(state.finished, 0),
      set(state.frameTime, 0),
      set(state.time, 0),
      set(state.position, value),
      set(config.toValue, dest),
      cond(bin(startStopClock), startClock(clock)),
    ]),
    reanimatedTiming(clock, state, config),
    cond(state.finished, cond(bin(startStopClock), stopClock(clock))),
    state.position,
  ];
}

function runDecay(
  clock: Animated.Clock,
  value: Animated.Adaptable<number>,
  velocity: Animated.Adaptable<number>
) {
  const state = {
    finished: new Value(0),
    velocity: new Value(0),
    position: new Value(0),
    time: new Value(0),
  };

  const config = { deceleration: 0.99 };

  return [
    cond(clockRunning(clock), 0, [
      set(state.finished, 0),
      set(state.velocity, velocity),
      set(state.position, value),
      set(state.time, 0),
      startClock(clock),
    ]),
    set(state.position, value),
    decay(clock, state, config),
    cond(state.finished, stopClock(clock)),
    state.position,
  ];
}

function bouncyPinch(
  value: Animated.Adaptable<number>,
  gesture: Animated.Adaptable<number>,
  gestureActive: Animated.Node<number>,
  focalX: Animated.Adaptable<number>,
  displacementX: Animated.Value<number>,
  focalY: Animated.Adaptable<number>,
  displacementY: Animated.Value<number>
) {
  const clock = new Clock();

  const delta = scaleDiff(gesture);
  const rest = clamp(value, MIN_SCALE, MAX_SCALE);

  const focalXRest = cond(
    lessThan(value, 1),
    0,
    sub(displacementX, multiply(focalX, add(-1, divide(rest, value))))
  );

  const focalYRest = cond(
    lessThan(value, 1),
    0,
    sub(displacementY, multiply(focalY, add(-1, divide(rest, value))))
  );

  const nextScale = new Value(1);

  return cond(
    gestureActive,
    [
      stopClock(clock),
      set(nextScale, scaleFriction(value, rest, delta)),
      set(
        displacementX,
        sub(displacementX, multiply(focalX, add(-1, divide(nextScale, value))))
      ),
      set(
        displacementY,
        sub(displacementY, multiply(focalY, add(-1, divide(nextScale, value))))
      ),
      nextScale,
    ],
    cond(
      or(clockRunning(clock), not(eq(rest, value))),
      [
        set(
          displacementX,
          timing({ clock, from: displacementX, to: focalXRest })
        ),
        set(
          displacementY,
          timing({ clock, from: displacementY, to: focalYRest })
        ),
        timing({ clock, from: value, to: rest }),
      ],
      value
    )
  );
}

function bouncy(
  value: Animated.Adaptable<number>,
  gestureDiv: Animated.Node<number>,
  gestureActive: Animated.Node<number>,
  lowerBound: Animated.Node<number>,
  upperBound: Animated.Node<number>,
  friction: (val: Animated.Node<number>) => Animated.Node<number>
) {
  const timingClock = new Clock();
  const decayClock = new Clock();

  const velocity = speed(value);

  // did value go beyond the limits (lower, upper)
  const isOutOfBounds = or(
    lessThan(value, lowerBound),
    lessThan(upperBound, value)
  );
  // position to snap to (upper or lower is beyond or the current value elsewhere)
  const rest = cond(
    lessThan(value, lowerBound),
    lowerBound,
    cond(lessThan(upperBound, value), upperBound, value)
  );
  // how much the value exceeds the bounds, this is used to calculate friction
  const outOfBounds = abs(sub(rest, value));

  return cond(
    [gestureDiv, velocity, gestureActive],
    [
      stopClock(timingClock),
      stopClock(decayClock),
      add(value, divide(gestureDiv, friction(outOfBounds))),
    ],
    cond(
      or(clockRunning(timingClock), isOutOfBounds),
      [stopClock(decayClock), runTiming(timingClock, value, rest)],
      cond(
        or(clockRunning(decayClock), lessThan(5, abs(velocity))),
        runDecay(decayClock, value, velocity),
        value
      )
    )
  );
}

const WIDTH = CANVAS_SIZE;
const HEIGHT = CANVAS_SIZE;

export interface ZoomPanHandlerProps {
  onGestureBegan: Animated.Adaptable<number>;
}

const ZoomPanHandler: React.FC<ZoomPanHandlerProps> = ({
  children,
  onGestureBegan,
}) => {
  const pinchRef = useRef<PinchGestureHandler>(null);
  const panRef = useRef<PanGestureHandler>(null);

  const [
    panTransX,
    panTransY,
    pinchScale,
    pinchFocalX,
    pinchFocalY,
    focalDisplacementX,
    focalDisplacementY,
    scale,
    dragX,
    dragY,
  ] = useValues<number>([0, 0, 1, 0, 0, 0, 0, 1, 0, 0], []);

  const [pinchState, panState] = useValues(
    [State.UNDETERMINED, State.UNDETERMINED],
    []
  );

  const pinchActive = eq(pinchState, State.ACTIVE);
  const pinchHandler = onGestureEvent({
    state: pinchState,
    scale: pinchScale,
    focalX: pinchFocalX,
    focalY: pinchFocalY,
  });

  const panHandler = onGestureEvent({
    state: panState,
    translationX: dragX,
    translationY: dragY,
  });

  const relativeFocalX = sub(pinchFocalX, add(panTransX, focalDisplacementX));
  const relativeFocalY = sub(pinchFocalY, add(panTransY, focalDisplacementY));

  const _scale = set(
    scale,
    bouncyPinch(
      scale,
      pinchScale,
      pinchActive,
      relativeFocalX,
      focalDisplacementX,
      relativeFocalY,
      focalDisplacementY
    )
  );

  const panActive = eq(panState, State.ACTIVE);

  // X
  const panUpX = cond(lessThan(_scale, 1), 0, multiply(-1, focalDisplacementX));
  const panLowX = add(panUpX, multiply(-WIDTH, add(max(1, _scale), -1)));

  // Y
  const panUpY = cond(lessThan(_scale, 1), 0, multiply(-1, focalDisplacementY));
  const panLowY = add(panUpY, multiply(-HEIGHT, add(max(1, _scale), -1)));

  const trans = useMemoOne(
    () => ({
      x: set(
        panTransX,
        bouncy(
          panTransX,
          dragDiff(dragX, panActive),
          or(panActive, pinchActive),
          panLowX,
          panUpX,
          friction
        )
      ),
      y: set(
        panTransY,
        bouncy(
          panTransY,
          dragDiff(dragY, panActive),
          or(panActive, pinchActive),
          panLowY,
          panUpY,
          friction
        )
      ),
    }),
    []
  );

  const gestureBegan = or(panActive, pinchActive);
  useCode(() => [onChange(gestureBegan, onGestureBegan)], []);

  const scaleTopLeftFixX = divide(multiply(WIDTH, add(_scale, -1)), 2);
  const scaleTopLeftFixY = divide(multiply(HEIGHT, add(_scale, -1)), 2);
  return (
    <View style={styles.wrapper}>
      <PinchGestureHandler
        ref={pinchRef}
        simultaneousHandlers={panRef}
        {...pinchHandler}
      >
        <Animated.View>
          <PanGestureHandler
            ref={panRef}
            minDist={10}
            avgTouches
            simultaneousHandlers={pinchRef}
            {...panHandler}
          >
            <Animated.View
              style={[
                {
                  width: CANVAS_SIZE,
                  height: CANVAS_SIZE,
                  transform: [
                    ...translate(trans),
                    { translateX: focalDisplacementX },
                    { translateY: focalDisplacementY },
                    { translateX: scaleTopLeftFixX },
                    { translateY: scaleTopLeftFixY },
                    { scale: _scale },
                  ],
                },
              ]}
            >
              {children}
            </Animated.View>
          </PanGestureHandler>
        </Animated.View>
      </PinchGestureHandler>
    </View>
  );
};

export default ZoomPanHandler;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
