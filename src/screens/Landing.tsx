import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { NativeStackNavigationProp } from "react-native-screens/native-stack";
import { connect, ConnectedProps } from "react-redux";

import { RootState } from "@redux/types";
import { StackParamList } from "../App";

const mapStateToProps = (state: RootState) => ({});
const mapDispatchToProps = {};

export type LandingReduxProps = ConnectedProps<typeof connector>;
export interface LandingProps {
  navigation: NativeStackNavigationProp<StackParamList>;
}

const Landing: React.FC<LandingProps> = () => {
  return (
    <View style={styles.container}>
      <Text>landing page</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center"
  }
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(Landing);
