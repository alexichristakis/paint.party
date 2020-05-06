import React, { useCallback } from "react";
import { StyleSheet, Share, Alert } from "react-native";
import Animated, {
  interpolate,
  useCode,
  call,
  Extrapolate,
} from "react-native-reanimated";
import Haptics from "react-native-haptic-feedback";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import {
  useValues,
  useGestureHandler,
  spring,
  useClock,
  withSpring,
} from "react-native-redash";
import { useMemoOne } from "use-memo-one";
import { connect, ConnectedProps } from "react-redux";
import isEqual from "lodash/isEqual";

import { Colors } from "@lib";
import { Canvas, canvasURL } from "@global";
import { RootState } from "@redux/types";
import { CanvasActions } from "@redux/modules/canvas";
import { TouchableHighlight } from "@components/universal";
import { useOnLayout } from "@hooks";

import Buttons from "./Buttons";
import Content from "./Content";

const { cond, set, eq, lessThan, onChange, clockRunning, not } = Animated;

const connector = connect((state: RootState) => ({}), {
  leaveCanvas: CanvasActions.leave,
  renameCanvas: CanvasActions.rename,
});

export interface CanvasRowProps {
  canvas: Canvas;
  onPress: (canvasId: string) => void;
}

export type CanvasRowConnectedProps = ConnectedProps<typeof connector>;

const config = {
  damping: 40,
  mass: 1,
  stiffness: 300,
  overshootClamping: false,
  restSpeedThreshold: 0.1,
  restDisplacementThreshold: 0.1,
};

const CanvasRow: React.FC<
  CanvasRowProps & CanvasRowConnectedProps
> = React.memo(
  ({ onPress, renameCanvas, leaveCanvas, canvas }) => {
    const { onLayout, width } = useOnLayout();
    const { name, id } = canvas;

    const clock = useClock();

    const [panState, tapState, longPressState] = useValues([
      State.UNDETERMINED,
      State.UNDETERMINED,
      State.UNDETERMINED,
    ]);
    const [drag, velocity, offset, shouldClose] = useValues<number>([
      0,
      0,
      0,
      0,
      0,
    ]);

    const handler = useGestureHandler({
      state: panState,
      translationX: drag,
      velocityX: velocity,
    });

    const handleOnLongPress = useCallback(() => {
      Haptics.trigger("impactMedium");
      Share.share({
        title: `share ${name}`,
        message: canvasURL(id),
      });
    }, [name, id]);

    const handleOnPress = useCallback(() => onPress(id), [id]);

    const handleOnPressLeave = useCallback(() => leaveCanvas(id), [id]);
    const handleOnPressRename = useCallback(() => {
      Alert.prompt(`rename '${name}':`, "", (text: string) => {
        renameCanvas(id, text);
      });
    }, [id, name]);

    const translateX = useMemoOne(
      () =>
        withSpring({
          value: drag,
          state: panState,
          snapPoints: [0, -width],
          velocity,
          offset,
          config,
        }),
      [width]
    );

    useCode(
      () => [
        onChange(
          tapState,
          cond(
            eq(tapState, State.END),
            cond(
              lessThan(translateX, -width / 2),
              set(shouldClose, 1),
              call([], handleOnPress)
            )
          )
        ),
        onChange(
          longPressState,
          cond(eq(longPressState, State.ACTIVE), [call([], handleOnLongPress)])
        ),
      ],
      [width]
    );

    useCode(
      () => [
        cond(shouldClose, [
          set(
            offset,
            spring({
              clock,
              from: offset,
              to: 0,
              config,
            })
          ),
          cond(not(clockRunning(clock)), set(shouldClose, 0)),
        ]),
      ],
      []
    );

    const buttonContainer = useMemoOne(
      () => ({
        opacity: width
          ? interpolate(translateX, {
              inputRange: [-width, 0],
              outputRange: [1, 0],
            })
          : 0,
        transform: [
          {
            translateX: interpolate(translateX, {
              inputRange: [-2 * width, -width, 0],
              outputRange: [-width / 2, 0, width],
            }),
          },
          {
            scale: interpolate(translateX, {
              inputRange: [-2 * width, -width, 0],
              outputRange: [1.1, 1, 0.8],
            }),
          },
        ],
      }),
      [width]
    );

    const contentContainer = {
      flex: 1,
      backgroundColor: Colors.background,
      opacity: interpolate(translateX, {
        inputRange: [-width, 0],
        outputRange: [0.5, 1],
        extrapolate: Extrapolate.CLAMP,
      }),
      transform: [{ translateX }],
    };

    return (
      <PanGestureHandler {...handler} maxDeltaY={10} activeOffsetX={[-10, 10]}>
        <Animated.View style={styles.container}>
          <Buttons
            onLayout={onLayout}
            style={buttonContainer}
            onPressLeave={handleOnPressLeave}
            onPressRename={handleOnPressRename}
          />
          <Animated.View style={contentContainer}>
            <TouchableHighlight
              tapState={tapState}
              longPressState={longPressState}
            >
              <Content {...canvas} />
            </TouchableHighlight>
          </Animated.View>
        </Animated.View>
      </PanGestureHandler>
    );
  },
  (p, n) => isEqual(p.canvas, n.canvas)
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default connector(CanvasRow);
