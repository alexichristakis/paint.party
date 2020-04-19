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
  useValues,
  bin,
  onGestureEvent,
  mix,
  withTransition,
} from "react-native-redash";
import { useMemoOne } from "use-memo-one";

import { RootState } from "@redux/types";
import { ColorEditorContext } from "@hooks";
import { COLOR_BORDER_WIDTH, Colors, INDICATOR_SIZE } from "@lib";

import Editor from "./Editor";

const { onChange, neq, and, not, call, cond, eq, set } = Animated;

export type ColorEditorConnectedProps = ConnectedProps<typeof connector>;

export type ColorEditorProps = {};

const mapStateToProps = (state: RootState) => ({});

const mapDispatchToProps = {
  // closeEditor: PaletteActions.closeColorEditor,
};

const ColorEditor: React.FC<
  ColorEditorProps & ColorEditorConnectedProps
> = ({}) => {
  const { transition, x, y, color, visible, scale, close } = useContext(
    ColorEditorContext
  );

  const indicatorPanRef = useRef<PanGestureHandler>(null);
  const tapRef = useRef<TapGestureHandler>(null);

  const [tapState] = useValues([State.UNDETERMINED], []);

  const duration = 300;
  const [pressInTransition] = useMemoOne(
    () => [
      withTransition(eq(tapState, State.BEGAN), {
        duration,
        easing: Easing.inOut(Easing.ease),
      }),
    ],
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

  // handle closing the editor
  // useCode(
  //   () => [
  //     cond(
  //       and(eq(id, -1), not(transition), bin(active)),
  //       call([], closeEditor)
  //     ),
  //   ],
  //   [active]
  // );

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
  editor: {
    overflow: "hidden",
    position: "absolute",
    borderWidth: COLOR_BORDER_WIDTH,
  },
  indicator: {
    width: INDICATOR_SIZE,
    height: INDICATOR_SIZE,
    borderRadius: INDICATOR_SIZE / 2,
    borderColor: Colors.white,
    borderWidth: 4,
  },
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(ColorEditor);
