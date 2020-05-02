import React, { useCallback, useMemo } from "react";
import { State, TapGestureHandler } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { useValue, useVector, useGestureHandler } from "react-native-redash";
import { connect, ConnectedProps } from "react-redux";
import isEqual from "lodash/isEqual";

import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { coordinatesToIndex, onPress } from "@lib";

import Grid from "./Grid";
import CellHighlight from "./CellHighlight";
import PositionsOverlay from "./PositionsOverlay";
import ZoomPanHandler from "./ZoomPanHandler";
import { DrawActions } from "@redux/modules";

const { useCode, not, set, cond, call } = Animated;
const { UNDETERMINED } = State;

const connector = connect(
  (state: RootState) => ({
    backgroundColor: selectors.activeCanvasBackgroundColor(state),
  }),
  {
    selectCell: DrawActions.selectCell,
  }
);

export type VisualizationReduxProps = ConnectedProps<typeof connector>;
export interface VisualizationProps {
  positionsVisible: Animated.Value<0 | 1>;
  pickerVisible: Animated.Value<0 | 1>;
}

const Visualization: React.FC<
  VisualizationProps & VisualizationReduxProps
> = React.memo(
  ({ pickerVisible, positionsVisible, selectCell, backgroundColor }) => {
    const tap = useVector(0, 0);
    const tapState = useValue(UNDETERMINED);
    const tapGestureHandler = useGestureHandler({ state: tapState, ...tap });

    const handleOnPressCell = useCallback(
      ([x, y]: Readonly<number[]>) => selectCell(coordinatesToIndex(x, y)),
      [selectCell]
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

    return useMemo(
      () => (
        <ZoomPanHandler
          onGestureBegan={cond(pickerVisible, set(pickerVisible, 0))}
        >
          <TapGestureHandler {...tapGestureHandler}>
            <Animated.View>
              <Grid {...{ backgroundColor }} />
              <PositionsOverlay visible={positionsVisible} />
              <CellHighlight visible={pickerVisible} />
            </Animated.View>
          </TapGestureHandler>
        </ZoomPanHandler>
      ),
      [tapGestureHandler, backgroundColor, pickerVisible, positionsVisible]
    );
  },
  (p, n) => isEqual(p, n)
);

export default connector(Visualization);
