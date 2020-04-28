import React, { useEffect } from "react";
import { StyleSheet, View, Button } from "react-native";
import { NativeStackNavigationProp } from "react-native-screens/native-stack";
import { connect, ConnectedProps } from "react-redux";

import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { AppActions } from "@redux/modules";

import { StackParamList } from "../App";
import { LoadingOverlay } from "@components/universal";

const mapStateToProps = (state: RootState) => ({
  loading: selectors.isAuthenticating(state)
});
const mapDispatchToProps = {
  login: AppActions.login
};

export type LandingReduxProps = ConnectedProps<typeof connector>;
export interface LandingProps {
  navigation: NativeStackNavigationProp<StackParamList>;
}

const Landing: React.FC<LandingProps & LandingReduxProps> = ({
  login,
  loading
}) => {
  useEffect(() => {
    login();
  }, []);

  return (
    <View style={styles.container}>
      <LoadingOverlay loading={true} />
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
