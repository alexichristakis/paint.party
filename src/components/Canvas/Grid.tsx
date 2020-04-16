import React, { useRef, useEffect } from "react";
import { View } from "react-native";
import times from "lodash/times";
import Svg, { Rect } from "react-native-svg";
import { useSelector } from "react-redux";
import CaptureView from "react-native-view-shot";

import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { CANVAS_DIMENSIONS, CANVAS_SIZE, CELL_SIZE } from "@lib";
import { useReduxAction } from "@hooks";
import { VisualizationActions } from "@redux/modules";

export interface GridProps {
  gridRef: React.RefObject<View>;
  backgroundColor: string;
}

const Cell = ({ i, j }: { i: number; j: number }) => {
  const fill = useSelector((state: RootState) =>
    selectors.cellColor(state, i * CANVAS_DIMENSIONS + j)
  );

  if (fill)
    return (
      <Rect
        x={CELL_SIZE * j}
        y={CELL_SIZE * i}
        width={CELL_SIZE}
        height={CELL_SIZE}
        fill={fill}
      />
    );

  return null;
};

export default React.memo(({ gridRef, backgroundColor }: GridProps) => {
  return (
    // <CaptureView ref={viewShot}>
    <View ref={gridRef} style={{ backgroundColor }}>
      <Svg width={CANVAS_SIZE} height={CANVAS_SIZE}>
        {times(CANVAS_DIMENSIONS, (i) =>
          times(CANVAS_DIMENSIONS, (j) => (
            <Cell key={`${i}-${j}`} {...{ i, j }} />
          ))
        )}
      </Svg>
    </View>
    // </CaptureView>
  );
});
