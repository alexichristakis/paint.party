import React, { useRef, useEffect, useState } from "react";
import { TextInput, StyleSheet, ActivityIndicator } from "react-native";

import moment from "moment";
import Animated from "react-native-reanimated";
import {
  useValues,
  useSpringTransition,
  bInterpolate
} from "react-native-redash";

import { NewCanvas } from "@redux/modules/canvas";
import { ModalList, ModalListRef } from "./ModalList";
import { Input, Slider, BackgroundColorPicker } from "./universal";
import { TextStyles, TextSizes, Colors } from "@lib";

import { TouchableScale } from "./universal/TouchableScale";
import Send from "@assets/svg/send.svg";

export interface CreateCanvasProps {
  visible: boolean;
  loading: boolean;
  onClose: () => void;
  onCreate: (canvas: NewCanvas) => void;
}

export const CreateCanvas: React.FC<CreateCanvasProps> = ({
  visible,
  loading,
  onClose,
  onCreate
}) => {
  const textInputRef = useRef<TextInput>(null);
  const modalRef = useRef<ModalListRef>(null);

  const [sliderValue] = useValues([0], []);
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [expiry, setExpiry] = useState(moment().add(1, "day"));
  const [name, setName] = useState("");

  useEffect(() => {
    if (visible) {
      modalRef.current?.open();
      textInputRef.current?.focus();
    } else {
      textInputRef.current?.blur();
    }
  }, [visible]);

  const handleOnSnap = (index: number) => {
    if (!index) {
      setName("");
      textInputRef.current?.blur();
    }
  };

  const handleOnCompleteDrag = (val: number) => {
    setExpiry(moment().add(val, "days"));
  };

  const isValidCanvas = () => !!name.length;

  const handleOnPressCreateCanvas = () =>
    onCreate({ name, expiresAt: expiry.unix(), backgroundColor });

  const createCanvasButtonTransition = useSpringTransition(
    isValidCanvas() && !loading
  );

  const range = [1, 5] as [number, number];
  return (
    <>
      <ModalList
        showHeader={false}
        onClose={onClose}
        onSnap={handleOnSnap}
        style={{ flex: 1, paddingHorizontal: 10 }}
        ref={modalRef}
      >
        <Input
          maxLength={30}
          textInputRef={textInputRef}
          autoCapitalize="none"
          placeholder="canvas name"
          size={TextSizes.title}
          value={name}
          onChangeText={setName}
        />
        <Animated.Text style={styles.text}>
          expires {expiry.fromNow()}
        </Animated.Text>
        <Slider
          style={{ marginBottom: 20 }}
          onCompleteDrag={handleOnCompleteDrag}
          value={sliderValue}
          range={range}
        />
        <Animated.Text style={styles.text}>background color</Animated.Text>
        <BackgroundColorPicker
          selected={backgroundColor}
          onChoose={setBackgroundColor}
        />

        {loading ? (
          <Animated.View
            style={[
              styles.sendButton,
              {
                transform: [
                  { scale: bInterpolate(createCanvasButtonTransition, 1, 0) }
                ],
                opacity: bInterpolate(createCanvasButtonTransition, 1, 0)
              }
            ]}
          >
            <ActivityIndicator size="large" style={{ width: 50, height: 50 }} />
          </Animated.View>
        ) : (
          <TouchableScale
            onPress={handleOnPressCreateCanvas}
            dependencies={[name, expiry.fromNow(), backgroundColor]}
            style={styles.sendButton}
          >
            <Animated.View
              style={{
                transform: [{ scale: createCanvasButtonTransition }],
                opacity: createCanvasButtonTransition
              }}
            >
              <Send height={50} width={50} />
            </Animated.View>
          </TouchableScale>
        )}
      </ModalList>
    </>
  );
};

const styles = StyleSheet.create({
  text: {
    textTransform: "uppercase",
    color: Colors.gray,
    marginBottom: 20,
    ...TextStyles.small
  },
  sendButton: {
    position: "absolute",
    top: 10,
    right: 10,
    alignSelf: "center"
  }
});
