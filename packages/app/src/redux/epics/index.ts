import { combineEpics } from "redux-observable";

import appEpics from "./app";
import canvasEpics from "./canvas";
import visualizationEpics from "./visualization";

export default combineEpics(...appEpics, ...canvasEpics, ...visualizationEpics);
