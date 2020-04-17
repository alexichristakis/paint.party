import React, { useContext, useMemo } from "react";
import Animated from "react-native-reanimated";
import { mix } from "react-native-redash";
import { ConnectedProps, connect } from "react-redux";
import { StyleSheet } from "react-native";
import isEqual from "lodash/isEqual";

import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { PhotoCarouselContext } from "@hooks";
import { CANVAS_PREVIEW_SIZE, CAROUSEL_TOP, CAROUSEL_SIZE, Colors } from "@lib";

const { cond, eq } = Animated;

export interface CarouselProps {}

export type CarouselConnectedProps = ConnectedProps<typeof connector>;

const mapStateToProps = (state: RootState) => ({
  urls: selectors.previews(state),
});

const mapDispatchToProps = {};

const Carousel: React.FC<CarouselProps & CarouselConnectedProps> = React.memo(
  ({ urls }) => {
    const { x, y, visible, close, canvas, transition } = useContext(
      PhotoCarouselContext
    );

    const url = urls[canvas.id];

    const animatedStyle = {
      backgroundColor: canvas.backgroundColor,
      top: mix(transition, y, CAROUSEL_TOP),
      left: mix(transition, x, 0),
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
              position: "absolute",
              top: CAROUSEL_TOP - 50,
              color: "white",
            }}
          >
            {canvas.name}
          </Animated.Text>
          <Animated.Image
            source={{ uri: url, cache: "force-cache" }}
            style={[{ position: "absolute" }, animatedStyle]}
          />
        </Animated.View>
      ),
      [url, visible]
    );
  },
  (p, n) => isEqual(p, n)
);

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(Carousel);
