import React from "react";
import Animated, { useCode } from "react-native-reanimated";
import { mix } from "react-native-redash";
import { ConnectedProps, connect } from "react-redux";
import { State } from "react-native-gesture-handler";
import Haptics from "react-native-haptic-feedback";

import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { POPUP_SIZE, COLOR_SIZE, COLOR_BORDER_WIDTH } from "@lib";
import { PaletteActions } from "@redux/modules";

const { onChange, greaterOrEq, set, eq, divide, cond, and, call } = Animated;

export type IndicatorConnectedProps = ConnectedProps<typeof connector>;

export interface IndicatorProps {
  state: Animated.Value<State>;
  activeIndex: Animated.Value<number>;
  transition: Animated.Node<number>;
  cell: number;
}

const mapStateToProps = (state: RootState, props: IndicatorProps) => ({
  color: selectors.cellLatestUpdate(state, props).color,
});

const mapDispatchToProps = {
  setColor: PaletteActions.set,
};

const Indicator: React.FC<
  IndicatorProps & IndicatorConnectedProps
> = React.memo(
  ({ color, state, setColor, activeIndex, transition }) => {
    useCode(
      () => [
        onChange(
          state,
          cond(and(eq(state, State.END), greaterOrEq(activeIndex, 0)), [
            call([activeIndex], ([index]) => {
              Haptics.trigger("impactHeavy");
              setColor(color, index);
            }),
            set(activeIndex, -1),
          ])
        ),
      ],
      [color]
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
          backgroundColor: color,
          transform: [{ translateX }],
        }}
      />
    );
  },
  (p, n) => p.color === n.color
);

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(Indicator);
