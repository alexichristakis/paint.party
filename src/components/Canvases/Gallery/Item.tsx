import React, { useContext, useMemo, useRef } from "react";
import {
  TapGestureHandler,
  State,
  TapGestureHandlerStateChangeEvent,
} from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { bin } from "react-native-redash";
import { StyleSheet } from "react-native";
import Haptics from "react-native-haptic-feedback";

import { CanvasPreview } from "@components/universal";
import { Canvas } from "@redux/modules";
import { PhotoCarouselContext } from "@hooks";

const { cond, eq } = Animated;

export interface ItemProps {
  canvas: Canvas;
}

const Item: React.FC<ItemProps> = ({ canvas }) => {
  const ref = useRef<Animated.View>(null);
  const {
    x,
    y,
    open,
    transition,
    setActiveCanvas,
    canvas: activeCanvas,
  } = useContext(PhotoCarouselContext);

  const focused = activeCanvas.id === canvas.id;
  return useMemo(() => {
    const handleOnStateChange = ({
      nativeEvent: { state, oldState },
    }: TapGestureHandlerStateChangeEvent) => {
      if (state === State.END && oldState === State.ACTIVE) {
        ref.current?.getNode().measure((_, __, ___, ____, pageX, pageY) => {
          x.setValue(pageX);
          y.setValue(pageY);

          Haptics.trigger("impactLight");
          setActiveCanvas(canvas);
          open();
        });
      }
    };

    const opacity = cond(bin(focused), cond(eq(transition, 0), 1, 0), 1);
    return (
      <TapGestureHandler onHandlerStateChange={handleOnStateChange}>
        <Animated.View ref={ref} style={{ opacity }}>
          <CanvasPreview {...canvas} style={styles.image} />
        </Animated.View>
      </TapGestureHandler>
    );
  }, [focused]);
};

const styles = StyleSheet.create({
  image: {
    borderRadius: 10,
  },
});

export default Item;
