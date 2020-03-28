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
import { useMemoOne } from "use-memo-one";
import { connect, ConnectedProps } from "react-redux";

import * as selectors from "@redux/selectors";
import { coordinatesToIndex } from "@lib";
import { RootState } from "@redux/types";
import { CanvasActions } from "@redux/modules";

import Grid from "./Grid";
import CellHighlight from "./CellHighlight";
import PositionsOverlay from "./PositionsOverlay";

const { onChange, useCode, or, eq, set, cond, call } = Animated;
const { ACTIVE, UNDETERMINED, END } = State;

const mapStateToProps = (state: RootState) => ({
  backgroundColor: selectors.activeCanvasBackgroundColor(state)
});
const mapDispatchToProps = {
  selectCell: CanvasActions.selectCell
};

export type VisualizationReduxProps = ConnectedProps<typeof connector>;
export interface VisualizationProps {
  positionsVisible: Animated.Value<0 | 1>;
  pickerVisible: Animated.Value<0 | 1>;
}

const Visualization: React.FC<VisualizationProps & VisualizationReduxProps> = ({
  pickerVisible,
  positionsVisible,
  selectCell,
  backgroundColor
}) => {
  const pinchRef = useRef<PinchGestureHandler>(null);
  const panRef = useRef<PanGestureHandler>(null);
  const childRef = useRef<Animated.View>(null);

  const [pinchState, panState, tapState] = useValues<State>(
    [UNDETERMINED, UNDETERMINED, UNDETERMINED],
    []
  );

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

  const gestureBegan = or(eq(panState, ACTIVE), eq(pinchState, ACTIVE));
  useCode(
    () => [
      onChange(gestureBegan, cond(gestureBegan, set(pickerVisible, 0))),
      onChange(
        tapState,
        cond(eq(tapState, END), [
          call([tapX, tapY], handleOnPressCell),
          set(pickerVisible, 1),
          cond(positionsVisible, set(positionsVisible, 0))
        ])
      )
    ],
    []
  );

  const translationStyle = { transform: [{ translateX }, { translateY }] };
  const scaleStyle = { transform: [{ scale }] };
  return (
    <PanGestureHandler
      avgTouches={true}
      ref={panRef}
      minDist={10}
      simultaneousHandlers={pinchRef}
      {...panHandler}
    >
      <Animated.View style={translationStyle}>
        <PinchGestureHandler
          ref={pinchRef}
          simultaneousHandlers={panRef}
          {...pinchHandler}
        >
          <Animated.View>
            <TapGestureHandler {...tapHandler}>
              <Animated.View ref={childRef} style={scaleStyle}>
                <Grid backgroundColor={backgroundColor} />
                <PositionsOverlay visible={positionsVisible} />
                <CellHighlight visible={pickerVisible} />
              </Animated.View>
            </TapGestureHandler>
          </Animated.View>
        </PinchGestureHandler>
      </Animated.View>
    </PanGestureHandler>
  );
};

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(Visualization);
