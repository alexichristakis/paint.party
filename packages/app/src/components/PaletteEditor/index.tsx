import React from "react";
import { StyleSheet, View } from "react-native";
import { connect, ConnectedProps, useSelector } from "react-redux";

import { ModalActions } from "@redux/modules";
import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { Colors } from "@lib";

import Palette from "./Palette";
import { BottomSheet } from "../BottomSheet";
import CreatePalette from "./CreatePalette";

export interface PaletteEditorProps {}

export type PaletteEditorConnectedProps = ConnectedProps<typeof connector>;

const mapStateToProps = (state: RootState) => ({
  showPalettes: selectors.showPaletteEditor(state),
});
const mapDispatchToProps = {
  close: ModalActions.closePaletteEditor,
};

type Props = PaletteEditorProps & PaletteEditorConnectedProps;

const Palettes: React.FC = React.memo(() => {
  const palettes = useSelector(selectors.palettes);

  return (
    <>
      {Object.values(palettes).map((palette, index) => (
        <React.Fragment key={index}>
          {index ? <View style={styles.separator} /> : null}
          <Palette palette={palette} />
        </React.Fragment>
      ))}
    </>
  );
});

const PaletteEditor: React.FC<Props> = React.memo(
  ({ showPalettes, close }) => (
    <BottomSheet open={showPalettes} onClose={close} style={styles.container}>
      <CreatePalette />
      <Palettes />
    </BottomSheet>
  ),
  (p, n) => p.showPalettes === n.showPalettes
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
