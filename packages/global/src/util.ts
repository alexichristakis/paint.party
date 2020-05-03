export const coordinatesToIndex = (
  x: number,
  y: number,
  canvasSize: number,
  cellSize: number
) => Math.floor(y / cellSize) * canvasSize + Math.floor(x / cellSize);

export const indicesFromIndex = (index: number, canvasSize: number) => {
  const i = Math.floor(index % canvasSize);
  const j = Math.floor(index / canvasSize);

  return { i, j };
};

export const coordinatesFromIndex = (
  index: number,
  canvasSize: number,
  cellSize: number
) => {
  const { i, j } = indicesFromIndex(index, canvasSize);

  return { x: i * cellSize, y: j * cellSize };
};

export const validCanvasId = (canvasId: any) => {
  return typeof canvasId === "string";
};
