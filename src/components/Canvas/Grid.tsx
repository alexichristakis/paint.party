import React, { useRef, useEffect } from "react";
import { View } from "react-native";
import times from "lodash/times";
import Svg, { Rect } from "react-native-svg";
import { useSelector } from "react-redux";
import CaptureView from "react-native-view-shot";

import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { CANVAS_DIMENSIONS, CANVAS_SIZE, CELL_SIZE } from "@lib";

export interface GridProps {
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

export default React.memo(({ backgroundColor }: GridProps) => {
  const viewShot = useRef<CaptureView>(null);

  useEffect(() => {
    viewShot.current?.capture().then((res) => console.log(res));
  }, []);

  return (
    <CaptureView ref={viewShot}>
      <View style={{ backgroundColor }}>
        <Svg width={CANVAS_SIZE} height={CANVAS_SIZE}>
          {times(CANVAS_DIMENSIONS, (i) =>
            times(CANVAS_DIMENSIONS, (j) => (
              <Cell key={`${i}-${j}`} {...{ i, j }} />
            ))
          )}
        </Svg>
      </View>
    </CaptureView>
  );
});
