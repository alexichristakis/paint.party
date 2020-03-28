import React, { useCallback, useState, useRef } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import values from "lodash/values";
import Animated from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/core";
import { NativeStackNavigationProp } from "react-native-screens/native-stack";
import { connect, ConnectedProps } from "react-redux";

import { RootState } from "@redux/types";
import * as selectors from "@redux/selectors";
import { CanvasActions, AppActions } from "@redux/modules";
import { CreateCanvas, CreateCanvasRef } from "@components/CreateCanvas";
import { Canvases } from "@components/Canvases";

import { StackParamList } from "../App";
import { SB_HEIGHT, TextStyles } from "@lib";
import Plus from "@assets/svg/plus.svg";
import { useValues, onScroll } from "react-native-redash";

const connector = connect(
  (state: RootState) => ({
    activeCanvas: selectors.activeCanvas(state),
    isCreatingCanvas: selectors.isCreatingCanvas(state),
    canvases: selectors.canvases(state)
  }),
  {
    logout: AppActions.logout,
    openCanvas: CanvasActions.open,
    unsubscribe: CanvasActions.close,
    createCanvas: CanvasActions.create,
    fetchCanvases: CanvasActions.fetch
  }
);

export type HomeReduxProps = ConnectedProps<typeof connector>;
export interface HomeProps {
  navigation: NativeStackNavigationProp<StackParamList>;
}

const Home: React.FC<HomeProps & HomeReduxProps> = ({
  isCreatingCanvas,
  canvases,
  openCanvas,
  fetchCanvases,
  activeCanvas,
  createCanvas,
  unsubscribe
}) => {
  const [scrollY] = useValues([0], []);
  const createCanvasRef = useRef<CreateCanvasRef>(null);
  // const [modalVisible, setModalVisible] = useState(false);

  //
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
        onScroll={onScroll({ y: scrollY })}
        scrollEventThrottle={16}
        contentContainerStyle={styles.contentContainer}
      >
        <TouchableOpacity
          style={styles.header}
          onPress={() => createCanvasRef.current?.open()}
        >
          {!values(canvases).length ? (
            <View style={styles.headerContent}>
              <Text style={styles.welcomeText}>
                To start on a canvas, tap here or an invite link.
              </Text>
              <Plus width={40} height={40} />
            </View>
          ) : (
            <Plus width={40} height={40} />
          )}
        </TouchableOpacity>
        <Canvases
          scrollY={scrollY}
          onPressCanvas={openCanvas}
          canvases={values(canvases)}
        />
      </Animated.ScrollView>
      <CreateCanvas
        ref={createCanvasRef}
        loading={isCreatingCanvas}
        onCreate={createCanvas}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: SB_HEIGHT + 5
  },
  header: { alignItems: "flex-end", marginHorizontal: 10 },
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
