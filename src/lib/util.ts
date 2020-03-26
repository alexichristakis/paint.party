import { CELL_SIZE, CANVAS_DIMENSIONS } from "./constants";

export const coordinatesToIndex = (x: number, y: number) =>
  Math.floor(y / CELL_SIZE) * CANVAS_DIMENSIONS + Math.floor(x / CELL_SIZE);

export const coordinatesFromIndex = (index: number) => {
  const y = Math.floor(index / CANVAS_DIMENSIONS) * CELL_SIZE;
  const x = Math.floor(index % CANVAS_DIMENSIONS) * CELL_SIZE;

  return { x, y };
};
