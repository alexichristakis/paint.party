import React from "react";
import {
  TapGestureHandler,
  State,
  TapGestureHandlerStateChangeEvent,
} from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { bin } from "react-native-redash";
import { StyleSheet } from "react-native";

import { CanvasPreview } from "@components/universal";
import { Canvas } from "@redux/modules";

const { cond, eq } = Animated;

export interface ItemProps {
  transition: Animated.Node<number>;
  focused: boolean;
  canvas: Canvas;
  onPress: () => void;
}

const Item: React.FC<ItemProps> = React.memo(
  ({ focused, canvas, transition, onPress }) => {
    const handleOnStateChange = ({
      nativeEvent: { state, oldState },
    }: TapGestureHandlerStateChangeEvent) => {
      if (state === State.END && oldState === State.ACTIVE) onPress();
    };

    const opacity = cond(bin(focused), cond(eq(transition, 0), 1, 0), 1);
    return (
      <TapGestureHandler onHandlerStateChange={handleOnStateChange}>
        <Animated.View style={{ opacity }}>
          <CanvasPreview {...canvas} style={styles.image} />
        </Animated.View>
      </TapGestureHandler>
    );
  },
  (p, n) => p.focused === n.focused
);

const styles = StyleSheet.create({
  image: {
    borderRadius: 10,
  },
});

export default Item;
