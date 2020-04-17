import React from "react";
import { StyleSheet, Text } from "react-native";
import Animated from "react-native-reanimated";
import { connect, ConnectedProps } from "react-redux";
import { useValues, onScrollEvent } from "react-native-redash";
import isEqual from "lodash/isEqual";

import { RootState } from "@redux/types";
import * as selectors from "@redux/selectors";
import { CanvasActions } from "@redux/modules";
import { SB_HEIGHT, TextStyles, Colors } from "@lib";

import CanvasList from "./CanvasList";
import Gallery from "./Gallery";

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

    if (!activeCanvases.length && !expiredCanvases.length) {
      return <Text style={styles.emptyState}>Welcome to PaintParty</Text>;
    }

    return (
      <Animated.ScrollView
        style={styles.container}
        onScroll={onScrollEvent({ y: scrollY })}
        scrollEventThrottle={1}
        contentContainerStyle={styles.contentContainer}
      >
        {activeCanvases.length ? (
          <>
            <Text style={styles.header}>active:</Text>
            <CanvasList onPressCanvas={openCanvas} canvases={activeCanvases} />
          </>
        ) : null}
        {expiredCanvases.length ? (
          <>
            <Text style={styles.header}>past works:</Text>
            <Gallery yOffset={scrollY} canvases={expiredCanvases} />
          </>
        ) : null}
      </Animated.ScrollView>
    );
  },
  (p, n) => isEqual(p, n)
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: SB_HEIGHT,
  },
  header: {
    ...TextStyles.small,
    color: Colors.gray,
    marginHorizontal: 10,
    marginTop: 20,
    marginBottom: 5,
    textTransform: "uppercase",
  },
  emptyState: {
    marginTop: 30,
    marginHorizontal: 10,
    ...TextStyles.title,
    fontSize: 50,
  },
  contentContainer: {
    paddingBottom: 100,
  },
});

export default connector(Canvases);
