export const base64 = (data: string) => {
  let enc = "";
  for (let i = 5, n = data.length * 8 + 5; i < n; i += 6)
    enc += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"[
      (((data.charCodeAt(~~(i / 8) - 1) << 8) | data.charCodeAt(~~(i / 8))) >>
        (7 - (i % 8))) &
        63
    ];
  for (; enc.length % 4; enc += "=");
  return enc;
};

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
