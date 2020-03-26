import React, { useRef, useState, useMemo, useCallback } from "react";
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
  withScaleOffset
} from "react-native-redash";
import times from "lodash/times";
import { useMemoOne } from "use-memo-one";

import { CANVAS_DIMENSIONS, coordinatesToIndex } from "@lib";

import { Row } from "./Row";
import { CellHighlight } from "./CellHighlight";
import { ColorPicker } from "./ColorPicker";

const {
  add,
  onChange,
  multiply,
  sub,
  clockRunning,
  max,
  useCode,
  and,
  not,
  or,
  eq,
  debug,
  set,
  divide,
  block,
  cond,
  call
} = Animated;
const { UNDETERMINED, END } = State;

export interface CanvasProps {
  onPressCell: (cell: number, color: string) => void;
}

export const Canvas: React.FC<CanvasProps> = ({ onPressCell }) => {
  const [selectedCell, setSelectedCell] = useState(-1);

  const pinchRef = useRef<PinchGestureHandler>(null);
  const panRef = useRef<PanGestureHandler>(null);
  const childRef = useRef<Animated.View>(null);

  const [pinchState, panState, tapState] = useValues<State>(
    [UNDETERMINED, UNDETERMINED, UNDETERMINED],
    []
  );

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

  const handleOnChooseColor = useCallback(
    (color: string) => onPressCell(selectedCell, color),
    [selectedCell]
  );

  const handleOnPressCell = useCallback(
    (x: number, y: number) => setSelectedCell(coordinatesToIndex(x, y)),
    []
  );

  useCode(
    () => [
      onChange(
        tapState,
        cond(
          eq(tapState, END),
          call([tapX, tapY], numbers =>
            handleOnPressCell(...(numbers as [number, number]))
          )
        )
      )
    ],
    []
  );

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
                  <CellHighlight cell={selectedCell} />
                </Animated.View>
              </TapGestureHandler>
            </Animated.View>
          </PinchGestureHandler>
        </Animated.View>
      </PanGestureHandler>
      <ColorPicker cell={selectedCell} onChooseColor={handleOnChooseColor} />
    </>
  );
};
