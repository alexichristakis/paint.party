import React from "react";
import { StyleSheet, Text } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { connect, ConnectedProps } from "react-redux";

import { RootState } from "@redux/types";
import * as selectors from "@redux/selectors";
import { CanvasActions } from "@redux/modules";
import { SB_HEIGHT, TextStyles, Colors } from "@lib";

import CanvasList from "./CanvasList";
import Gallery from "./Gallery";
import LoadingBar from "./LoadingBar";

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

const Canvases: React.FC<CanvasesProps & CanvasesReduxProps> = ({
  openCanvas,
  activeCanvases,
  expiredCanvases,
}) => {
  if (!activeCanvases.length && !expiredCanvases.length) {
    return <Text style={styles.emptyState}>Welcome to PaintParty</Text>;
  }

  console.log("render canvases");

  return (
    <>
      <ScrollView
        style={styles.container}
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
            <Gallery canvases={expiredCanvases} />
          </>
        ) : null}
      </ScrollView>
      <LoadingBar />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: SB_HEIGHT,
  },
  header: {
    ...TextStyles.small,
    color: Colors.gray,
    marginHorizontal: 15,
    marginTop: 20,
    marginBottom: 5,
    textTransform: "uppercase",
  },
  emptyState: {
    ...TextStyles.title,
    marginTop: 30,
    marginHorizontal: 10,
    fontSize: 50,
  },
  contentContainer: {
    paddingBottom: 100,
  },
});

export { default as Carousel } from "./Gallery/Carousel";
export default connector(Canvases);
