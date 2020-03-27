import React, { useCallback, useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Button } from "react-native";
import values from "lodash/values";
import Animated from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/core";
import { NativeStackNavigationProp } from "react-native-screens/native-stack";
import { connect, ConnectedProps } from "react-redux";

import { RootState } from "@redux/types";
import * as selectors from "@redux/selectors";
import { CanvasActions, AppActions } from "@redux/modules";
import { CreateCanvas } from "@components/CreateCanvas";
import { Canvases } from "@components/Canvases";

import { StackParamList } from "../App";
import { SB_HEIGHT, TextStyles } from "@lib";
import Plus from "@assets/svg/plus.svg";
import { useValues, onScroll } from "react-native-redash";

const mapStateToProps = (state: RootState) => ({
  activeCanvas: selectors.activeCanvas(state),
  isCreatingCanvas: selectors.isCreatingCanvas(state),
  canvases: selectors.canvases(state)
});
const mapDispatchToProps = {
  logout: AppActions.logout,
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
  logout,
  isCreatingCanvas,
  canvases,
  openCanvas,
  fetchCanvases,
  activeCanvas,
  createCanvas,
  unsubscribe
}) => {
  const [scrollY] = useValues([0], []);
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
        onScroll={onScroll({ y: scrollY })}
        scrollEventThrottle={16}
        contentContainerStyle={styles.contentContainer}
      >
        <TouchableOpacity
          style={styles.header}
          onPress={() => setModalVisible(true)}
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
        <Button title="sign out" onPress={logout} />
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

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(Home);
