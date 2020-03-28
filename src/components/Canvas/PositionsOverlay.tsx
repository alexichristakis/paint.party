import React from "react";
import Animated, { useCode } from "react-native-reanimated";
import { useSelector, ConnectedProps, connect } from "react-redux";
import { StyleSheet } from "react-native";
import {
  useSpringTransition,
  withSpringTransition,
  bInterpolateColor,
  useValues,
  bInterpolate,
  withTransition
} from "react-native-redash";
import { State } from "react-native-gesture-handler";
import { useMemoOne } from "use-memo-one";
import random from "lodash/random";

import * as selectors from "@redux/selectors";
import { TextStyles, Colors, pluralize, FillColors } from "@lib";
import { CellHighlight } from "./CellHighlight";
import { RootState } from "@redux/types";
import isEqual from "lodash/isEqual";

const { set, cond, and, eq, call, onChange } = Animated;

export interface PositionsOverlayProps {
  visible: Animated.Value<0 | 1>;
}

export type PositionsOverlayConnectedProps = ConnectedProps<typeof connector>;

const PositionsOverlay: React.FC<PositionsOverlayProps &
  PositionsOverlayConnectedProps> = React.memo(
  ({ visible, positions }) => {
    const [state] = useValues([0, State.UNDETERMINED], []);

    console.log("render overlay", positions);

    const visibleTransition = useMemoOne(() => withTransition(visible), []);

    useCode(() => [], []);

    const randomColor = () => FillColors[random(FillColors.length)];

    const opacity = bInterpolate(visibleTransition, 0, 0.6);
    return (
      <Animated.View
        pointerEvents={"none"}
        style={[
          { opacity, backgroundColor: Colors.gray },
          StyleSheet.absoluteFill
        ]}
      >
        {positions.map((cell, i) => (
          <CellHighlight
            key={i}
            {...{ cell, visible, color: Colors.magenta }}
          />
        ))}
      </Animated.View>
    );
  },
  (p, n) => isEqual(p.positions, n.positions)
);

// default export inject user's selected cell
const mapStateToProps = (state: RootState) => ({
  positions: selectors.livePositions(state)
});

const connector = connect(mapStateToProps, {});
export default connector(PositionsOverlay);
