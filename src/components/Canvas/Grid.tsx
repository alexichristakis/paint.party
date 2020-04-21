import React from "react";
import { View } from "react-native";
import times from "lodash/times";
import Svg, { Rect } from "react-native-svg";
import { useSelector, connect, ConnectedProps } from "react-redux";

import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import {
  CANVAS_DIMENSIONS,
  CANVAS_SIZE,
  CELL_SIZE,
  coordinatesFromIndex,
} from "@lib";

export interface GridProps {
  backgroundColor: string;
}

export interface CellProps {
  color?: string | null;
  index: number;
}

const Cell: React.FC<CellProps> = ({ color, index }) => {
  const fill = useSelector((state: RootState) =>
    selectors.cellColor(state, index)
  );

  const { x, y } = coordinatesFromIndex(index);
  if (fill || color)
    return (
      <Rect
        x={x}
        y={y}
        width={CELL_SIZE}
        height={CELL_SIZE}
        fill={color ?? fill}
      />
    );

  return null;
};

const ColorPreview: React.FC = () => {
  const color = useSelector(selectors.selectedColor);
  const cell = useSelector(selectors.selectedCell);

  if (color.length) {
    return <Cell key={"selected"} color={color} index={cell} />;
  }
  return null;
};

type GridConnectedProps = ConnectedProps<typeof connector>;

const Grid: React.FC<GridProps & GridConnectedProps> = React.memo(
  ({ backgroundColor, captureRef }) => {
    return (
      <View ref={captureRef} style={{ backgroundColor }}>
        <Svg width={CANVAS_SIZE} height={CANVAS_SIZE}>
          {times(CANVAS_DIMENSIONS, (y) =>
            times(CANVAS_DIMENSIONS, (x) => (
              <Cell key={`${x}-${y}`} index={y * CANVAS_DIMENSIONS + x} />
            ))
          )}
          <ColorPreview />
        </Svg>
      </View>
    );
  }
);

const connector = connect(
  (state: RootState) => ({ captureRef: selectors.captureRef(state) }),
  {}
);
export default connector(Grid);
