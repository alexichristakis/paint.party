import React, { useCallback, useState, useMemo } from "react";
import { StyleSheet, Text } from "react-native";
import { useFocusEffect } from "@react-navigation/core";
import { NativeStackNavigationProp } from "react-native-screens/native-stack";
import { connect, ConnectedProps } from "react-redux";

import { RootState } from "@redux/types";
import * as selectors from "@redux/selectors";
import { CanvasActions, AppActions, PaletteActions } from "@redux/modules";
import { SB_HEIGHT, TextStyles, Colors } from "@lib";
import { PhotoCarouselContext, usePhotoCarouselState } from "@hooks";

import ActionButton from "@components/ActionButton";
import Canvases from "@components/Canvases";
import { Carousel } from "@components/Gallery";

import { StackParamList } from "../App";

const connector = connect(
  (state: RootState) => ({
    activeCanvas: selectors.activeCanvas(state),
    activeCanvases: selectors.activeCanvases(state),
    expiredCanvases: selectors.expiredCanvases(state),
  }),
  {
    logout: AppActions.logout,
    openCanvas: CanvasActions.open,
    unsubscribe: CanvasActions.close,
    fetchCanvases: CanvasActions.fetch,
    openPalettes: PaletteActions.openEditor,
    openCanvasCreator: CanvasActions.openCreator,
  }
);

export type HomeReduxProps = ConnectedProps<typeof connector>;
export interface HomeProps {
  navigation: NativeStackNavigationProp<StackParamList>;
}

const Home: React.FC<HomeProps & HomeReduxProps> = ({
  fetchCanvases,
  activeCanvas,
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

  const initialPhotoCarouselState = usePhotoCarouselState();
  return (
    <PhotoCarouselContext.Provider value={initialPhotoCarouselState}>
      <Canvases />
      <ActionButton
        onPressAction1={openCanvasCreator}
        onPressAction2={openPalettes}
      />
      <Carousel />
    </PhotoCarouselContext.Provider>
  );
};

export default connector(Home);
