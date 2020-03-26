import React, { useEffect, useCallback, useRef, useState } from "react";
import { StyleSheet, View, Text, Button } from "react-native";
import { useFocusEffect } from "@react-navigation/core";
import { NativeStackNavigationProp } from "react-native-screens/native-stack";
import { connect, ConnectedProps } from "react-redux";
import moment from "moment";

import { RootState } from "@redux/types";
import * as selectors from "@redux/selectors";
import { AppActions, CanvasActions } from "@redux/modules";
import { CreateCanvas } from "@components/CreateCanvas";
import { ModalListRef } from "@components/ModalList";

import { StackParamList } from "../App";

const mapStateToProps = (state: RootState) => ({
  activeCanvas: selectors.activeCanvas(state)
});
const mapDispatchToProps = {
  logout: AppActions.logout,
  subscribe: CanvasActions.open,
  joinCanvas: CanvasActions.join,
  unsubscribe: CanvasActions.close,
  createCanvas: CanvasActions.create,
  fetchCanvases: CanvasActions.fetch,
  draw: CanvasActions.draw
};

export type HomeReduxProps = ConnectedProps<typeof connector>;
export interface HomeProps {
  navigation: NativeStackNavigationProp<StackParamList>;
}

const Home: React.FC<HomeProps & HomeReduxProps> = ({
  fetchCanvases,
  navigation,
  activeCanvas,
  createCanvas,
  logout,
  subscribe,
  joinCanvas,
  unsubscribe,
  draw
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
    <View style={styles.container}>
      <Text>Home page</Text>
      <Button title="logout" onPress={logout} />
      <Button title="subscribe" onPress={() => subscribe("canvas_1")} />
      <Button title="test draw" onPress={() => draw(2, "#555555")} />
      <Button
        title="join canvas"
        onPress={() => joinCanvas("tHEpTuC5kxtAf5dYqyar")}
      />
      <Button title="create canvas" onPress={() => setModalVisible(true)} />
      <Button
        title="go to canvas"
        onPress={() => subscribe("tHEpTuC5kxtAf5dYqyar")}
      />

      <CreateCanvas
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCreate={createCanvas}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  }
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(Home);
