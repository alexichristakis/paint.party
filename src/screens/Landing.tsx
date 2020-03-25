import React from "react";
import { StyleSheet, View, Text, Button } from "react-native";
import { NativeStackNavigationProp } from "react-native-screens/native-stack";
import { connect, ConnectedProps } from "react-redux";

import { RootState } from "@redux/types";
import { StackParamList } from "../App";
import { AppActions } from "@redux/modules";

const mapStateToProps = (state: RootState) => ({});
const mapDispatchToProps = {
  login: AppActions.login
};

export type LandingReduxProps = ConnectedProps<typeof connector>;
export interface LandingProps {
  navigation: NativeStackNavigationProp<StackParamList>;
}

const Landing: React.FC<LandingProps & LandingReduxProps> = ({ login }) => {
  return (
    <View style={styles.container}>
      <Text>landing page</Text>
      <Button title="login" onPress={login} />
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
export default connector(Landing);
