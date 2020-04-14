import React, { useRef, useCallback } from "react";
import { State, TapGestureHandler } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { onGestureEvent, useValues, useVector } from "react-native-redash";
import { useMemoOne } from "use-memo-one";
import { connect, ConnectedProps } from "react-redux";

import * as selectors from "@redux/selectors";
import { coordinatesToIndex, onPress } from "@lib";
import { RootState } from "@redux/types";
import { VisualizationActions } from "@redux/modules";

import Grid from "./Grid";
import CellHighlight from "./CellHighlight";
import PositionsOverlay from "./PositionsOverlay";
import ZoomPanHandler from "./ZoomPanHandler";

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
const { UNDETERMINED } = State;

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
    const childRef = useRef<Animated.View>(null);

    const tap = useVector(0, 0, []);

    const [tapState] = useValues<State>([UNDETERMINED], []);

    const tapHandler = useMemoOne(
      () => onGestureEvent({ state: tapState, ...tap }),
      []
    );

    const handleOnPressCell = useCallback(
      ([x, y]: Readonly<number[]>) => selectCell(coordinatesToIndex(x, y)),
      []
    );

    useCode(
      () => [
        onPress(tapState, [
          call([tap.x, tap.y], handleOnPressCell),
          cond(not(pickerVisible), set(pickerVisible, 1)),
          cond(positionsVisible, set(positionsVisible, 0)),
        ]),
      ],
      []
    );

    const onGestureBegan = cond(pickerVisible, set(pickerVisible, 0));
    return (
      <ZoomPanHandler onGestureBegan={onGestureBegan}>
        <TapGestureHandler {...tapHandler}>
          <Animated.View ref={childRef}>
            <Grid backgroundColor={backgroundColor} />
            <PositionsOverlay visible={positionsVisible} />
            <CellHighlight visible={pickerVisible} />
          </Animated.View>
        </TapGestureHandler>
      </ZoomPanHandler>
    );
  },
  (p, n) => p.backgroundColor === n.backgroundColor
);

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(Visualization);
