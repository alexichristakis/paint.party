import React from "react";
import { StyleSheet, View } from "react-native";
import { connect, ConnectedProps } from "react-redux";
import { useValues } from "react-native-redash";

import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { Colors } from "@lib";

import { Visualization, Header } from "@components/Canvas";
import ColorPicker from "@components/ColorPicker";
import { LoadingOverlay } from "@components/universal";

const connector = connect(
  (state: RootState) => ({
    loadingCanvas: selectors.isLoadingCanvas(state),
  }),
  {}
);

export type CanvasReduxProps = ConnectedProps<typeof connector>;
export interface CanvasProps {}

const Canvas: React.FC<CanvasProps & CanvasReduxProps> = React.memo(
  ({ loadingCanvas }) => {
    const [positionsVisible, pickerVisible] = useValues<0 | 1>([0, 0], []);

    return (
      <View style={styles.container}>
        <Header {...{ positionsVisible, pickerVisible }} />
        <Visualization {...{ pickerVisible, positionsVisible }} />
        <ColorPicker visible={pickerVisible} />
        <LoadingOverlay loading={loadingCanvas} />
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightGray,
  },
});

export default connector(Canvas);
