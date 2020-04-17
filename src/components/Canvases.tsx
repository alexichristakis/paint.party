import React from "react";
import { StyleSheet, Text } from "react-native";
import Animated from "react-native-reanimated";
import { connect, ConnectedProps } from "react-redux";
import { useValues, onScrollEvent } from "react-native-redash";

import { RootState } from "@redux/types";
import * as selectors from "@redux/selectors";
import { CanvasActions } from "@redux/modules";
import { SB_HEIGHT, TextStyles, Colors } from "@lib";

import CanvasList from "./CanvasList";
import Gallery from "./Gallery";
import isEqual from "lodash/isEqual";

const connector = connect(
  (state: RootState) => ({
    activeCanvases: selectors.activeCanvases(state),
    expiredCanvases: selectors.expiredCanvases(state),
  }),
  {
    openCanvas: CanvasActions.open,
  }
);

export type CanvasesReduxProps = ConnectedProps<typeof connector>;
export interface CanvasesProps {}

const Canvases: React.FC<CanvasesProps & CanvasesReduxProps> = React.memo(
  ({ openCanvas, activeCanvases, expiredCanvases }) => {
    const [scrollY] = useValues([0], []);

    return (
      <Animated.ScrollView
        style={styles.container}
        onScroll={onScrollEvent({ y: scrollY })}
        scrollEventThrottle={1}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={styles.header}>active:</Text>
        <CanvasList
          yOffset={scrollY}
          onPressCanvas={openCanvas}
          canvases={activeCanvases}
        />
        <Text style={styles.header}>past works:</Text>
        <Gallery yOffset={scrollY} canvases={expiredCanvases} />
      </Animated.ScrollView>
    );
  },
  (p, n) => isEqual(p, n)
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: SB_HEIGHT + 5,
  },
  header: {
    ...TextStyles.small,
    color: Colors.gray,
    marginHorizontal: 10,
    marginVertical: 5,
    textTransform: "uppercase",
  },

  contentContainer: {
    paddingBottom: 100,
  },
});

export default connector(Canvases);
