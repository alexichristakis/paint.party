import React from "react";
import Animated, { useCode } from "react-native-reanimated";
import { mix } from "react-native-redash";
import { ConnectedProps, connect } from "react-redux";
import { State } from "react-native-gesture-handler";
import Haptics from "react-native-haptic-feedback";

import { RootState } from "@redux/types";
import { POPUP_SIZE, COLOR_SIZE, COLOR_BORDER_WIDTH } from "@lib";
import { PaletteActions } from "@redux/modules";
import { useMemoOne } from "use-memo-one";

const { onChange, greaterOrEq, set, eq, divide, cond, and, call } = Animated;

export type IndicatorConnectedProps = ConnectedProps<typeof connector>;

export interface IndicatorProps {
  state: Animated.Value<State>;
  activeIndex: Animated.Value<number>;
  transition: Animated.Node<number>;
}

export interface IndicatorInternalProps {
  color: string;
}

const connector = connect((_: RootState) => ({}), {
  setColor: PaletteActions.set,
});

const Indicator: React.FC<
  IndicatorProps & IndicatorInternalProps & IndicatorConnectedProps
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

    const style = useMemoOne(() => {
      const size = mix(transition, POPUP_SIZE, COLOR_SIZE);

      return {
        width: size,
        height: size,
        borderRadius: divide(size, 2),
        borderWidth: mix(transition, 0, COLOR_BORDER_WIDTH),
        transform: [
          { translateX: mix(transition, 0, -(COLOR_SIZE - POPUP_SIZE) / 2) },
        ],
      };
    }, []);

    return (
      <Animated.View
        style={{
          position: "absolute",
          left: 5,
          backgroundColor: color,
          ...style,
        }}
      />
    );
  },
  (p, n) => p.color === n.color
);

export default connector(Indicator);
