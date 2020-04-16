import {
  map,
  filter,
  catchError,
  takeUntil,
  switchMap,
  tap,
  ignoreElements,
} from "rxjs/operators";
import { isOfType } from "typesafe-actions";
import { Epic } from "redux-observable";
import tinycolor from "tinycolor2";
import storage from "@react-native-firebase/storage";

import * as selectors from "../selectors";
import { RootState, ActionUnion as Actions, ActionTypes } from "../types";
import {
  CANVAS_DIMENSIONS,
  Bitmap,
  indicesFromIndex,
  colorFromCell,
} from "@lib";

const capturePreview: Epic<Actions, Actions, RootState> = (action$, state$) =>
  action$.pipe(
    filter(isOfType(ActionTypes.CLOSE_CANVAS)),
    tap(async () => {
      const cells = selectors.cells(state$.value);
      const canvasId = selectors.canvasVizId(state$.value);
      const backgroundColor = selectors.canvasBackgroundColor(state$.value, {
        canvasId,
      });

      const { r, g, b } = tinycolor(backgroundColor).toRgb();

      const buffer = new Bitmap(CANVAS_DIMENSIONS, CANVAS_DIMENSIONS, [
        r / 255,
        g / 255,
        b / 255,
        1,
      ]);

      Object.keys(cells).forEach((index) => {
        const { i, j } = indicesFromIndex(+index);
        const cell = cells[index];

        const { r, g, b } = tinycolor(
          colorFromCell(cell, backgroundColor)
        ).toRgb();

        buffer.pixel[i][j] = [r / 255, g / 255, b / 255, 1];
      });

      const base64 = buffer.dataURL();

      const ref = storage().ref(canvasId);

      return Promise.resolve().then(() =>
        ref
          .putString(base64, "base64")
          .then((res) => console.log(res))
          .catch((err) => console.log(err))
      );
    }),
    ignoreElements()
  );

export default [capturePreview];
