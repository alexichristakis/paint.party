import React from "react";
import Animated, { Easing } from "react-native-reanimated";
import { State } from "react-native-gesture-handler";
import { useValues, withTransition, useVector } from "react-native-redash";
import { useMemoOne } from "use-memo-one";
import { connect, ConnectedProps } from "react-redux";
import { View, StyleSheet } from "react-native";
import isEqual from "lodash/isEqual";

import { RootState } from "@redux/types";
import { PaletteActions } from "@redux/modules";
import { COLOR_WHEEL_RADIUS, COLOR_SIZE } from "@lib";

import Button from "./Button";
import Popup from "./Popup";
import ColorWheel from "./Wheel";

const { eq } = Animated;

export interface ColorPickerProps {
  visible: Animated.Value<0 | 1>;
  onDraw: () => void;
}

export type ColorPickerConnectedProps = ConnectedProps<typeof connector>;

const mapStateToProps = (_: RootState) => ({});
const mapDispatchToProps = {
  openPalettes: PaletteActions.openEditor,
};

const ColorPicker: React.FC<
  ColorPickerProps & ColorPickerConnectedProps
> = React.memo(
  ({ visible, onDraw, openPalettes }) => {
    const [tapState, popupDragState] = useValues<State>(
      [State.UNDETERMINED, State.UNDETERMINED],
      []
    );
    const [rotation, activeIndex] = useValues<number>([0, -1], []);
    const popupPosition = useVector(0, 0, []);

    const openTransition = useMemoOne(
      () =>
        withTransition(visible, {
          duration: 300,
          easing: Easing.bezier(0.33, 0.11, 0.49, 0.83),
        }),
      []
    );

    return (
      <View style={styles.container} pointerEvents={"box-none"}>
        <Button
          state={tapState}
          visible={visible}
          openTransition={openTransition}
          onPress={openPalettes}
          onDraw={onDraw}
        />
        <ColorWheel
          angle={rotation}
          isDragging={eq(popupDragState, State.ACTIVE)}
          {...{ activeIndex, openTransition }}
        />
        <Popup
          state={popupDragState}
          position={popupPosition}
          {...{ rotation, activeIndex, openTransition }}
        />
      </View>
    );
  },
  (p, n) => isEqual(p, n)
);

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    height: COLOR_WHEEL_RADIUS + COLOR_SIZE,
  },
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(ColorPicker);
