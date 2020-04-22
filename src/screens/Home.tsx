import React, { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/core";
import { NativeStackNavigationProp } from "react-native-screens/native-stack";
import { connect, ConnectedProps } from "react-redux";

import { RootState } from "@redux/types";
import * as selectors from "@redux/selectors";
import { CanvasActions, ModalActions } from "@redux/modules";
import { PhotoCarouselProvider } from "@hooks";

import ActionButton from "@components/ActionButton";
import Canvases from "@components/Canvases";
import { Carousel } from "@components/Gallery";

import { StackParamList } from "../App";
import { LoadingOverlay } from "@components/universal";

const connector = connect(
  (state: RootState) => ({
    activeCanvas: selectors.activeCanvas(state),
    loadingCanvases: selectors.isFetchingCanvases(state),
  }),
  {
    unsubscribe: CanvasActions.close,
    fetchCanvases: CanvasActions.fetch,
    openPalettes: ModalActions.openPaletteEditor,
    openCanvasCreator: ModalActions.openCreateCanvas,
  }
);

export type HomeReduxProps = ConnectedProps<typeof connector>;
export interface HomeProps {
  navigation: NativeStackNavigationProp<StackParamList>;
}

const Home: React.FC<HomeProps & HomeReduxProps> = ({
  fetchCanvases,
  activeCanvas,
  loadingCanvases,
  unsubscribe,
  openPalettes,
  openCanvasCreator,
}) => {
  useFocusEffect(
    useCallback(() => {
      if (activeCanvas.length) unsubscribe();

      fetchCanvases();
    }, [activeCanvas])
  );

  return (
    <>
      <PhotoCarouselProvider>
        <Canvases />
        <Carousel />
      </PhotoCarouselProvider>
      <ActionButton
        onPressAction1={openCanvasCreator}
        onPressAction2={openPalettes}
      />
      <LoadingOverlay loading={loadingCanvases} />
    </>
  );
};

export default connector(Home);
