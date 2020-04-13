import React, { useRef, useContext, useMemo } from "react";
import { View } from "react-native";
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
  withSpringTransition,
  mix,
  withTransition,
} from "react-native-redash";
import { useMemoOne } from "use-memo-one";

import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { PaletteActions } from "@redux/modules";
import { ColorEditorContext } from "@hooks";
import {
  SCREEN_WIDTH,
  COLOR_BORDER_WIDTH,
  Colors,
  SCREEN_HEIGHT,
  colorHSV,
  EDITOR_SIZE,
  INDICATOR_SIZE,
} from "@lib";

import Editor from "./Editor";

const {
  onChange,
  min,
  max,
  multiply,
  abs,
  neq,
  debug,
  and,
  not,
  call,
  cond,
  eq,
  greaterThan,
  set,
  add,
  sub,
  divide,
  modulo,
} = Animated;

export type ColorEditorConnectedProps = ConnectedProps<typeof connector>;

export type ColorEditorProps = {};

const mapStateToProps = (state: RootState) => ({
  active: selectors.editingActive(state),
});

const mapDispatchToProps = {
  closeEditor: PaletteActions.closeEditor,
};

const ColorEditor: React.FC<ColorEditorProps & ColorEditorConnectedProps> = ({
  closeEditor,
  active,
}) => {
  console.log("render color editor ");
  const colorEditorState = useContext(ColorEditorContext);
  const { id, layout } = colorEditorState;

  const indicatorPanRef = useRef<PanGestureHandler>(null);
  const tapRef = useRef<TapGestureHandler>(null);

  const [tapState] = useValues([State.UNDETERMINED], []);

  const duration = 300;
  const [transition, pressInTransition] = useMemoOne(
    () => [
      withTransition(neq(id, -1), {
        duration,
        easing: Easing.bezier(0.33, 0.11, 0.49, 0.83),
      }),
      withTransition(eq(tapState, State.BEGAN), {
        duration,
        easing: Easing.inOut(Easing.ease),
      }),
    ],
    []
  );

  // start close of editor
  useCode(
    () => [onChange(tapState, cond(eq(tapState, State.END), set(id, -1)))],
    []
  );

  // handle closing the editor
  useCode(
    () => [
      cond(
        and(eq(id, -1), not(transition), bin(active)),
        call([], closeEditor)
      ),
    ],
    [active]
  );

  return useMemo(() => {
    const tapHandler = onGestureEvent({ state: tapState });

    return (
      <View
        style={[styles.container, { opacity: active ? 1 : 0 }]}
        pointerEvents={active ? "auto" : "none"}
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
          <Editor id={id} transition={transition} {...layout} />
        </Animated.View>
      </View>
    );
  }, [active]);
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
