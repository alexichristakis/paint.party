import React, { useRef } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import Animated from "react-native-reanimated";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import { useMemoOne } from "use-memo-one";
import {
  onGestureEvent,
  useValues,
  withDecay,
  useTransition,
  bInterpolateColor
} from "react-native-redash";
import { ConnectedProps, connect } from "react-redux";
import Haptics from "react-native-haptic-feedback";

import * as selectors from "@redux/selectors";
import { Palette as PaletteType, PaletteActions } from "@redux/modules";
import { RootState } from "@redux/types";
import { TextStyles, Colors, COLOR_SIZE, COLOR_MARGIN } from "@lib";
import { TouchableHighlight } from "@components/universal";

import Color from "./Color";

const { modulo } = Animated;

export interface PaletteProps {
  palette: PaletteType;
}

export type PaletteConnectedProps = ConnectedProps<typeof connector>;

const mapStateToProps = (state: RootState, props: PaletteProps) => ({
  palettes: selectors.palettes(state),
  active: selectors.isActivePalette(state, props)
});
const mapDispatchToProps = {
  enable: PaletteActions.enablePalette
};

const Palette: React.FC<PaletteProps & PaletteConnectedProps> = ({
  enable,
  palette,
  active
}) => {
  const { id: paletteId, name, colors } = palette;

  const panRef = useRef<PanGestureHandler>(null);
  const [panState] = useValues([State.UNDETERMINED], []);
  const [translationX, velocityX] = useValues<number>([0, 0], []);

  const panHandler = onGestureEvent({
    state: panState,
    translationX,
    velocityX
  });

  const translateX = useMemoOne(
    () =>
      modulo(
        withDecay({
          value: translationX,
          state: panState,
          velocity: velocityX
        }),
        -colors.length * (COLOR_SIZE + COLOR_MARGIN)
      ),
    []
  );

  const enablePalette = () => {
    Haptics.trigger("impactMedium");
    enable(paletteId);
  };

  const activeTransition = useTransition(active);
  const backgroundColor = bInterpolateColor(
    activeTransition,
    Colors.white,
    Colors.lightGreen
  );

  return (
    <TouchableHighlight
      enabled={!active}
      waitFor={panRef}
      style={{ backgroundColor }}
      onPress={enablePalette}
    >
      <PanGestureHandler {...panHandler}>
        <Animated.View style={styles.container}>
          <Text style={styles.name}>{name}</Text>
          <View style={styles.colorContainer}>
            {colors.map((color, index) => (
              <Color
                key={index}
                numColors={colors.length}
                xOffset={translateX}
                {...{ color, index, paletteId }}
              />
            ))}
          </View>
        </Animated.View>
      </PanGestureHandler>
    </TouchableHighlight>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    paddingBottom: 20
  },
  name: {
    ...TextStyles.medium,
    paddingHorizontal: 10,
    marginBottom: 10,
    textTransform: "uppercase"
  },
  colorContainer: {
    marginTop: 10,
    height: COLOR_SIZE,
    flexDirection: "row"
  }
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(Palette);
