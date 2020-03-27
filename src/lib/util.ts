import Animated from "react-native-reanimated";
import { State } from "react-native-gesture-handler";

import { URL_PREFIX, CELL_SIZE, CANVAS_DIMENSIONS } from "./constants";

const { cond, eq, neq, and, call, set, proc, block } = Animated;

export const coordinatesToIndex = (x: number, y: number) =>
  Math.floor(y / CELL_SIZE) * CANVAS_DIMENSIONS + Math.floor(x / CELL_SIZE);

export const coordinatesFromIndex = (index: number) => {
  const y = Math.floor(index / CANVAS_DIMENSIONS) * CELL_SIZE;
  const x = Math.floor(index % CANVAS_DIMENSIONS) * CELL_SIZE;

  return { x, y };
};

export const onGestureEnd = proc(
  (
    val: Animated.Adaptable<number>,
    prevVal: Animated.Value<number>,
    action: any
  ) =>
    block([
      cond(eq(prevVal, State.UNDETERMINED), set(prevVal, val)),
      cond(neq(val, prevVal), [
        set(prevVal, val),
        cond(eq(val, State.END), action)
      ])
    ])
);

export const canvasUrl = (canvasId: string) =>
  URL_PREFIX + "canvas/" + canvasId;
