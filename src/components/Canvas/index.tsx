import React, { useRef, useCallback } from "react";
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
  withScaleOffset,
  withDecay
} from "react-native-redash";
import times from "lodash/times";
import { useMemoOne } from "use-memo-one";
import { connect, ConnectedProps } from "react-redux";

import * as selectors from "@redux/selectors";
import { CANVAS_DIMENSIONS, coordinatesToIndex } from "@lib";

import { Row } from "./Row";
import { CellHighlight } from "./CellHighlight";
import { ColorPicker } from "./ColorPicker";
import { RootState } from "@redux/types";
import { CanvasActions } from "@redux/modules";
import { LoadingOverlay } from "@components/universal";

const { onChange, useCode, or, eq, set, cond, call } = Animated;
const { ACTIVE, UNDETERMINED, END } = State;

const mapStateToProps = (state: RootState) => ({
  backgroundColor: selectors.activeCanvasEntity(state).backgroundColor
});
const mapDispatchToProps = {
  selectColor: CanvasActions.selectColor,
  selectCell: CanvasActions.selectCell
};

export type CanvasReduxProps = ConnectedProps<typeof connector>;
export interface CanvasProps {
  loading: boolean;
}

const Canvas: React.FC<CanvasProps & CanvasReduxProps> = ({
  loading,
  selectCell,
  selectColor,
  backgroundColor
}) => {
  const pinchRef = useRef<PinchGestureHandler>(null);
  const panRef = useRef<PanGestureHandler>(null);
  const childRef = useRef<Animated.View>(null);

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
    ([x, y]: Readonly<number[]>) => selectCell(coordinatesToIndex(x, y)),
    []
  );

  const handleOnChooseColor = useCallback((color: string) => {
    pickerVisible.setValue(0);
    selectColor(color);
  }, []);

  const gestureBegan = or(eq(panState, ACTIVE), eq(pinchState, ACTIVE));
  useCode(
    () => [
      onChange(gestureBegan, cond(gestureBegan, set(pickerVisible, 0))),
      onChange(
        tapState,
        cond(eq(tapState, END), [
          call([tapX, tapY], handleOnPressCell),
          set(pickerVisible, 1)
        ])
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
                  style={{ backgroundColor, transform: [{ scale }] }}
                >
                  {times(CANVAS_DIMENSIONS, i => (
                    <Row key={i} index={i} />
                  ))}
                  <CellHighlight visible={pickerVisible} />
                </Animated.View>
              </TapGestureHandler>
            </Animated.View>
          </PinchGestureHandler>
        </Animated.View>
      </PanGestureHandler>
      <ColorPicker visible={pickerVisible} onChoose={handleOnChooseColor} />
      <LoadingOverlay loading={loading} />
    </>
  );
};

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(Canvas);
