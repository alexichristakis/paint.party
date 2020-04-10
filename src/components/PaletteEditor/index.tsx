import React, { useLayoutEffect } from "react";
import Animated, { interpolate, Extrapolate } from "react-native-reanimated";
import { StyleSheet, View } from "react-native";
import { connect, ConnectedProps } from "react-redux";
import { useValues, bin } from "react-native-redash";

import * as selectors from "@redux/selectors";
import { Colors, SCREEN_HEIGHT } from "@lib";
import { useColorEditorState } from "@hooks";
import { RootState } from "@redux/types";

import Palette from "./Palette";
import ColorEditor from "../ColorEditor";
import { ModalList } from "../ModalList";
import CreatePalette from "./CreatePalette";
import { AppActions, PaletteActions } from "@redux/modules";

export interface PaletteEditorProps {}

export type PaletteEditorRef = {
  open: () => void;
  close: () => void;
};

export type PaletteEditorConnectedProps = ConnectedProps<typeof connector>;

const mapStateToProps = (state: RootState) => ({
  palettes: Object.values(selectors.palettes(state)),
  showPalettes: state.palette.showEditor,
});
const mapDispatchToProps = {
  toggleShow: PaletteActions.toggleEditor,
};

type Props = PaletteEditorProps & PaletteEditorConnectedProps;
const PaletteEditor: React.FC<Props> = React.memo(
  ({ palettes, showPalettes, toggleShow }) => {
    console.log("render palette editor");

    const [open] = useValues<0 | 1>([0], []);
    const [yOffset] = useValues<number>([SCREEN_HEIGHT], []);

    useLayoutEffect(() => {
      open.setValue(bin(showPalettes));
    }, [showPalettes]);

    const initialColorEditorState = useColorEditorState();

    const opacity = interpolate(yOffset, {
      inputRange: [0, SCREEN_HEIGHT],
      outputRange: [0.8, 0],
      extrapolate: Extrapolate.CLAMP,
    });

    return (
      <>
        <Animated.View
          onTouchEndCapture={toggleShow}
          pointerEvents={showPalettes ? "auto" : "none"}
          style={[styles.overlay, { opacity }]}
        />

        <ModalList
          open={open}
          onClose={toggleShow}
          yOffset={yOffset}
          style={styles.container}
        >
          <CreatePalette />
          {palettes.map((palette, index) => (
            <React.Fragment key={index}>
              {index ? <View style={styles.separator} /> : null}
              <Palette
                palette={palette}
                colorEditorState={initialColorEditorState}
              />
            </React.Fragment>
          ))}
        </ModalList>

        {showPalettes ? <ColorEditor {...initialColorEditorState} /> : null}
      </>
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
  sendButton: {
    position: "absolute",
    top: 10,
    right: 10,
    alignSelf: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.nearBlack,
  },
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(PaletteEditor);
