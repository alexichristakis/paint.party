import React, { useCallback } from "react";
import { StyleSheet, Text } from "react-native";
import Animated from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/core";
import { NativeStackNavigationProp } from "react-native-screens/native-stack";
import { connect, ConnectedProps } from "react-redux";
import { useValues, onScrollEvent } from "react-native-redash";

import { RootState } from "@redux/types";
import * as selectors from "@redux/selectors";
import { CanvasActions, AppActions, PaletteActions } from "@redux/modules";
import { SB_HEIGHT, TextStyles, Colors } from "@lib";
import ActionButton from "@components/ActionButton";
import { Canvases } from "@components/Canvases";
import Gallery from "@components/Gallery";

import { StackParamList } from "../App";
import moment from "moment";

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
    openPalettes: PaletteActions.openEditor,
    openCanvasCreator: CanvasActions.openCreator,
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

  const currentTime = moment().unix();
  const allCanvases = Object.values(canvases);
  const activeCanvases = allCanvases.filter((o) => o.expiresAt > currentTime);
  const expiredCanvases = allCanvases.filter((o) => o.expiresAt < currentTime);

  return (
    <>
      <Animated.ScrollView
        style={styles.container}
        onScroll={onScrollEvent({ y: scrollY })}
        scrollEventThrottle={1}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={styles.header}>active</Text>
        <Canvases
          scrollY={scrollY}
          onPressCanvas={openCanvas}
          canvases={activeCanvases}
        />
        <Text style={styles.header}>past works</Text>
        <Gallery canvases={expiredCanvases} />
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
    ...TextStyles.small,
    color: Colors.gray,
    marginHorizontal: 10,
    marginVertical: 5,
    textTransform: "uppercase",
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
    paddingBottom: 100,
  },
});

export default connector(Home);
