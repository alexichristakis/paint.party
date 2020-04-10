import React, {
  useRef,
  useEffect,
  useState,
  useImperativeHandle,
  useLayoutEffect,
} from "react";
import {
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Text,
  Keyboard,
} from "react-native";
import { ConnectedProps, connect } from "react-redux";

import moment from "moment";
import Animated, { Extrapolate, interpolate } from "react-native-reanimated";
import { useValues, useSpringTransition, mix, bin } from "react-native-redash";

import * as selectors from "@redux/selectors";
import { NewCanvas } from "@redux/modules/canvas";
import { ModalList } from "./ModalList";
import {
  Input,
  Slider,
  CreateButton,
  BackgroundColorPicker,
} from "./universal";
import { TextStyles, TextSizes, Colors, SCREEN_HEIGHT } from "@lib";

import { TouchableScale } from "./universal/TouchableScale";
import Send from "@assets/svg/send.svg";
import { useReduxAction } from "@hooks";
import { CanvasActions } from "@redux/modules";
import { RootState } from "@redux/types";

export interface CreateCanvasProps {}

const mapStateToProps = (state: RootState) => ({
  palettes: Object.values(selectors.palettes(state)),
  loading: selectors.isCreatingCanvas(state),
  show: selectors.showCanvasCreator(state),
});

const mapDispatchToProps = {
  createCanvas: CanvasActions.create,
  toggleShow: CanvasActions.toggleCreator,
};

export type CreateCanvasConnectedProps = ConnectedProps<typeof connector>;

const CreateCanvas: React.FC<
  CreateCanvasProps & CreateCanvasConnectedProps
> = React.memo(
  ({ loading, createCanvas, show, toggleShow }) => {
    const [open] = useValues<0 | 1>([0], []);
    const [yOffset] = useValues<number>([SCREEN_HEIGHT], []);

    useLayoutEffect(() => {
      open.setValue(bin(show));
    }, [show]);

    const textInputRef = useRef<TextInput>(null);

    const [sliderValue] = useValues([0], []);
    const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
    const [expiry, setExpiry] = useState(moment().add(1, "day"));
    const [name, setName] = useState("");

    const handleOnSnap = (index: number) => {
      if (!index) {
        setName("");
        Keyboard.dismiss();
      }
    };

    const handleOnCompleteDrag = (val: number) => {
      setExpiry(moment().add(val, "days"));
    };

    const isValidCanvas = () => !!name.length;

    const handleOnPressCreateCanvas = () =>
      createCanvas({ name, expiresAt: expiry.unix(), backgroundColor });

    const opacity = interpolate(yOffset, {
      inputRange: [0, SCREEN_HEIGHT],
      outputRange: [0.8, 0],
      extrapolate: Extrapolate.CLAMP,
    });

    const range = [1, 5] as [number, number];
    return (
      <>
        <Animated.View
          onTouchEndCapture={toggleShow}
          pointerEvents={show ? "auto" : "none"}
          style={[styles.overlay, { opacity }]}
        />
        <ModalList
          open={open}
          onClose={toggleShow}
          onSnap={handleOnSnap}
          yOffset={yOffset}
          style={styles.container}
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
        </ModalList>
      </>
    );
  },
  (p, n) => p.show === n.show && p.loading === n.loading
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
export default connector(CreateCanvas);
