import React, { useRef, useContext, useMemo } from "react";
import Animated, { useCode, Easing } from "react-native-reanimated";
import { connect, ConnectedProps } from "react-redux";
import {
  TapGestureHandler,
  PanGestureHandler,
  State,
} from "react-native-gesture-handler";
import { StyleSheet } from "react-native";
import {
  mix,
  onGestureEvent,
  withTransition,
  useValue,
} from "react-native-redash";
import { useMemoOne } from "use-memo-one";

import { RootState } from "@redux/types";
import { ColorEditorContext } from "@hooks";
import { Colors } from "@lib";

import Editor from "./Editor";

const { onChange, call, cond, eq } = Animated;

export type ColorEditorConnectedProps = ConnectedProps<typeof connector>;

export type ColorEditorProps = {};

const mapStateToProps = (state: RootState) => ({});

const mapDispatchToProps = {};

const ColorEditor: React.FC<
  ColorEditorProps & ColorEditorConnectedProps
> = ({}) => {
  const { transition, x, y, color, visible, scale, close } = useContext(
    ColorEditorContext
  );

  const indicatorPanRef = useRef<PanGestureHandler>(null);
  const tapRef = useRef<TapGestureHandler>(null);

  const tapState = useValue(State.UNDETERMINED);

  const pressInTransition = useMemoOne(
    () =>
      withTransition(eq(tapState, State.BEGAN), {
        duration: 300,
        easing: Easing.inOut(Easing.ease),
      }),
    []
  );

  // start close of editor
  useCode(
    () => [
      onChange(
        tapState,
        cond(
          eq(tapState, State.END),
          call([], () => close())
        )
      ),
    ],
    []
  );

  return useMemo(() => {
    const tapHandler = onGestureEvent({ state: tapState });

    return (
      <Animated.View
        style={[styles.container, { opacity: cond(eq(transition, 0), 0, 1) }]}
        pointerEvents={visible ? "auto" : "none"}
      >
        <TapGestureHandler
          ref={tapRef}
          waitFor={indicatorPanRef}
          {...tapHandler}
        >
          <Animated.View
            style={{
              ...styles.background,
              opacity: mix(transition, 0, 0.7),
            }}
          />
        </TapGestureHandler>

        <Animated.View
          pointerEvents="box-none"
          style={{
            ...styles.container,
            transform: [{ scale: mix(pressInTransition, 1, 0.95) }],
          }}
        >
          <Editor {...{ color, close, transition, scale, x, y }} />
        </Animated.View>
      </Animated.View>
    );
  }, [visible, color]);
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.gray,
  },
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(ColorEditor);
