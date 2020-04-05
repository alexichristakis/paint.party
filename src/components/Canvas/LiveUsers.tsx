import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, { useCode, Easing, onChange } from "react-native-reanimated";
import {
  useValues,
  loop,
  useClocks,
  mix,
  onGestureEvent,
} from "react-native-redash";
import { connect, ConnectedProps } from "react-redux";

import * as selectors from "@redux/selectors";
import { TextStyles, Colors, pluralize } from "@lib";
import { TapGestureHandler, State } from "react-native-gesture-handler";
import { RootState } from "@redux/types";

const { set, cond, eq, call } = Animated;

export interface LiveUsersProps {
  onPress: () => void;
}

const mapStateToProps = (state: RootState) => ({
  numUsers: selectors.numLiveUsers(state),
});
const mapDispatchToProps = {};

export type LiveUsersConnectedProps = ConnectedProps<typeof connector>;

const LiveUsers: React.FC<
  LiveUsersProps & LiveUsersConnectedProps
> = React.memo(
  ({ numUsers, onPress }) => {
    const [clock] = useClocks(1, []);
    const [value, state] = useValues([0, State.UNDETERMINED], []);

    const handler = onGestureEvent({ state });

    useCode(
      () => [
        onChange(state, cond(eq(state, State.END), call([], onPress))),
        set(
          value,
          loop({
            clock,
            duration: 550,
            easing: Easing.inOut(Easing.ease),
            boomerang: true,
            autoStart: true,
          })
        ),
      ],
      []
    );

    const opacity = mix(value, 0.5, 1);

    if (!numUsers) return null;

    return (
      <TapGestureHandler {...handler}>
        <Animated.View style={[styles.container, { opacity }]}>
          <View style={styles.indicator} />
          <Text style={styles.text}>{pluralize("other user", numUsers)}</Text>
        </Animated.View>
      </TapGestureHandler>
    );
  },
  (p, n) => p.numUsers === n.numUsers
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  indicator: {
    marginTop: 3,
    marginRight: 5,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.red,
  },
  text: {
    ...TextStyles.medium,
  },
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(LiveUsers);
