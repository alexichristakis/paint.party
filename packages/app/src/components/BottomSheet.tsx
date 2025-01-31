import React, { useRef, useLayoutEffect, useCallback } from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import {
  NativeViewGestureHandler,
  PanGestureHandler,
  State,
} from "react-native-gesture-handler";
import Animated, { Extrapolate, useCode } from "react-native-reanimated";
import {
  bin,
  clamp,
  onGestureEvent,
  onScrollEvent,
  spring,
  useValues,
  withSpring,
  useClocks,
  useValue,
} from "react-native-redash";

import { Colors, SB_HEIGHT, SCREEN_HEIGHT, SCREEN_WIDTH } from "@lib";
import { useMemoOne } from "use-memo-one";

const { interpolate, call, cond, not, set, clockRunning, sub } = Animated;

const { UNDETERMINED } = State;

const config = {
  damping: 50,
  mass: 1,
  stiffness: 500,
  overshootClamping: false,
  restSpeedThreshold: 0.1,
  restDisplacementThreshold: 0.1,
};

export interface BottomSheetProps {
  scrollRef?: React.RefObject<Animated.ScrollView>;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  open: boolean;
  onClose: () => void;
}

const FULLY_OPEN = SB_HEIGHT;
const SNAP_OPEN = SCREEN_HEIGHT / 2;
const CLOSED = SCREEN_HEIGHT;

export const BottomSheet: React.FC<BottomSheetProps> = React.memo(
  ({ open, style, children, scrollRef, onClose }) => {
    const [clock] = useClocks(1);

    const scrollHandlerRef = useRef<NativeViewGestureHandler>(null);
    const panRef = useRef<PanGestureHandler>(null);

    const [drag, velocity, scroll, lastScroll, offset] = useValues([
      0,
      0,
      0,
      0,
      SCREEN_HEIGHT,
    ]);
    const [shouldOpen, shouldClose] = useValues([bin(open), 0]);
    const panState = useValue(UNDETERMINED);

    const panHandler = onGestureEvent({
      state: panState,
      translationY: drag,
      velocityY: velocity,
    });

    const handleOnSnap = ([value]: readonly number[]) => {
      if (value === CLOSED) {
        onClose();
      }
    };

    const translateY = useMemoOne(
      () =>
        clamp(
          withSpring({
            value: sub(drag, lastScroll),
            velocity: velocity,
            state: panState,
            snapPoints: [FULLY_OPEN, SNAP_OPEN, CLOSED],
            onSnap: handleOnSnap,
            offset,
            config,
          }),
          FULLY_OPEN,
          CLOSED
        ),
      []
    );

    useLayoutEffect(() => {
      shouldOpen.setValue(bin(open));
      shouldClose.setValue(bin(!open));
    }, [open]);

    const reset = [set(shouldOpen, 0), set(shouldClose, 0)];
    useCode(
      () => [
        cond(shouldOpen, [
          set(
            offset,
            spring({
              clock,
              to: SNAP_OPEN,
              from: offset,
              config,
            })
          ),
          cond(not(clockRunning(clock)), reset),
        ]),
        cond(shouldClose, [
          set(
            offset,
            spring({
              clock,
              to: CLOSED,
              from: offset,
              config,
            })
          ),
          cond(not(clockRunning(clock)), [reset, call([], onClose)]),
        ]),
      ],
      []
    );

    const opacity = interpolate(translateY, {
      inputRange: [0, SCREEN_HEIGHT],
      outputRange: [0.8, 0],
      extrapolate: Extrapolate.CLAMP,
    });

    const handleOnPressOverlay = useCallback(() => {
      shouldOpen.setValue(0);
      shouldClose.setValue(1);
    }, []);

    if (open)
      return (
        <>
          <Animated.View
            onTouchEndCapture={handleOnPressOverlay}
            pointerEvents={open ? "auto" : "none"}
            style={[styles.overlay, { opacity }]}
          />
          <PanGestureHandler
            ref={panRef}
            maxPointers={1}
            minDist={10}
            simultaneousHandlers={scrollHandlerRef}
            {...panHandler}
          >
            <Animated.View
              style={StyleSheet.absoluteFill}
              pointerEvents="box-none"
            >
              <NativeViewGestureHandler
                ref={scrollHandlerRef}
                simultaneousHandlers={panRef}
              >
                <Animated.ScrollView
                  ref={scrollRef}
                  bounces={false}
                  scrollEventThrottle={16}
                  onScrollBeginDrag={onScrollEvent({ y: lastScroll })}
                  onScroll={onScrollEvent({ y: scroll })}
                  style={[styles.container, { transform: [{ translateY }] }]}
                  contentContainerStyle={[
                    { paddingTop: 10, paddingBottom: 110 },
                    style,
                  ]}
                >
                  {children}
                </Animated.ScrollView>
              </NativeViewGestureHandler>
            </Animated.View>
          </PanGestureHandler>
        </>
      );

    return null;
  },
  (p, n) => p.open === n.open
);

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    backgroundColor: "white",
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.nearBlack,
  },
});
