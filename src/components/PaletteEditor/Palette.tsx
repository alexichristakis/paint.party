import React from "react";
import { StyleSheet, View, Text } from "react-native";
import Animated from "react-native-reanimated";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import { useMemoOne } from "use-memo-one";
import { onGestureEvent, useValues, withDecay } from "react-native-redash";

import { Palette as PaletteType } from "@redux/modules";
import { TextStyles, COLOR_SIZE, COLOR_MARGIN } from "@lib";

import Color from "./Color";

const { modulo, debug } = Animated;

export interface PaletteProps {
  palette: PaletteType;
}

const Palette: React.FC<PaletteProps> = ({ palette }) => {
  const { id: paletteId, name, colors } = palette;

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

  return (
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
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10
  },
  name: {
    ...TextStyles.medium,
    marginHorizontal: 10,
    marginBottom: 10,
    textTransform: "uppercase"
  },
  colorContainer: {
    marginTop: 10,
    height: COLOR_SIZE,
    flexDirection: "row"
  }
});

export default Palette;
