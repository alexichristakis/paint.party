import React, { useRef, useMemo } from "react";
import { StyleSheet } from "react-native";
import Animated from "react-native-reanimated";
import { connect, ConnectedProps } from "react-redux";
import { TapGestureHandler, State } from "react-native-gesture-handler";
import { useValues, onGestureEvent, bin } from "react-native-redash";

import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { COLOR_SIZE, COLOR_BORDER_WIDTH, COLOR_MARGIN } from "@lib";

import { useColorEditor } from "@hooks";

export type ColorConnectedProps = ConnectedProps<typeof connector>;

export interface ColorProps {
  index: number;
  paletteId: string;
}

const mapStateToProps = (state: RootState, props: ColorProps) => ({
  isEditing: selectors.isEditing(state, props),
  color: selectors.color(state, props),
});

const mapDispatchToProps = {};

const Color: React.FC<ColorProps & ColorConnectedProps> = ({
  paletteId,
  index,
  isEditing,
  color: backgroundColor,
}) => {
  const ref = useRef<Animated.View>(null);
  const [state] = useValues([State.UNDETERMINED], []);

  useColorEditor(index, paletteId, ref, state);

  return useMemo(() => {
    const handler = onGestureEvent({ state });

    return (
      <TapGestureHandler maxDist={50} {...handler}>
        <Animated.View
          ref={ref}
          style={{
            ...styles.color,
            backgroundColor,
            opacity: bin(!isEditing),
          }}
        />
      </TapGestureHandler>
    );
  }, [backgroundColor, isEditing]);
};

const styles = StyleSheet.create({
  color: {
    marginHorizontal: COLOR_MARGIN,
    borderWidth: COLOR_BORDER_WIDTH,
    width: COLOR_SIZE,
    height: COLOR_SIZE,
    borderRadius: COLOR_SIZE / 2,
  },
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(Color);
