import React, { useImperativeHandle, useRef, useState } from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle
} from "react-native";
import {
  NativeViewGestureHandler,
  PanGestureHandler,
  State,
  TapGestureHandler
} from "react-native-gesture-handler";
import Animated, { Extrapolate } from "react-native-reanimated";
import {
  bin,
  clamp,
  onGestureEvent,
  onScrollEvent,
  spring,
  useValues,
  withSpring
} from "react-native-redash";

import CloseIcon from "@assets/svg/close.svg";
import {
  Colors,
  SB_HEIGHT,
  TextStyles,
  SCREEN_HEIGHT,
  SCREEN_WIDTH
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
  Value
} = Animated;

const { UNDETERMINED } = State;

const config = {
  damping: 50,
  mass: 1,
  stiffness: 500,
  overshootClamping: false,
  restSpeedThreshold: 0.1,
  restDisplacementThreshold: 0.1
};

export interface ModalListProps {
  scrollRef?: React.RefObject<Animated.ScrollView>;
  showHeader?: boolean;
  children: React.ReactNode;
  title?: string;
  style?: StyleProp<ViewStyle>;
  yOffset?: Animated.Value<number>;
  onSnap?: (index: number) => void;
  onClose?: () => void;
}

export type ModalListRef = {
  open: () => void;
  openFully: () => void;
  close: () => void;
};

const FULLY_OPEN = SB_HEIGHT;
const SNAP_OPEN = SCREEN_HEIGHT / 2;
const CLOSED = SCREEN_HEIGHT;

export const ModalList = React.memo(
  React.forwardRef<ModalListRef, ModalListProps>(
    (
      {
        title,
        style,
        showHeader = true,
        children,
        yOffset = new Animated.Value(0),
        scrollRef,
        onSnap,
        onClose
      },
      ref
    ) => {
      const [clock] = useState(new Clock());

      const [isOpen, setIsOpen] = useState(false);
      const [lastSnap, setLastSnap] = useState(SCREEN_HEIGHT);

      const masterDrawerRef = useRef<TapGestureHandler>(null);
      const scrollHandlerRef = useRef<NativeViewGestureHandler>(null);
      const panRef = useRef<PanGestureHandler>(null);

      const [dragY, velocityY, scrollY, lastScrollY, offset] = useValues(
        [0, 0, 0, 0, SCREEN_HEIGHT],
        []
      );
      const [gestureState] = useValues([UNDETERMINED], []);

      const [goUpFully] = useState<Animated.Value<0 | 1>>(new Value(0));
      const [goUp] = useState<Animated.Value<0 | 1>>(new Value(0));
      const [goDown] = useState<Animated.Value<0 | 1>>(new Value(0));

      const open = () => goUp.setValue(1);
      const openFully = () => {
        goUpFully.setValue(1);
      };
      const close = () => {
        if (onSnap) onSnap(0);
        goDown.setValue(1);
      };

      useImperativeHandle(ref, () => ({
        open,
        openFully,
        close
      }));

      const handleClose = () => {
        setIsOpen(false);
        if (onClose) onClose();
      };

      const handleOnSnap = (values: readonly number[]) => {
        values.forEach(value => {
          if (value === SNAP_OPEN) {
            setIsOpen(true);
          } else if (value === FULLY_OPEN) {
            setIsOpen(true);
          } else {
            handleClose();
          }

          if (onSnap) onSnap(value);

          // fix memory leak
          if (value !== SCREEN_HEIGHT || !onClose) {
            setLastSnap(value);
          }
        });
      };

      const panHandler = onGestureEvent({
        state: gestureState,
        translationY: dragY,
        velocityY
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
            config
          }),
          FULLY_OPEN,
          CLOSED
        )
      );

      const opacity = interpolate(translateY, {
        inputRange: [0, SCREEN_HEIGHT],
        outputRange: [0.8, 0],
        extrapolate: Extrapolate.CLAMP
      });

      const dividerOpacity = interpolate(scrollY, {
        inputRange: [0, 10],
        outputRange: [0, 1],
        extrapolate: Extrapolate.CLAMP
      });

      useCode(
        () =>
          block([
            set(yOffset, translateY),
            cond(
              eq(translateY, SNAP_OPEN),
              call([], () => setLastSnap(SNAP_OPEN))
            ),
            cond(
              eq(translateY, SB_HEIGHT),
              call([], () => setLastSnap(FULLY_OPEN))
            ),
            cond(goUp, [
              set(
                offset,
                spring({
                  clock,
                  from: offset,
                  to: SNAP_OPEN,
                  config
                })
              ),
              call([], () => setIsOpen(true)),
              cond(not(clockRunning(clock)), [set(goUp, 0)])
            ]),
            cond(goUpFully, [
              set(
                offset,
                spring({
                  clock,
                  from: offset,
                  to: FULLY_OPEN,
                  config
                })
              ),
              cond(not(clockRunning(clock)), [
                set(goUpFully, 0),
                cond(
                  not(bin(isOpen)),
                  call([], () => setIsOpen(true))
                )
              ])
            ]),
            cond(goDown, [
              set(
                offset,
                spring({
                  clock,
                  from: offset,
                  to: CLOSED,
                  config
                })
              ),
              cond(not(clockRunning(clock)), [
                set(goDown, 0),
                call([], handleClose)
              ])
            ])
          ]),
        []
      );

      return (
        <TapGestureHandler
          ref={masterDrawerRef}
          maxDurationMs={100000}
          maxDeltaY={lastSnap - FULLY_OPEN}
        >
          <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
            <Animated.View
              onTouchEndCapture={close}
              pointerEvents={isOpen ? "auto" : "none"}
              style={[styles.overlay, { opacity }]}
            />
            <PanGestureHandler
              ref={panRef}
              maxPointers={1}
              minDist={10}
              simultaneousHandlers={[scrollHandlerRef, masterDrawerRef]}
              {...panHandler}
            >
              <Animated.View
                style={[styles.container, { transform: [{ translateY }] }]}
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
                    contentContainerStyle={[
                      { paddingTop: showHeader ? 40 : 10, paddingBottom: 110 },
                      style
                    ]}
                  >
                    {children}
                  </Animated.ScrollView>
                </NativeViewGestureHandler>
                {showHeader && (
                  <>
                    <View style={styles.headerContainer}>
                      <Text style={TextStyles.medium}>{title}</Text>
                      <TouchableOpacity
                        style={{ alignSelf: "flex-end" }}
                        onPress={close}
                      >
                        <CloseIcon width={25} height={25} />
                      </TouchableOpacity>
                    </View>
                    <Animated.View
                      style={[
                        styles.headerDivider,
                        { opacity: dividerOpacity }
                      ]}
                    />
                  </>
                )}
              </Animated.View>
            </PanGestureHandler>
          </View>
        </TapGestureHandler>
      );
    }
  )
);

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    backgroundColor: "white",
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT
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
    marginBottom: 7
  },
  headerDivider: {
    width: "100%",
    height: 1,
    backgroundColor: Colors.lightGray
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.nearBlack
  }
});
