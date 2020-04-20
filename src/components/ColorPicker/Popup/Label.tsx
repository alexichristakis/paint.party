import React from "react";
import Animated from "react-native-reanimated";
import { mix } from "react-native-redash";
import { StyleSheet, View, Text } from "react-native";
import { ConnectedProps, connect } from "react-redux";
import isEqual from "lodash/isEqual";
import moment from "moment";

import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { Colors, TextStyles, POPUP_SIZE } from "@lib";
import { useOnLayout } from "@hooks";

export type LabelConnectedProps = ConnectedProps<typeof connector>;

export interface LabelProps {
  cell: number;
  transition: Animated.Node<number>;
}

const mapStateToProps = (state: RootState, props: LabelProps) => ({
  update: selectors.cellLatestUpdate(state, props),
});

const mapDispatchToProps = {};

const Label: React.FC<LabelProps & LabelConnectedProps> = React.memo(
  ({ transition, update }) => {
    const { time, color } = update;
    const { width, onLayout } = useOnLayout();

    const transform = [{ translateX: mix(transition, 0, -width) }];
    return (
      <View pointerEvents={"none"} style={styles.container}>
        <Animated.View
          style={{ ...styles.label, transform }}
          onLayout={onLayout}
        >
          <Text style={styles.text} numberOfLines={2}>
            {color}
            {"\n"}
            {moment.unix(Number(time)).fromNow()}
          </Text>
        </Animated.View>
      </View>
    );
  },
  (p, n) => isEqual(p.update, n.update)
);

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    overflow: "hidden",
    borderRadius: 25,
    left: 0,
  },
  label: {
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
export default connector(Label);
