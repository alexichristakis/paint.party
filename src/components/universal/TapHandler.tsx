import React, { ReactNode } from "react";
import { StyleProp, ViewStyle } from "react-native";
import { useMemoOne } from "use-memo-one";

import { TapGestureHandler, State } from "react-native-gesture-handler";
import Animated, { useCode } from "react-native-reanimated";
import { onGestureEvent, withTransition, useValues } from "react-native-redash";
import isEqual from "lodash/isEqual";

const { set, neq, or, eq, cond, onChange, call, debug } = Animated;

interface TapHandlerProps {
  value: Animated.Value<number>;
  disabled?: boolean;
  dependencies?: React.DependencyList;
  onPress: () => void;
  style?: StyleProp<Animated.AnimateStyle<ViewStyle>>;
  children: ReactNode;
}

export const TapHandler: React.FC<TapHandlerProps> = React.memo(
  ({ onPress, children, value, disabled, dependencies = [], style }) => {
    const [prevState, state] = useValues(
      [State.UNDETERMINED, State.UNDETERMINED],
      []
    );
    const handler = useMemoOne(() => onGestureEvent({ state }), []);

    useCode(
      () => [
        onChange(state, debug("state", state)),
        set(
          value,
          withTransition(
            or(eq(state, State.ACTIVE), eq(state, State.BEGAN)),
            {},
            state
          )
        ),
        cond(eq(prevState, State.UNDETERMINED), set(prevState, state)),
        cond(neq(state, prevState), [
          set(prevState, state),
          cond(
            eq(state, State.END),
            call([], () => {
              if (dependencies.length) console.log(dependencies);
              onPress();
            })
          )
        ])
      ],
      [...dependencies]
    );

    const content = <Animated.View style={style}>{children}</Animated.View>;

    if (disabled) return content;

    return <TapGestureHandler {...handler}>{content}</TapGestureHandler>;
  },
  (p, n) => p.disabled === n.disabled && isEqual(p.dependencies, n.dependencies)
);
