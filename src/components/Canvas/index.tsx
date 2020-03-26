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
  useTransition
} from "react-native-redash";
import times from "lodash/times";
import { useMemoOne } from "use-memo-one";

import { Colors, CANVAS_DIMENSIONS, coordinatesToIndex } from "@lib";
import { Row } from "./Row";
import { CellHighlight } from "./CellHighlight";
import { ColorPicker } from "./ColorPicker";
import { StyleSheet, ActivityIndicator } from "react-native";

const { onChange, useCode, or, eq, set, cond, call } = Animated;
const { ACTIVE, UNDETERMINED, END } = State;

export interface CanvasProps {
  enabled: boolean;
  loading: boolean;
  onDraw: (cell: number, color: string) => void;
}

export const Canvas: React.FC<CanvasProps> = ({ loading, onDraw, enabled }) => {
  const [selectedCell, setSelectedCell] = useState(-1);

  const pinchRef = useRef<PinchGestureHandler>(null);
  const panRef = useRef<PanGestureHandler>(null);
  const childRef = useRef<Animated.View>(null);

  const [pinchState, panState, tapState] = useValues<State>(
    [UNDETERMINED, UNDETERMINED, UNDETERMINED],
    []
  );

  const [pickerVisible] = useValues<0 | 1>([0], []);
  const [dragX, dragY, tapX, tapY, pinch] = useValues<number>(
    [0, 0, 0, 0, 1],
    []
  );

  const [pinchHandler, panHandler, tapHandler] = useMemoOne(
    () => [
      onGestureEvent({
        scale: pinch,
        state: pinchState
      }),
      onGestureEvent({
        state: panState,
        translationX: dragX,
        translationY: dragY
      }),
      onGestureEvent({ state: tapState, x: tapX, y: tapY })
    ],
    []
  );

  const [scale, translateY, translateX] = useMemoOne(
    () => [
      withScaleOffset(pinch, pinchState),
      withOffset(dragY, panState),
      withOffset(dragX, panState)
    ],
    []
  );

  const gestureBegan = or(eq(panState, ACTIVE), eq(pinchState, ACTIVE));

  const handleOnPressCell = useCallback(
    (x: number, y: number) => setSelectedCell(coordinatesToIndex(x, y)),
    []
  );

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
                  style={{ transform: [{ scale }] }}
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
