import React, { useCallback, useRef } from "react";
import { StyleSheet } from "react-native";
import values from "lodash/values";
import Animated from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/core";
import { NativeStackNavigationProp } from "react-native-screens/native-stack";
import { connect, ConnectedProps } from "react-redux";
import { useValues, onScrollEvent } from "react-native-redash";

import { RootState } from "@redux/types";
import * as selectors from "@redux/selectors";
import { CanvasActions, AppActions } from "@redux/modules";
import { SB_HEIGHT, TextStyles } from "@lib";
import CreateCanvas, { CreateCanvasRef } from "@components/CreateCanvas";
import PaletteEditor, { PaletteEditorRef } from "@components/PaletteEditor";
import ActionButton from "@components/ActionButton";
import { Canvases } from "@components/Canvases";

import { StackParamList } from "../App";
<<<<<<< HEAD
=======
import { SB_HEIGHT, TextStyles } from "@lib";
import { useValues, onScrollEvent } from "react-native-redash";
import { NewCanvas } from "@components/NewCanvas";
import PaletteEditor from "@components/PaletteEditor";
>>>>>>> master

const connector = connect(
  (state: RootState) => ({
    activeCanvas: selectors.activeCanvas(state),
    canvases: selectors.canvases(state)
  }),
  {
    logout: AppActions.logout,
    openCanvas: CanvasActions.open,
    unsubscribe: CanvasActions.close,
    fetchCanvases: CanvasActions.fetch
  }
);

export type HomeReduxProps = ConnectedProps<typeof connector>;
export interface HomeProps {
  navigation: NativeStackNavigationProp<StackParamList>;
}

const Home: React.FC<HomeProps & HomeReduxProps> = ({
  canvases,
  openCanvas,
  fetchCanvases,
  activeCanvas,
  unsubscribe
}) => {
  const [scrollY] = useValues([0], []);
  const paletteEditorRef = useRef<PaletteEditorRef>(null);
  const createCanvasRef = useRef<CreateCanvasRef>(null);

  useFocusEffect(
    useCallback(() => {
      if (activeCanvas.length) unsubscribe();
      fetchCanvases();
    }, [activeCanvas])
  );

  const openCanvasCreator = () => createCanvasRef.current?.open();

  const openPaletteEditor = () => paletteEditorRef.current?.open();

  return (
    <>
      <Animated.ScrollView
        style={styles.container}
        onScroll={onScrollEvent({ y: scrollY })}
        scrollEventThrottle={1}
        contentContainerStyle={styles.contentContainer}
      >
        <Canvases
          scrollY={scrollY}
          onPressCanvas={openCanvas}
          canvases={values(canvases)}
        />
      </Animated.ScrollView>
<<<<<<< HEAD
      <ActionButton
        onPressAction1={openCanvasCreator}
        onPressAction2={openPaletteEditor}
      />
      <CreateCanvas ref={createCanvasRef} />
      <PaletteEditor ref={paletteEditorRef} />
=======
      <NewCanvas />
      <PaletteEditor />
>>>>>>> master
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: SB_HEIGHT + 5
  },
  header: {
    alignItems: "flex-end",
    marginHorizontal: 10
  },
  headerContent: {
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  welcomeText: {
    ...TextStyles.medium
  },
  contentContainer: {
    //
  }
});

export default connector(Home);
