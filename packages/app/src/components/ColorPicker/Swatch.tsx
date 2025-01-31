import React, { useRef, useMemo } from "react";
import Animated, { Easing, useCode } from "react-native-reanimated";
import { StyleSheet } from "react-native";
import {
  State,
  TapGestureHandler,
  LongPressGestureHandler,
  PanGestureHandler,
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
import {
  COLOR_WHEEL_RADIUS,
  COLOR_BORDER_WIDTH,
  COLOR_SIZE,
  onPress,
} from "@lib";
import { useColorEditor } from "@hooks";

const { onChange, or, eq, cond, call } = Animated;

export interface SwatchProps {
  index: number;
  active: Animated.Node<0 | 1>;
  openTransition: Animated.Node<number>;
  onPress: (color: string) => void;
}

export type SwatchConnectedProps = ConnectedProps<typeof connector>;

const mapStateToProps = (state: RootState, props: SwatchProps) => ({
  backgroundColor: selectors.color(state, props),
  rotate: selectors.angleIncrement(state, { index: props.index }),
  paletteId: selectors.activePaletteId(state, props),
});

const mapDispatchToProps = {};

const Swatch: React.FC<SwatchProps & SwatchConnectedProps> = React.memo(
  ({
    active,
    index,
    paletteId,
    rotate,
    backgroundColor,
    openTransition,
    onPress: handleOnPress,
  }) => {
    const viewRef = useRef<Animated.View>(null);
    const tapRef = useRef<TapGestureHandler>(null);
    const longPressRef = useRef<LongPressGestureHandler>(null);

    const [longPressState, tapState] = useValues([
      State.UNDETERMINED,
      State.UNDETERMINED,
    ]);

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

    const { opacity, editing } = useColorEditor(
      index,
      paletteId,
      viewRef,
      longPressState
    );

    const handleOnChoose = () => {
      Haptics.trigger("impactMedium");
      handleOnPress(backgroundColor);
    };

    useCode(() => [onPress(tapState, call([], handleOnChoose))], [
      backgroundColor,
    ]);

    return useMemo(() => {
      const tapHandler = onGestureEvent({ state: tapState });
      const longPressHandler = onGestureEvent({ state: longPressState });

      const colorTransform = [{ scale: mix(activeTransition, 1, 1.45) }];
      const colorContainerTransform = [
        { rotate },
        { translateX: mix(openTransition, 0, COLOR_WHEEL_RADIUS) },
      ];

      return (
        <TapGestureHandler
          {...tapHandler}
          ref={tapRef}
          simultaneousHandlers={longPressRef}
          maxDurationMs={500}
          maxDeltaX={10}
          maxDeltaY={10}
        >
          <Animated.View
            style={{
              ...styles.container,
              opacity,
              transform: colorContainerTransform,
            }}
          >
            <LongPressGestureHandler
              {...longPressHandler}
              simultaneousHandlers={tapRef}
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
    }, [editing, backgroundColor]);
  },
  (p, n) => p.backgroundColor === n.backgroundColor && p.index === n.index
);

const styles = StyleSheet.create({
  container: {
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
