import React from "react";
import Animated, { useCode } from "react-native-reanimated";
import { mix } from "react-native-redash";
import { StyleSheet, View, Text } from "react-native";
import { ConnectedProps, connect } from "react-redux";
import { State } from "react-native-gesture-handler";
import Haptics from "react-native-haptic-feedback";
import moment from "moment";

import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import {
  Colors,
  TextStyles,
  POPUP_SIZE,
  COLOR_SIZE,
  COLOR_BORDER_WIDTH,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  COLOR_WHEEL_RADIUS,
} from "@lib";
import { useOnLayout } from "@hooks";
import { PaletteActions } from "@redux/modules";

const {
  onChange,
  neq,
  greaterOrEq,
  add,
  round,
  modulo,
  set,
  eq,
  divide,
  sub,
  cond,
  and,
  lessOrEq,
  greaterThan,
  call,
} = Animated;

export type IndicatorConnectedProps = ConnectedProps<typeof connector>;

export interface IndicatorProps {
  state: Animated.Value<State>;
  activeIndex: Animated.Value<number>;
  transition: Animated.Node<number>;
  position: {
    x: Animated.Value<number>;
    y: Animated.Value<number>;
  };
}

const mapStateToProps = (state: RootState) => ({
  cell: selectors.selectedCellLatestUpdate(state),
});

const mapDispatchToProps = {
  setColor: PaletteActions.set,
};

const Indicator: React.FC<
  IndicatorProps & IndicatorConnectedProps
> = React.memo(
  ({ cell, state, position, setColor, activeIndex, transition }) => {
    const { color: backgroundColor } = cell;

    useCode(
      () => [
        onChange(
          state,
          cond(
            and(eq(state, State.END), greaterOrEq(activeIndex, 0)),
            [
              call([activeIndex], ([index]) => {
                Haptics.trigger("impactHeavy");
                setColor(cell.color, index);
              }),
              set(activeIndex, -1),
              set(position.x, 0),
              set(position.y, 0),
            ],
            [set(position.x, 0), set(position.y, 0)]
          )
        ),
      ],
      [cell.color]
    );

    const width = mix(transition, POPUP_SIZE, COLOR_SIZE);
    const height = mix(transition, POPUP_SIZE, COLOR_SIZE);
    const borderRadius = divide(height, 2);
    const borderWidth = mix(transition, 0, COLOR_BORDER_WIDTH);
    const translateX = mix(transition, 0, -(COLOR_SIZE - POPUP_SIZE) / 2);

    return (
      <Animated.View
        style={{
          position: "absolute",
          left: 5,
          borderRadius,
          borderWidth,
          width,
          height,
          backgroundColor,
          transform: [{ translateX }],
        }}
      />
    );
  },
  (p, n) => p.cell.color === n.cell.color
);

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    overflow: "hidden",
    borderRadius: 25,
    left: 0,
  },
  animated: {
    borderRadius: 25,
    paddingLeft: POPUP_SIZE + 10,
    minHeight: POPUP_SIZE + 10,
    paddingRight: 15,
    backgroundColor: Colors.mediumGray,
    justifyContent: "center",
  },
  text: {
    ...TextStyles.medium,
    textAlign: "left",
  },
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(Indicator);
