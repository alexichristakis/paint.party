import React, { useRef } from "react";
import Animated, { Easing, useCode } from "react-native-reanimated";
import { StyleSheet } from "react-native";
import {
  State,
  TapGestureHandler,
  LongPressGestureHandler,
} from "react-native-gesture-handler";
import {
  useValues,
  onGestureEvent,
  mix,
  withTransition,
  bin,
} from "react-native-redash";
import Haptics from "react-native-haptic-feedback";
import { useMemoOne } from "use-memo-one";
import { connect, ConnectedProps } from "react-redux";

import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { PaletteActions, VisualizationActions } from "@redux/modules";
import { COLOR_WHEEL_RADIUS, COLOR_BORDER_WIDTH, COLOR_SIZE } from "@lib";
import { useColorEditor } from "@hooks";

const { onChange, or, eq, cond, call } = Animated;

export interface SwatchProps {
  index: number;
  active: Animated.Value<0 | 1>;
  openTransition: Animated.Node<number>;
}

export type SwatchConnectedProps = ConnectedProps<typeof connector>;

const mapStateToProps = (state: RootState, props: SwatchProps) => ({
  backgroundColor: selectors.color(state, props),
  rotate: selectors.angleIncrement(state, { index: props.index }),
  paletteId: selectors.activePaletteId(state, props),
  isEditing: selectors.isEditing(state, props),
});

const mapDispatchToProps = {
  setColor: PaletteActions.set,
  selectColor: VisualizationActions.selectColor,
};

const Swatch: React.FC<SwatchProps & SwatchConnectedProps> = React.memo(
  ({
    active,
    index,
    paletteId,
    rotate,
    backgroundColor,
    openTransition,
    selectColor,
    isEditing,
  }) => {
    const viewRef = useRef<Animated.View>(null);
    const tapRef = useRef<TapGestureHandler>(null);
    const longPressRef = useRef<LongPressGestureHandler>(null);

    const [longPressState, tapState] = useValues(
      [State.UNDETERMINED, State.UNDETERMINED],
      []
    );

    const activeTransition = useMemoOne(
      () =>
        withTransition(
          or(
            eq(tapState, State.ACTIVE),
            eq(tapState, State.BEGAN),
            eq(longPressState, State.ACTIVE),
            eq(longPressState, State.BEGAN),
            active
          ),
          {
            duration: 200,
            easing: Easing.inOut(Easing.ease),
          }
        ),
      []
    );

    const handleOnChoose = () => {
      Haptics.trigger("impactMedium");
      selectColor(backgroundColor);
    };

    useCode(
      () => [
        onChange(
          tapState,
          cond(eq(tapState, State.END), call([], handleOnChoose))
        ),
      ],
      [backgroundColor]
    );

    const tapHandler = onGestureEvent({ state: tapState });
    const longPressHandler = onGestureEvent({ state: longPressState });

    const colorTransform = [{ scale: mix(activeTransition, 1, 1.45) }];
    const colorContainerTransform = [
      { rotate },
      { translateX: mix(openTransition, 0, COLOR_WHEEL_RADIUS) },
    ];

    useColorEditor(index, paletteId, viewRef, longPressState);

    return (
      <TapGestureHandler
        {...tapHandler}
        ref={tapRef}
        simultaneousHandlers={[longPressRef]}
        maxDurationMs={500}
        maxDeltaX={10}
        maxDeltaY={10}
      >
        <Animated.View
          style={{
            ...styles.container,
            opacity: bin(!isEditing),
            transform: colorContainerTransform,
          }}
        >
          <LongPressGestureHandler
            {...longPressHandler}
            simultaneousHandlers={[tapRef]}
          >
            <Animated.View
              ref={viewRef}
              style={{
                ...styles.color,
                backgroundColor,
                transform: colorTransform,
              }}
            />
          </LongPressGestureHandler>
        </Animated.View>
      </TapGestureHandler>
    );
  },
  (p, n) =>
    p.backgroundColor === n.backgroundColor &&
    p.index === n.index &&
    p.isEditing === n.isEditing
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: "red",
    alignItems: "center",
    justifyContent: "center",
  },
  color: {
    position: "absolute",
    borderWidth: COLOR_BORDER_WIDTH,
    borderRadius: COLOR_SIZE / 2,
    height: COLOR_SIZE,
    width: COLOR_SIZE,
  },
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(Swatch);
