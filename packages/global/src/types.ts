export type Canvas = {
  id: string;
  name: string;
  creator: string;
  authors: string[];
  backgroundColor: string;
  nextDrawAt: number;
  createdAt: number;
  expiresAt: number;
};

export type NewCanvas = Pick<Canvas, "name" | "backgroundColor" | "expiresAt">;

export type CellUpdate = {
  id: string;
  time: number;
  author: string;
  color: string;
};

export type Cell = { [cellUpdateId: string]: CellUpdate };
export type Cells = { [id: string]: Cell };

export type Positions = { [uid: string]: number };

export type Palette = {
  id: string;
  name: string;
  colors: string[];
};

export type Palettes = { [id: string]: Palette };
