import React from "react";
import { StyleSheet, View, Text, Platform } from "react-native";
import { NativeStackNavigationProp } from "react-native-screens/native-stack";
import { connect, ConnectedProps } from "react-redux";

import { RootState } from "@redux/types";
import { StackParamList } from "../App";

const mapStateToProps = (state: RootState) => ({});
const mapDispatchToProps = {};

export type HomeReduxProps = ConnectedProps<typeof connector>;
export interface HomeProps {
  navigation: NativeStackNavigationProp<StackParamList>;
}

const Home: React.FC<HomeProps> = () => {
  return <View></View>;
};

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(Home);
