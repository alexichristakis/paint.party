import { combineReducers } from "redux";

import { AppReducer } from "./modules";
import { RootState } from "./types";

export default combineReducers({
  app: AppReducer
});
