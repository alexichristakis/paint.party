import React, { useRef, useCallback, useMemo } from "react";
import {
  PanGestureHandler,
  PinchGestureHandler,
  State,
  TapGestureHandler,
} from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import {
  onGestureEvent,
  useValues,
  withScaleOffset,
  withDecay,
  transformOrigin,
  translate,
  vec,
  withOffset,
} from "react-native-redash";
import { useMemoOne } from "use-memo-one";
import { connect, ConnectedProps } from "react-redux";

import * as selectors from "@redux/selectors";
import { coordinatesToIndex, onPress, CANVAS_SIZE, SCREEN_HEIGHT } from "@lib";
import { RootState } from "@redux/types";
import { VisualizationActions } from "@redux/modules";

import Grid from "./Grid";
import CellHighlight from "./CellHighlight";
import PositionsOverlay from "./PositionsOverlay";
import ZoomPanHandler from "./ZoomPanHandler";
import { StyleSheet } from "react-native";

const {
  onChange,
  debug,
  useCode,
  or,
  and,
  neq,
  add,
  eq,
  not,
  set,
  cond,
  call,
} = Animated;
const { ACTIVE, BEGAN, END, UNDETERMINED } = State;

const mapStateToProps = (state: RootState) => ({
  backgroundColor: selectors.activeCanvasBackgroundColor(state),
});
const mapDispatchToProps = {
  selectCell: VisualizationActions.selectCell,
};

export type VisualizationReduxProps = ConnectedProps<typeof connector>;
export interface VisualizationProps {
  positionsVisible: Animated.Value<0 | 1>;
  pickerVisible: Animated.Value<0 | 1>;
}

const Visualization: React.FC<
  VisualizationProps & VisualizationReduxProps
> = React.memo(
  ({ pickerVisible, positionsVisible, selectCell, backgroundColor }) => {
    const pinchRef = useRef<PinchGestureHandler>(null);
    const panRef = useRef<PanGestureHandler>(null);
    const childRef = useRef<Animated.View>(null);

    // const velocity = vec.createValue(0, 0);
    // const drag = vec.create(0, 0);

    const [pinchState, panState, tapState] = useValues<State>(
      [UNDETERMINED, UNDETERMINED, UNDETERMINED],
      []
    );

    const [translation, focal, velocity, tap, origin] = useMemoOne(
      () => [
        vec.createValue(0, 0),
        vec.createValue(0, 0),
        vec.createValue(0, 0),
        vec.createValue(0, 0),
        vec.createValue(0, 0),
      ],
      []
    );

    const [pinch] = useValues<number>([1], []);

    // const [
    //   translationX,
    //   translationY,
    //   focalX,
    //   focalY,
    //   velocityY,
    //   velocityX,
    //   tapX,
    //   tapY,
    //   pinch,
    // ] = useValues<number>([0, 0, 0, 0, 0, 0, 0, 0, 1], []);

    const [pinchHandler, panHandler, tapHandler] = useMemoOne(
      () => [
        onGestureEvent({
          scale: pinch,
          state: pinchState,
          focalX: focal.x,
          focalY: focal.y,
        }),
        onGestureEvent({
          state: panState,
          translationX: translation.x,
          translationY: translation.y,
          velocityX: velocity.x,
          velocityY: velocity.y,
        }),
        onGestureEvent({ state: tapState, ...tap }),
      ],
      []
    );

    const deceleration = 0.992;
    const [scale, translateY, translateX] = useMemoOne(
      () => [
        withScaleOffset(pinch, pinchState),
        withDecay({
          state: panState,
          value: translation.y,
          velocity: velocity.y,
          deceleration,
        }),
        withDecay({
          state: panState,
          value: translation.x,
          velocity: velocity.x,
          deceleration,
        }),
      ],
      []
    );

    const handleOnPressCell = useCallback(
      ([x, y]: Readonly<number[]>) => selectCell(coordinatesToIndex(x, y)),
      []
    );

    const adjustedFocal = vec.add(
      {
        x: -CANVAS_SIZE / 2,
        y: CANVAS_SIZE / 2 - (SCREEN_HEIGHT - CANVAS_SIZE),
      },
      focal
    );

    // const trans = vec.createValue(0, 0);

    const gestureBegan = or(eq(panState, ACTIVE), eq(pinchState, ACTIVE));
    useCode(
      () => [
        cond(eq(pinchState, BEGAN), [
          vec.set(origin, adjustedFocal),
          debug("originX", origin.x),
          debug("originY", origin.y),
        ]),
        onChange(
          pinchState,
          cond(eq(pinchState, END), [
            //
            vec.set(focal, trans),
          ])
        ),
        onChange(
          gestureBegan,
          cond(and(gestureBegan, pickerVisible), set(pickerVisible, 0))
        ),
        onPress(tapState, [
          call([tap.x, tap.y], handleOnPressCell),
          cond(not(pickerVisible), set(pickerVisible, 1)),
          cond(positionsVisible, set(positionsVisible, 0)),
        ]),
      ],
      []
    );

    const trans = useMemoOne(() => {
      const { x, y } = vec.invert(vec.sub(origin, adjustedFocal));

      const start = and(neq(pinchState, BEGAN), neq(pinchState, UNDETERMINED));
      return {
        x: withOffset(cond(start, x, 0), pinchState),
        y: withOffset(cond(start, y, 0), pinchState),
      };
    }, []);

    useCode(
      () => [
        debug("x", trans.x),
        debug("y", trans.y),
        // debug("x", vec.invert(vec.sub(origin, adjustedFocal)).x),
        // debug("y", vec.invert(vec.sub(origin, adjustedFocal)).y),
      ],
      []
    );

    const translationStyle = {}; // { transform: [{ translateX }, { translateY }] };
    const scaleStyle = {
      paddingTop: (SCREEN_HEIGHT - CANVAS_SIZE) / 2,
      transform: [
        ...translate(trans),
        ...transformOrigin(origin, { scale }),
        // ...translate(origin),
        // { scale },
        // ...translate(vec.multiply(origin, -1)),
        // ...translate({ x: CANVAS_SIZE / 2, y: CANVAS_SIZE / 2 }),
      ],
    };

    return (
      <ZoomPanHandler>
        <TapGestureHandler {...tapHandler}>
          <Animated.View ref={childRef}>
            <Grid backgroundColor={backgroundColor} />
            <PositionsOverlay visible={positionsVisible} />
            <CellHighlight visible={pickerVisible} />
          </Animated.View>
        </TapGestureHandler>
      </ZoomPanHandler>
    );

    return (
      // <PanGestureHandler
      //   avgTouches
      //   ref={panRef}
      //   minDist={10}
      //   simultaneousHandlers={pinchRef}
      //   {...panHandler}
      // >
      //   <Animated.View style={translationStyle}>
      <PinchGestureHandler
        ref={pinchRef}
        simultaneousHandlers={panRef}
        {...pinchHandler}
      >
        <Animated.View style={StyleSheet.absoluteFill}>
          <Animated.View style={scaleStyle}>
            {/* <TapGestureHandler {...tapHandler}>
              <Animated.View ref={childRef}> */}
            <Grid backgroundColor={backgroundColor} />
            <PositionsOverlay visible={positionsVisible} />
            <CellHighlight visible={pickerVisible} />
            {/* </Animated.View> */}
            {/* </TapGestureHandler> */}
          </Animated.View>
        </Animated.View>
      </PinchGestureHandler>
      //   </Animated.View>
      // </PanGestureHandler>
    );
  },
  (p, n) => p.backgroundColor === n.backgroundColor
);

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(Visualization);
