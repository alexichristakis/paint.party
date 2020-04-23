import React, { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/core";
import { NativeStackNavigationProp } from "react-native-screens/native-stack";
import { connect, ConnectedProps } from "react-redux";

import { RootState } from "@redux/types";
import * as selectors from "@redux/selectors";
import { CanvasActions, ModalActions } from "@redux/modules";
import { PhotoCarouselProvider } from "@hooks";

import ActionButton from "@components/ActionButton";
import Canvases, { Carousel } from "@components/Canvases";
import { LoadingOverlay } from "@components/universal";

import { StackParamList } from "../App";

const connector = connect(
  (state: RootState) => ({
    activeCanvas: selectors.activeCanvas(state),
    isJoiningCanvas: selectors.isJoiningCanvas(state),
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
  isJoiningCanvas,
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
      <LoadingOverlay text={"joining canvas..."} loading={isJoiningCanvas} />
    </>
  );
};

export default connector(Home);
