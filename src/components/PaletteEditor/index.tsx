import React, { useRef, useEffect, useState, useImperativeHandle } from "react";
import {
  TextInput,
  StyleSheet,
  View,
  ActivityIndicator,
  Keyboard,
  LayoutRectangle
} from "react-native";
import { connect, ConnectedProps } from "react-redux";

import moment from "moment";
import Animated from "react-native-reanimated";
import {
  useValues,
  useSpringTransition,
  bInterpolate
} from "react-native-redash";

import * as selectors from "@redux/selectors";
import { NewCanvas } from "@redux/modules/canvas";
import { ModalList, ModalListRef } from "../ModalList";
import { Input, Slider, BackgroundColorPicker } from "../universal";
import { TextStyles, TextSizes, Colors } from "@lib";

import Send from "@assets/svg/send.svg";
import { useReduxAction, useColorEditorState } from "@hooks";
import { CanvasActions } from "@redux/modules";
import { RootState } from "@redux/types";

import Palette from "./Palette";
import ColorEditor, { ColorEditorContext } from "./ColorEditor";

export interface PaletteEditorProps {}

export type PaletteEditorRef = {
  open: () => void;
  close: () => void;
};

export type PaletteEditorConnectedProps = ConnectedProps<typeof connector>;

const mapStateToProps = (state: RootState) => ({
  palettes: selectors.palettes(state)
});
const mapDispatchToProps = {};

type Props = PaletteEditorProps & PaletteEditorConnectedProps;
const PaletteEditor = React.memo(
  React.forwardRef<PaletteEditorRef, Props>(({ palettes }, ref) => {
    const modalRef = useRef<ModalListRef>(null);

    const [yOffset] = useValues<number>([0], []);

    const initialColorEditorState = useColorEditorState();

    useEffect(() => {
      modalRef.current?.open();
    }, []);

    useImperativeHandle(ref, () => ({
      open: () => {
        modalRef.current?.open();
        // setTimeout(() => textInputRef.current?.focus(), 300);
      },
      close: () => {
        modalRef.current?.close();
      }
    }));

    return (
      <>
        <ModalList
          ref={modalRef}
          showHeader={false}
          yOffset={yOffset}
          style={styles.container}
        >
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
    flex: 1
  },
  separator: {
    marginVertical: 10,
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.lightGray
  },
  sendButton: {
    position: "absolute",
    top: 10,
    right: 10,
    alignSelf: "center"
  }
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(PaletteEditor);
