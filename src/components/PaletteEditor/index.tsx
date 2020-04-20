import React from "react";
import { StyleSheet, View } from "react-native";
import { connect, ConnectedProps } from "react-redux";

import { PaletteActions } from "@redux/modules";
import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { Colors } from "@lib";

import Palette from "./Palette";
import { BottomSheet } from "../BottomSheet";
import CreatePalette from "./CreatePalette";

export interface PaletteEditorProps {}

export type PaletteEditorConnectedProps = ConnectedProps<typeof connector>;

const mapStateToProps = (state: RootState) => ({
  palettes: Object.values(selectors.palettes(state)),
  showPalettes: state.palette.showEditor,
});
const mapDispatchToProps = {
  close: PaletteActions.closeEditor,
};

type Props = PaletteEditorProps & PaletteEditorConnectedProps;
const PaletteEditor: React.FC<Props> = React.memo(
  ({ palettes, showPalettes, close }) => {
    return (
      <BottomSheet open={showPalettes} onClose={close} style={styles.container}>
        <CreatePalette />
        {palettes.map((palette, index) => (
          <React.Fragment key={index}>
            {index ? <View style={styles.separator} /> : null}
            <Palette palette={palette} />
          </React.Fragment>
        ))}
      </BottomSheet>
    );
  },
  (p, n) =>
    p.palettes.length === n.palettes.length && p.showPalettes === n.showPalettes
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.lightGray,
  },
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(PaletteEditor);
