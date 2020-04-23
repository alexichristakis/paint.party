import React, { useCallback } from "react";
import { StyleSheet, Share, Alert } from "react-native";
import Animated, { interpolate } from "react-native-reanimated";
import Haptics from "react-native-haptic-feedback";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import {
  useValues,
  useGestureHandler,
  useValue,
  withSpring,
} from "react-native-redash";
import { useMemoOne } from "use-memo-one";
import { connect, ConnectedProps } from "react-redux";
import isEqual from "lodash/isEqual";

import { Colors, canvasUrl } from "@lib";
import { RootState } from "@redux/types";
import { Canvas, CanvasActions } from "@redux/modules/canvas";
import { TouchableHighlight } from "@components/universal";
import { useOnLayout } from "@hooks";

import Buttons from "./Buttons";
import Content from "./Content";

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

    console.log("render canvas row", canvas.name);

    const { name, id } = canvas;

    const state = useValue(State.UNDETERMINED, []);
    const [drag, velocity] = useValues<number>([0, 0], []);

    const handler = useGestureHandler(
      {
        state,
        translationX: drag,
        velocityX: velocity,
      },
      []
    );

    const handleOnLongPress = useCallback(() => {
      Haptics.trigger("impactMedium");
      Share.share({
        title: `share ${name}`,
        message: canvasUrl(id),
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
          velocity,
          state,
          snapPoints: [0, -width],
          config,
        }),
      [width]
    );

    const buttonContainer = useMemoOne(
      () => ({
        right: 0,
        position: "absolute",
        opacity: interpolate(translateX, {
          inputRange: [-width, 0],
          outputRange: [1, 0],
        }),
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

    return (
      <PanGestureHandler {...handler} maxDeltaY={10} activeOffsetX={[-10, 10]}>
        <Animated.View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Animated.View onLayout={onLayout} style={buttonContainer}>
            <Buttons
              onPressLeave={handleOnPressLeave}
              onPressRename={handleOnPressRename}
            />
          </Animated.View>
          <Animated.View
            style={{
              flex: 1,
              backgroundColor: Colors.background,
              transform: [{ translateX }],
            }}
          >
            <TouchableHighlight
              style={styles.container}
              onPress={handleOnPress}
              onLongPress={handleOnLongPress}
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
    flex: 1,
    justifyContent: "space-between",
    flexDirection: "row",
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
});

export default connector(CanvasRow);
