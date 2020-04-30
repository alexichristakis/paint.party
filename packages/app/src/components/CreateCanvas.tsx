import React, { useRef, useState } from "react";
import { TextInput, StyleSheet, Text } from "react-native";
import { ConnectedProps, connect, useSelector } from "react-redux";
import { useValues, useValue } from "react-native-redash";
import moment from "moment";

import * as selectors from "@redux/selectors";
import { NewCanvas } from "@redux/modules/canvas";
import { CanvasActions, ModalActions } from "@redux/modules";
import { RootState } from "@redux/types";
import {
  Input,
  Slider,
  CreateButton,
  BackgroundColorPicker,
} from "./universal";
import { TextStyles, TextSizes, Colors } from "@lib";

import { BottomSheet } from "./BottomSheet";

export interface CreateCanvasProps {
  onCreate: (canvas: NewCanvas) => void;
}

const mapStateToProps = (state: RootState) => ({
  show: selectors.showCreateCanvas(state),
});

const mapDispatchToProps = {
  createCanvas: CanvasActions.create,
  closeCreator: ModalActions.closeCreateCanvas,
};

export type CreateCanvasConnectedProps = ConnectedProps<typeof connector>;

const CreateCanvas: React.FC<CreateCanvasProps> = React.memo(({ onCreate }) => {
  const textInputRef = useRef<TextInput>(null);

  const sliderValue = useValue(0);
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [expiry, setExpiry] = useState(moment().add(1, "day"));
  const [name, setName] = useState("");

  const loading = useSelector(selectors.isCreatingCanvas);

  const handleOnCompleteDrag = (val: number) => {
    setExpiry(moment().add(val, "days"));
  };

  const isValidCanvas = () => !!name.length;

  const handleOnPressCreateCanvas = () =>
    onCreate({ name, expiresAt: expiry.unix(), backgroundColor });

  const range = [1, 5] as [number, number];
  return (
    <>
      <Input
        maxLength={30}
        textInputRef={textInputRef}
        autoCapitalize="none"
        placeholder="canvas name"
        size={TextSizes.title}
        value={name}
        onChangeText={setName}
      />
      <Text style={styles.text}>expires {expiry.fromNow()}</Text>
      <Slider
        style={{ marginBottom: 20 }}
        onCompleteDrag={handleOnCompleteDrag}
        value={sliderValue}
        range={range}
      />
      <Text style={styles.text}>background color</Text>
      <BackgroundColorPicker
        selected={backgroundColor}
        onChoose={setBackgroundColor}
      />
      <CreateButton
        dependencies={[name, expiry, backgroundColor]}
        loading={loading}
        valid={isValidCanvas()}
        onPress={handleOnPressCreateCanvas}
      />
    </>
  );
});

const CreateCanvasModal: React.FC<CreateCanvasConnectedProps> = React.memo(
  ({ createCanvas, show, closeCreator }) => (
    <BottomSheet open={show} onClose={closeCreator} style={styles.container}>
      <CreateCanvas onCreate={createCanvas} />
    </BottomSheet>
  ),
  (p, n) => p.show === n.show
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
  },
  text: {
    textTransform: "uppercase",
    color: Colors.gray,
    marginBottom: 20,
    ...TextStyles.small,
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
export default connector(CreateCanvasModal);
