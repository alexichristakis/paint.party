import React from "react";
import { StyleSheet, ScrollView, Text } from "react-native";
import { useTransition, mixColor } from "react-native-redash";
import { ConnectedProps, connect } from "react-redux";
import Haptics from "react-native-haptic-feedback";
import times from "lodash/times";

import * as selectors from "@redux/selectors";
import { Palette as PaletteType, PaletteActions } from "@redux/modules";
import { RootState } from "@redux/types";
import { TextStyles, Colors, COLOR_SIZE, COLOR_MARGIN } from "@lib";
import { TouchableHighlight, HorizontalScroll } from "@components/universal";

import Color from "./Color";

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
    const { id: paletteId, name, colors } = palette;

    const numColors = colors.length;

    const enablePalette = () => {
      Haptics.trigger("impactMedium");
      enable(paletteId);
    };

    const activeTransition = useTransition(active);
    const backgroundColor = mixColor(
      activeTransition,
      Colors.white,
      Colors.lightGreen
    );

    return (
      <TouchableHighlight
        enabled={!active}
        style={{ ...styles.container, backgroundColor }}
        onPress={enablePalette}
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
    paddingTop: 10,
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
