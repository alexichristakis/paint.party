import Animated from "react-native-reanimated";
import { State } from "react-native-gesture-handler";

import { URL_PREFIX, CELL_SIZE, CANVAS_DIMENSIONS } from "./constants";

const {
  cond,
  eq,
  sqrt,
  pow,
  neq,
  and,
  call,
  set,
  proc,
  block,
  add,
  multiply,
  lessThan,
  abs,
  modulo,
  round,
  interpolate,
  divide,
  sub,
  color,
  Extrapolate
} = Animated;

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

export const pluralize = (text: string, ls: number | any[]) => {
  let count = ls;
  if (ls instanceof Array) {
    count = ls.length;
  }

  if (count === 1) return `1 ${text}`;
  return `${count} ${text}s`;
};

export const hash = (val: string, i: number) => {
  let hash = i;
  if (val.length == 0) {
    return hash;
  }

  for (var i = 0; i < val.length; i++) {
    const char = val.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return hash;
};

export const dist = (
  x: Animated.Adaptable<number>,
  y: Animated.Adaptable<number>
) => sqrt(add(pow(x, 2), pow(y, 2)));

export const match = (
  condsAndResPairs: readonly Animated.Node<number>[],
  offset = 0
): undefined | Animated.Node<number> => {
  if (condsAndResPairs.length - offset === 1) {
    return condsAndResPairs[offset];
  }
  if (condsAndResPairs.length - offset === 0) {
    return undefined;
  }
  return cond(
    condsAndResPairs[offset],
    condsAndResPairs[offset + 1],
    match(condsAndResPairs, offset + 2)
  );
};

export const colorHSV = (
  h: Animated.Adaptable<number> /* 0 - 360 */,
  s: Animated.Adaptable<number> /* 0 - 1 */,
  v: Animated.Adaptable<number> /* 0 - 1 */
): Animated.Node<number> => {
  // Converts color from HSV format into RGB
  // Formula explained here: https://www.rapidtables.com/convert/color/hsv-to-rgb.html
  const c = multiply(v, s);
  const hh = divide(h, 60);
  const x = multiply(c, sub(1, abs(sub(modulo(hh, 2), 1))));

  const m = sub(v, c);

  const colorRGB = (
    r: Animated.Adaptable<number>,
    g: Animated.Adaptable<number>,
    b: Animated.Adaptable<number>
  ) =>
    color(
      round(multiply(255, add(r, m))),
      round(multiply(255, add(g, m))),
      round(multiply(255, add(b, m)))
    );

  return match([
    lessThan(h, 60),
    colorRGB(c, x, 0),
    lessThan(h, 120),
    colorRGB(x, c, 0),
    lessThan(h, 180),
    colorRGB(0, c, x),
    lessThan(h, 240),
    colorRGB(0, x, c),
    lessThan(h, 300),
    colorRGB(x, 0, c),
    colorRGB(c, 0, x) /* else */
  ]) as Animated.Node<number>;
};
