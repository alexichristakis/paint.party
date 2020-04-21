import { combineReducers } from "redux";

import AppReducer from "./app";
import CanvasReducer from "./canvas";
import PaletteReducer from "./palette";
import VisualizationReducer from "./visualization";
import DrawReducer from "./draw";
import ModalReducer from "./modal";

export const rootReducer = combineReducers({
  app: AppReducer,
  canvas: CanvasReducer,
  palette: PaletteReducer,
  visualization: VisualizationReducer,
  draw: DrawReducer,
  modal: ModalReducer,
});

export * from "./app";
export * from "./canvas";
export * from "./palette";
export * from "./visualization";
export * from "./draw";
export * from "./modal";
