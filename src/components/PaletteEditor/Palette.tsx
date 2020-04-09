import React from "react";
import { StyleSheet, Text } from "react-native";
import Animated from "react-native-reanimated";
import {
  useValues,
  useTransition,
  bInterpolateColor,
  onScrollEvent,
} from "react-native-redash";
import { ConnectedProps, connect } from "react-redux";
import Haptics from "react-native-haptic-feedback";

import * as selectors from "@redux/selectors";
import { Palette as PaletteType, PaletteActions } from "@redux/modules";
import { RootState } from "@redux/types";
import { TextStyles, Colors, COLOR_SIZE, COLOR_MARGIN } from "@lib";
import { TouchableHighlight } from "@components/universal";

import { ColorEditorState } from "../ColorEditor";
import Color from "./Color";
import times from "lodash/times";

export interface PaletteProps {
  palette: PaletteType;
  colorEditorState: ColorEditorState;
}

export type PaletteConnectedProps = ConnectedProps<typeof connector>;

const mapStateToProps = (state: RootState, props: PaletteProps) => ({
  palettes: selectors.palettes(state),
  active: selectors.isActivePalette(state, props),
});
const mapDispatchToProps = {
  enable: PaletteActions.enablePalette,
};

const Palette: React.FC<PaletteProps & PaletteConnectedProps> = React.memo(
  ({ enable, colorEditorState, palette, active }) => {
    const { id: paletteId, name, colors } = palette;

    const numColors = colors.length;

    const [xOffset] = useValues<number>([0, 0], []);

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
        style={{ ...styles.container, backgroundColor }}
        onPress={enablePalette}
      >
        <Text style={styles.name}>{name}</Text>
        <Animated.ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          onScroll={onScrollEvent({ x: xOffset })}
          scrollEventThrottle={16}
          contentContainerStyle={styles.colorContainer}
        >
          {times(numColors, (index) => (
            <Color
              key={index}
              {...{
                index,
                xOffset,
                colorEditorState,
                paletteId,
              }}
            />
          ))}
        </Animated.ScrollView>
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
