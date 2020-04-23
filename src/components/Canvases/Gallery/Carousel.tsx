import React, { useContext, useMemo } from "react";
import Animated from "react-native-reanimated";
import { mix } from "react-native-redash";
import { ConnectedProps, connect } from "react-redux";
import { StyleSheet } from "react-native";
import Image from "react-native-fast-image";
import isEqual from "lodash/isEqual";

import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { PhotoCarouselContext } from "@hooks";
import {
  CANVAS_PREVIEW_SIZE,
  CAROUSEL_TOP,
  CAROUSEL_SIZE,
  Colors,
  TextStyles,
  SCREEN_HEIGHT,
} from "@lib";

const { cond, eq } = Animated;

const AnimatedImage = Animated.createAnimatedComponent(Image);

export interface CarouselProps {}

export type CarouselConnectedProps = ConnectedProps<typeof connector>;

const connector = connect(
  (state: RootState) => ({
    urls: selectors.previews(state),
  }),
  {}
);

const Carousel: React.FC<CarouselProps & CarouselConnectedProps> = React.memo(
  ({ urls }) => {
    const { x, y, visible, close, canvas, transition } = useContext(
      PhotoCarouselContext
    );

    const url = urls[canvas.id];

    const animatedStyle = {
      position: "absolute",
      borderRadius: 10,
      backgroundColor: canvas.backgroundColor,
      top: mix(transition, y, CAROUSEL_TOP),
      left: mix(transition, x, 10),
      height: mix(transition, CANVAS_PREVIEW_SIZE, CAROUSEL_SIZE),
      width: mix(transition, CANVAS_PREVIEW_SIZE, CAROUSEL_SIZE),
    };

    const opacity = mix(transition, 0, 0.8);
    return useMemo(
      () => (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { opacity: cond(eq(transition, 0), 0, 1) },
          ]}
          pointerEvents={visible ? "auto" : "none"}
          onTouchEnd={close}
        >
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              { opacity, backgroundColor: Colors.nearBlack },
            ]}
          />

          <Animated.Text
            style={{
              ...TextStyles.title,
              opacity,
              marginHorizontal: 20,
              position: "absolute",
              bottom: SCREEN_HEIGHT - CAROUSEL_TOP + 5,
              // left: 0,
              // right: 0,
              color: "white",
            }}
          >
            {canvas.name}
          </Animated.Text>
          <AnimatedImage source={{ uri: url }} style={animatedStyle} />
        </Animated.View>
      ),
      [url, visible]
    );
  },
  (p, n) => isEqual(p, n)
);

export default connector(Carousel);
