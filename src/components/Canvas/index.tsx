import React, { useRef, useState, useCallback } from "react";
import {
  PanGestureHandler,
  PinchGestureHandler,
  State,
  TapGestureHandler
} from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import {
  onGestureEvent,
  useValues,
  withOffset,
  withScaleOffset,
  useTransition,
  withDecay
} from "react-native-redash";
import times from "lodash/times";
import { useMemoOne } from "use-memo-one";
import { StyleSheet, ActivityIndicator } from "react-native";
import { useSelector } from "react-redux";

import * as selectors from "@redux/selectors";
import { Colors, CANVAS_DIMENSIONS, coordinatesToIndex } from "@lib";

import { Row } from "./Row";
import { CellHighlight } from "./CellHighlight";
import { ColorPicker } from "./ColorPicker";

const { onChange, useCode, or, debug, eq, set, cond, call } = Animated;
const { ACTIVE, UNDETERMINED, END } = State;

export interface CanvasProps {
  enabled: boolean;
  loading: boolean;
  onDraw: (cell: number, color: string) => void;
}

export const Canvas: React.FC<CanvasProps> = ({ loading, onDraw, enabled }) => {
  const [selectedCell, setSelectedCell] = useState(-1);

  console.log("render canvas");

  const pinchRef = useRef<PinchGestureHandler>(null);
  const panRef = useRef<PanGestureHandler>(null);
  const childRef = useRef<Animated.View>(null);

  const { backgroundColor } = useSelector(selectors.activeCanvasEntity);

  const [pinchState, panState, tapState] = useValues<State>(
    [UNDETERMINED, UNDETERMINED, UNDETERMINED],
    []
  );

  const [pickerVisible] = useValues<0 | 1>([0], []);
  const [
    dragX,
    dragY,
    velocityY,
    velocityX,
    pinchVelocity,
    tapX,
    tapY,
    pinch
  ] = useValues<number>([0, 0, 0, 0, 0, 0, 0, 1], []);

  const [pinchHandler, panHandler, tapHandler] = useMemoOne(
    () => [
      onGestureEvent({
        scale: pinch,
        state: pinchState,
        velocity: pinchVelocity
      }),
      onGestureEvent({
        state: panState,
        translationX: dragX,
        translationY: dragY,
        velocityX,
        velocityY
      }),
      onGestureEvent({ state: tapState, x: tapX, y: tapY })
    ],
    []
  );

  const deceleration = 0.979;
  const [scale, translateY, translateX] = useMemoOne(
    () => [
      withScaleOffset(pinch, pinchState),
      withDecay({
        state: panState,
        value: dragY,
        velocity: velocityY,
        deceleration
      }),
      withDecay({
        state: panState,
        value: dragX,
        velocity: velocityX,
        deceleration
      })
    ],
    []
  );

  const handleOnPressCell = useCallback(
    (x: number, y: number) => setSelectedCell(coordinatesToIndex(x, y)),
    []
  );

  const gestureBegan = or(eq(panState, ACTIVE), eq(pinchState, ACTIVE));
  useCode(
    () => [
      onChange(gestureBegan, cond(gestureBegan, set(pickerVisible, 0))),
      onChange(
        tapState,
        cond(eq(tapState, END), [
          call([tapX, tapY], numbers =>
            handleOnPressCell(...(numbers as [number, number]))
          ),
          set(pickerVisible, 1)
        ])
      )
    ],
    []
  );

  const loadingOverlayOpacity = useTransition(loading);
  return (
    <>
      <PanGestureHandler
        avgTouches={true}
        ref={panRef}
        minDist={10}
        simultaneousHandlers={pinchRef}
        {...panHandler}
      >
        <Animated.View
          style={{
            transform: [{ translateX }, { translateY }]
          }}
        >
          <PinchGestureHandler
            ref={pinchRef}
            simultaneousHandlers={panRef}
            {...pinchHandler}
          >
            <Animated.View>
              <TapGestureHandler {...tapHandler}>
                <Animated.View
                  ref={childRef}
                  style={{ backgroundColor, transform: [{ scale }] }}
                >
                  {times(CANVAS_DIMENSIONS, i => (
                    <Row key={i} index={i} />
                  ))}
                  <CellHighlight
                    visible={pickerVisible}
                    cell={selectedCell}
                    reset={() => setSelectedCell(-1)}
                  />
                </Animated.View>
              </TapGestureHandler>
            </Animated.View>
          </PinchGestureHandler>
        </Animated.View>
      </PanGestureHandler>
      <ColorPicker
        enabled={enabled}
        visible={pickerVisible}
        cell={selectedCell}
        onChoose={onDraw}
      />

      <Animated.View
        pointerEvents={loading ? "auto" : "none"}
        style={[styles.loadingOverlay, { opacity: loadingOverlayOpacity }]}
      >
        <ActivityIndicator style={styles.loadingIndicator} size={"large"} />
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center"
  },
  loadingIndicator: {
    width: 80,
    height: 80,
    backgroundColor: Colors.transGray,
    transform: [{ scale: 1.5 }],
    borderRadius: 15
  }
});
