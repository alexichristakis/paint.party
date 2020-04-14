import React, { useCallback } from "react";
import { State, TapGestureHandler } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { onGestureEvent, useValue, useVector } from "react-native-redash";
import { connect, ConnectedProps } from "react-redux";
import isEqual from "lodash/isEqual";

import * as selectors from "@redux/selectors";
import { coordinatesToIndex, onPress } from "@lib";
import { RootState } from "@redux/types";
import { VisualizationActions } from "@redux/modules";

import Grid from "./Grid";
import CellHighlight from "./CellHighlight";
import PositionsOverlay from "./PositionsOverlay";
import ZoomPanHandler from "./ZoomPanHandler";

const { useCode, not, set, cond, call } = Animated;
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
    const tap = useVector(0, 0, []);
    const tapState = useValue(UNDETERMINED, []);
    const tapGestureHandler = onGestureEvent({ state: tapState, ...tap });

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
        <TapGestureHandler {...tapGestureHandler}>
          <Animated.View>
            <Grid backgroundColor={backgroundColor} />
            <PositionsOverlay visible={positionsVisible} />
            <CellHighlight visible={pickerVisible} />
          </Animated.View>
        </TapGestureHandler>
      </ZoomPanHandler>
    );
  },
  (p, n) => isEqual(p, n)
);

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(Visualization);
