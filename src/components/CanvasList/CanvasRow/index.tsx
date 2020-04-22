import React from "react";
import {
  View,
  StyleSheet,
  Text,
  StyleProp,
  ViewStyle,
  Share,
} from "react-native";
import Animated, { useCode, interpolate } from "react-native-reanimated";
import Haptics from "react-native-haptic-feedback";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import {
  useValues,
  useGestureHandler,
  useValue,
  withSpring,
  spring,
} from "react-native-redash";

import { Colors, canvasUrl } from "@lib";
import { Canvas } from "@redux/modules/canvas";
import { TouchableHighlight } from "@components/universal";
import { useOnLayout } from "@hooks";

import Buttons from "./Buttons";
import Content from "./Content";

const { cond, set, onChange, multiply } = Animated;

export interface CanvasRowProps {
  canvas: Canvas;
  onPress: (canvasId: string) => void;
}

const config = {
  damping: 40,
  mass: 1,
  stiffness: 300,
  overshootClamping: false,
  restSpeedThreshold: 0.1,
  restDisplacementThreshold: 0.1,
};

export const CanvasRow: React.FC<CanvasRowProps> = ({ onPress, canvas }) => {
  const { onLayout, width } = useOnLayout();

  const { name, id } = canvas;

  const state = useValue(State.UNDETERMINED, []);
  const pressed = useValue<0 | 1>(0, []);
  const [drag, velocity] = useValues<number>([0, 0], []);

  const handler = useGestureHandler(
    {
      state,
      translationX: drag,
      velocityX: velocity,
    },
    []
  );

  const handleOnLongPress = () => {
    Haptics.trigger("impactMedium");
    Share.share({
      title: `share ${name}`,
      message: canvasUrl(id),
    });
  };

  const handleOnPress = () => onPress(id);

  const translateX = withSpring({
    value: drag,
    velocity,
    state,
    snapPoints: [0, -width],
    config,
  });

  const buttonContainer = {
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
  };

  return (
    <PanGestureHandler {...handler} maxDeltaY={10} activeOffsetX={[-10, 10]}>
      <Animated.View
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Animated.View onLayout={onLayout} style={buttonContainer}>
          <Buttons />
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
            <Content canvas={canvas} />
          </TouchableHighlight>
        </Animated.View>
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    flexDirection: "row",
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
});
