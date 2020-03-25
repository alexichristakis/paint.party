import { combineEpics } from "redux-observable";

import appEpics from "./app";
import canvasEpics from "./canvas";

export default combineEpics(...appEpics, ...canvasEpics);
