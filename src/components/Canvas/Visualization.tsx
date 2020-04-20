import React, { useCallback, useContext, useMemo } from "react";
import { State, TapGestureHandler } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { useValue, useVector, useGestureHandler } from "react-native-redash";
import { connect, ConnectedProps } from "react-redux";
import isEqual from "lodash/isEqual";

import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { coordinatesToIndex, onPress } from "@lib";
import { DrawContext } from "@hooks";

import Grid from "./Grid";
import CellHighlight from "./CellHighlight";
import PositionsOverlay from "./PositionsOverlay";
import ZoomPanHandler from "./ZoomPanHandler";

const { useCode, not, set, cond, call } = Animated;
const { UNDETERMINED } = State;

const mapStateToProps = (state: RootState) => ({
  backgroundColor: selectors.activeCanvasBackgroundColor(state),
});
const mapDispatchToProps = {};

export type VisualizationReduxProps = ConnectedProps<typeof connector>;
export interface VisualizationProps {
  positionsVisible: Animated.Value<0 | 1>;
  pickerVisible: Animated.Value<0 | 1>;
}

const Visualization: React.FC<
  VisualizationProps & VisualizationReduxProps
> = React.memo(
  ({ pickerVisible, positionsVisible, backgroundColor }) => {
    const tap = useVector(0, 0, []);
    const tapState = useValue(UNDETERMINED, []);
    const tapGestureHandler = useGestureHandler(
      { state: tapState, ...tap },
      []
    );

    const { captureRef, selectCell, cell } = useContext(DrawContext);

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
              <Grid {...{ captureRef, backgroundColor }} />
              <PositionsOverlay visible={positionsVisible} />
              <CellHighlight cell={cell} visible={pickerVisible} />
            </Animated.View>
          </TapGestureHandler>
        </ZoomPanHandler>
      ),
      [
        cell,
        captureRef,
        tapGestureHandler,
        backgroundColor,
        pickerVisible,
        positionsVisible,
      ]
    );
  },
  (p, n) => isEqual(p, n)
);

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(Visualization);
