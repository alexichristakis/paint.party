import React, { useRef, useEffect, useState, useImperativeHandle } from "react";
import { StyleSheet, View } from "react-native";
import { connect, ConnectedProps } from "react-redux";

import { useValues } from "react-native-redash";

import * as selectors from "@redux/selectors";
import { Colors, TextSizes } from "@lib";
import { useColorEditorState } from "@hooks";
import { RootState } from "@redux/types";

import Palette from "./Palette";
import ColorEditor, { ColorEditorContext } from "./ColorEditor";
import { Input } from "../universal";
import { ModalList, ModalListRef } from "../ModalList";

export interface PaletteEditorProps {}

export type PaletteEditorRef = {
  open: () => void;
  close: () => void;
};

export type PaletteEditorConnectedProps = ConnectedProps<typeof connector>;

const mapStateToProps = (state: RootState) => ({
  palettes: selectors.palettes(state),
});
const mapDispatchToProps = {};

type Props = PaletteEditorProps & PaletteEditorConnectedProps;
const PaletteEditor = React.memo(
  React.forwardRef<PaletteEditorRef, Props>(({ palettes }, ref) => {
    const modalRef = useRef<ModalListRef>(null);

    const [yOffset] = useValues<number>([0], []);

    const initialColorEditorState = useColorEditorState();

    useImperativeHandle(ref, () => ({
      open: () => {
        modalRef.current?.open();
      },
      close: () => {
        modalRef.current?.close();
      },
    }));

    return (
      <>
        <ModalList
          ref={modalRef}
          showHeader={false}
          yOffset={yOffset}
          style={styles.container}
        >
          <Input
            maxLength={30}
            autoCapitalize="none"
            placeholder="new palette name"
            size={TextSizes.title}
            style={{ marginHorizontal: 10 }}
            // value={name}
            // onChangeText={setName}
          />
          <ColorEditorContext.Provider value={initialColorEditorState}>
            {Object.values(palettes).map((palette, index) => (
              <React.Fragment key={index}>
                {index ? <View style={styles.separator} /> : null}
                <Palette palette={palette} />
              </React.Fragment>
            ))}
          </ColorEditorContext.Provider>
        </ModalList>
        <ColorEditor {...initialColorEditorState} />
      </>
    );
  })
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
});

const connector = connect(mapStateToProps, mapDispatchToProps, null, {
  forwardRef: true,
});
export default connector(PaletteEditor);
