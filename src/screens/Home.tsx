import React, { useCallback, useState } from "react";
import { StyleSheet, View, Text, Button } from "react-native";
import values from "lodash/values";
import Animated from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/core";
import { NativeStackNavigationProp } from "react-native-screens/native-stack";
import { connect, ConnectedProps } from "react-redux";

import { RootState } from "@redux/types";
import * as selectors from "@redux/selectors";
import { CanvasActions } from "@redux/modules";
import { CreateCanvas } from "@components/CreateCanvas";
import { Canvases } from "@components/Canvases";

import { StackParamList } from "../App";
import { SB_HEIGHT } from "@lib";

const mapStateToProps = (state: RootState) => ({
  activeCanvas: selectors.activeCanvas(state),
  isCreatingCanvas: selectors.isCreatingCanvas(state),
  canvases: selectors.canvases(state)
});
const mapDispatchToProps = {
  openCanvas: CanvasActions.open,
  unsubscribe: CanvasActions.close,
  createCanvas: CanvasActions.create,
  fetchCanvases: CanvasActions.fetch
};

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
  const [modalVisible, setModalVisible] = useState(false);

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
        contentContainerStyle={styles.contentContainer}
      >
        <Canvases onPressCanvas={openCanvas} canvases={values(canvases)} />
        <Button title="create canvas" onPress={() => setModalVisible(true)} />
      </Animated.ScrollView>
      <CreateCanvas
        visible={modalVisible}
        loading={isCreatingCanvas}
        onClose={() => setModalVisible(false)}
        onCreate={createCanvas}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: SB_HEIGHT + 10
  },
  contentContainer: {
    //
  }
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(Home);
