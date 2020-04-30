import React from "react";
import { StyleSheet, ScrollView, Text } from "react-native";
import { useTransition, mixColor, useValue } from "react-native-redash";
import { ConnectedProps, connect } from "react-redux";
import Haptics from "react-native-haptic-feedback";
import times from "lodash/times";
import { useCode, call } from "react-native-reanimated";

import * as selectors from "@redux/selectors";
import { Palette as PaletteType, PaletteActions } from "@redux/modules";
import { RootState } from "@redux/types";
import { TextStyles, Colors, COLOR_SIZE, COLOR_MARGIN, onPress } from "@lib";
import { TouchableHighlight } from "@components/universal";

import Color from "./Color";
import { State } from "react-native-gesture-handler";

export interface PaletteProps {
  palette: PaletteType;
}

export type PaletteConnectedProps = ConnectedProps<typeof connector>;

const mapStateToProps = (state: RootState, props: PaletteProps) => ({
  show: selectors.showPaletteEditor(state),
  palettes: selectors.palettes(state),
  active: selectors.isActivePalette(state, props),
});
const mapDispatchToProps = {
  enable: PaletteActions.enablePalette,
};

const Palette: React.FC<PaletteProps & PaletteConnectedProps> = React.memo(
  ({ enable, palette, active }) => {
    const tapState = useValue(State.UNDETERMINED);

    const { id: paletteId, name, colors } = palette;

    const numColors = colors.length;

    useCode(
      () => [
        onPress(
          tapState,
          call([], () => {
            Haptics.trigger("impactMedium");
            enable(paletteId);
          })
        ),
      ],
      [paletteId]
    );

    const activeTransition = useTransition(active);
    const backgroundColor = mixColor(
      activeTransition,
      Colors.white,
      Colors.lightGreen
    );

    return (
      <TouchableHighlight
        tapState={tapState}
        style={{ ...styles.container, backgroundColor }}
        showEffect={!active}
      >
        <Text style={styles.name}>{name}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.colorContainer}
        >
          {times(numColors, (index) => (
            <Color key={index} {...{ index, paletteId }} />
          ))}
        </ScrollView>
      </TouchableHighlight>
    );
  },
  (p, n) => p.active === n.active
);

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  name: {
    ...TextStyles.medium,
    paddingHorizontal: 10,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  colorContainer: {
    height: COLOR_SIZE,
    paddingHorizontal: COLOR_MARGIN,
    flexDirection: "row",
    paddingBottom: 20,
  },
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(Palette);
