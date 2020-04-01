import React from "react";
import Animated from "react-native-reanimated";
import { bInterpolate } from "react-native-redash";
import { StyleSheet, View, Text } from "react-native";
import { ConnectedProps, connect } from "react-redux";
import moment from "moment";

import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { Colors, TextStyles, POPUP_SIZE } from "@lib";
import { useOnLayout } from "@hooks";

export type LabelConnectedProps = ConnectedProps<typeof connector>;

export interface LabelProps {
  activeTransition: Animated.Node<number>;
}

const mapStateToProps = (state: RootState) => ({
  cell: selectors.selectedCellLatestUpdate(state)
});

const mapDispatchToProps = {};

const Label: React.FC<LabelProps & LabelConnectedProps> = ({
  activeTransition,
  cell
}) => {
  const { time, color } = cell;
  const { width, onLayout } = useOnLayout();

  const translateX = bInterpolate(activeTransition, 0, -width - 5);
  return (
    <View pointerEvents={"none"} style={[styles.container]}>
      <Animated.View
        style={[styles.animated, { transform: [{ translateX }] }]}
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
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    overflow: "hidden",
    left: 0
  },
  animated: {
    marginLeft: POPUP_SIZE + 5,
    paddingRight: 15,
    backgroundColor: Colors.mediumGray,
    borderBottomRightRadius: 20,
    borderTopRightRadius: 20,
    justifyContent: "center"
  },
  text: {
    ...TextStyles.medium,
    textAlign: "left"
  }
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(Label);
