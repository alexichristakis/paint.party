import { combineReducers } from "redux";

import AppReducer from "./app";
import CanvasReducer from "./canvas";
import PaletteReducer from "./palette";
import VisualizationReducer from "./visualization";

export const rootReducer = combineReducers({
  app: AppReducer,
  canvas: CanvasReducer,
  palette: PaletteReducer,
  visualization: VisualizationReducer
});

export * from "./app";
export * from "./canvas";
export * from "./palette";
export * from "./visualization";
