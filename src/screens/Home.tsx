import React, { useCallback, useRef } from "react";
import { StyleSheet } from "react-native";
import Animated from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/core";
import { NativeStackNavigationProp } from "react-native-screens/native-stack";
import { connect, ConnectedProps } from "react-redux";
import { useValues, onScrollEvent } from "react-native-redash";

import { RootState } from "@redux/types";
import * as selectors from "@redux/selectors";
import { CanvasActions, AppActions, PaletteActions } from "@redux/modules";
import { SB_HEIGHT, TextStyles } from "@lib";
import ActionButton from "@components/ActionButton";
import { Canvases } from "@components/Canvases";

import { StackParamList } from "../App";

const connector = connect(
  (state: RootState) => ({
    activeCanvas: selectors.activeCanvas(state),
    canvases: selectors.canvases(state),
  }),
  {
    logout: AppActions.logout,
    openCanvas: CanvasActions.open,
    unsubscribe: CanvasActions.close,
    fetchCanvases: CanvasActions.fetch,
    openPalettes: PaletteActions.toggleEditor,
    openCanvasCreator: CanvasActions.toggleCreator,
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
  unsubscribe,
  openPalettes,
  openCanvasCreator,
}) => {
  const [scrollY] = useValues([0], []);

  useFocusEffect(
    useCallback(() => {
      if (activeCanvas.length) unsubscribe();
      fetchCanvases();
    }, [activeCanvas])
  );

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
          canvases={Object.values(canvases)}
        />
      </Animated.ScrollView>
      <ActionButton
        onPressAction1={openCanvasCreator}
        onPressAction2={openPalettes}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: SB_HEIGHT + 5,
  },
  header: {
    alignItems: "flex-end",
    marginHorizontal: 10,
  },
  headerContent: {
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  welcomeText: {
    ...TextStyles.medium,
  },
  contentContainer: {
    //
  },
});

export default connector(Home);
