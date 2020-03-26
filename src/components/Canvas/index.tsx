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
import moment from "moment";
import { useSelector } from "react-redux";

import * as selectors from "@redux/selectors";
import { CANVAS_DIMENSIONS, coordinatesToIndex } from "@lib";

import { Row } from "./Row";
import { CellHighlight } from "./CellHighlight";
import { ColorPicker } from "./ColorPicker";
import { Countdown } from "./Countdown";

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
const { ACTIVE, BEGAN, UNDETERMINED, END } = State;

export interface CanvasProps {
  onPressCell: (cell: number, color: string) => void;
}

export const Canvas: React.FC<CanvasProps> = ({ onPressCell }) => {
  const [selectedCell, setSelectedCell] = useState(-1);

  const canvasActiveAt = useSelector(selectors.canvasActiveAt);

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
      onChange(gestureBegan, cond(gestureBegan, set(pickerVisible, 0))),
      onChange(
        tapState,
        cond(eq(tapState, END), [
          set(pickerVisible, 1),
          call([tapX, tapY], numbers =>
            handleOnPressCell(...(numbers as [number, number]))
          )
        ])
      )
    ],
    []
  );

  const enabled = canvasActiveAt < moment().unix();

  return (
    <>
      <Countdown enabled={enabled} toDate={canvasActiveAt} />
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
                  <CellHighlight visible={pickerVisible} cell={selectedCell} />
                </Animated.View>
              </TapGestureHandler>
            </Animated.View>
          </PinchGestureHandler>
        </Animated.View>
      </PanGestureHandler>
      <ColorPicker
        enabled={enabled}
        visible={pickerVisible}
        onChoose={handleOnChooseColor}
      />
    </>
  );
};
