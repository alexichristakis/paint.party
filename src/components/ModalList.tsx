import React, { useRef, useState } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import {
  NativeViewGestureHandler,
  PanGestureHandler,
  State,
  TapGestureHandler,
} from "react-native-gesture-handler";
import Animated, { onChange } from "react-native-reanimated";
import {
  bin,
  clamp,
  onGestureEvent,
  onScrollEvent,
  spring,
  useValues,
  withSpring,
} from "react-native-redash";
import isEqual from "lodash/isEqual";

import {
  Colors,
  SB_HEIGHT,
  TextStyles,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
} from "@lib";

const {
  interpolate,
  useCode,
  cond,
  and,
  debug,
  abs,
  eq,
  not,
  call,
  block,
  set,
  clockRunning,
  sub,
  Clock,
  Value,
} = Animated;

const { UNDETERMINED } = State;

const config = {
  damping: 50,
  mass: 1,
  stiffness: 500,
  overshootClamping: false,
  restSpeedThreshold: 0.1,
  restDisplacementThreshold: 0.1,
};

export interface ModalListProps {
  scrollRef?: React.RefObject<Animated.ScrollView>;
  children: React.ReactNode;
  open: Animated.Value<0 | 1>;
  style?: StyleProp<ViewStyle>;
  yOffset?: Animated.Value<number>;
  onSnap?: (index: number) => void;
  onClose?: () => void;
}

const FULLY_OPEN = SB_HEIGHT;
const SNAP_OPEN = SCREEN_HEIGHT / 2;
const CLOSED = SCREEN_HEIGHT;

export const ModalList: React.FC<ModalListProps> = React.memo(
  ({
    open,
    style,
    children,
    yOffset = new Animated.Value(0),
    scrollRef,
    onSnap,
    onClose,
  }) => {
    const [clock] = useState(new Clock());

    const [lastSnap, setLastSnap] = useState(SCREEN_HEIGHT);

    const masterDrawerRef = useRef<TapGestureHandler>(null);
    const scrollHandlerRef = useRef<NativeViewGestureHandler>(null);
    const panRef = useRef<PanGestureHandler>(null);

    const [dragY, velocityY, scrollY, lastScrollY, offset] = useValues(
      [0, 0, 0, 0, SCREEN_HEIGHT],
      []
    );
    const [shouldOpen, shouldClose] = useValues([0, 0], []);

    const [gestureState] = useValues([UNDETERMINED], []);

    const handleClose = () => {
      if (onClose) onClose();
    };

    const handleOnSnap = ([value]: readonly number[]) => {
      if (value === CLOSED) {
        handleClose();
      }

      if (value !== SCREEN_HEIGHT || !onClose) {
        setLastSnap(value);
      }

      if (onSnap) onSnap(value);
    };

    const panHandler = onGestureEvent({
      state: gestureState,
      translationY: dragY,
      velocityY,
    });

    const [translateY] = useState(
      clamp(
        withSpring({
          value: sub(dragY, lastScrollY),
          velocity: velocityY,
          state: gestureState,
          snapPoints: [FULLY_OPEN, SNAP_OPEN, CLOSED],
          onSnap: handleOnSnap,
          offset,
          config,
        }),
        FULLY_OPEN,
        CLOSED
      )
    );

    useCode(
      () => [
        onChange(open, [
          cond(
            and(open, not(shouldOpen)),
            [set(shouldOpen, 1), set(shouldClose, 0)],
            [
              cond(and(not(open), not(shouldClose)), [
                set(shouldOpen, 0),
                set(shouldClose, 1),
              ]),
            ]
          ),
        ]),

        set(yOffset, translateY),
        cond(
          eq(translateY, SNAP_OPEN),
          call([], () => setLastSnap(SNAP_OPEN))
        ),
        cond(
          eq(translateY, SB_HEIGHT),
          call([], () => setLastSnap(FULLY_OPEN))
        ),
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
          cond(not(clockRunning(clock)), set(shouldOpen, 0)),
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
          cond(not(clockRunning(clock)), set(shouldClose, 0)),
        ]),
      ],
      [open]
    );

    return (
      <TapGestureHandler
        ref={masterDrawerRef}
        maxDurationMs={100000}
        maxDeltaY={lastSnap - FULLY_OPEN}
      >
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <PanGestureHandler
            ref={panRef}
            maxPointers={1}
            minDist={10}
            simultaneousHandlers={[scrollHandlerRef, masterDrawerRef]}
            {...panHandler}
          >
            <Animated.View
              style={StyleSheet.absoluteFill}
              pointerEvents="box-none"
            >
              <NativeViewGestureHandler
                ref={scrollHandlerRef}
                waitFor={masterDrawerRef}
                simultaneousHandlers={panRef}
              >
                <Animated.ScrollView
                  ref={scrollRef}
                  bounces={false}
                  scrollEventThrottle={16}
                  onScrollBeginDrag={onScrollEvent({ y: lastScrollY })}
                  onScroll={onScrollEvent({ y: scrollY })}
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
        </View>
      </TapGestureHandler>
    );
  },
  (p, n) => isEqual(p.open, n.open)
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
  headerContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    marginRight: 10,
    marginLeft: 15,
    marginBottom: 7,
  },
  headerDivider: {
    width: "100%",
    height: 1,
    backgroundColor: Colors.lightGray,
  },
});
