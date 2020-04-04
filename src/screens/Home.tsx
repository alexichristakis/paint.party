import React, { useCallback } from "react";
import { StyleSheet } from "react-native";
import values from "lodash/values";
import Animated from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/core";
import { NativeStackNavigationProp } from "react-native-screens/native-stack";
import { connect, ConnectedProps } from "react-redux";

import { RootState } from "@redux/types";
import * as selectors from "@redux/selectors";
import { CanvasActions, AppActions } from "@redux/modules";
import { Canvases } from "@components/Canvases";

import { StackParamList } from "../App";
import { SB_HEIGHT, TextStyles } from "@lib";
import { useValues, onScrollEvent } from "react-native-redash";
import { NewCanvas } from "@components/NewCanvas";
import PaletteEditor from "@components/PaletteEditor";

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
          canvases={values(canvases)}
        />
      </Animated.ScrollView>
      <NewCanvas />
      <PaletteEditor />
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
