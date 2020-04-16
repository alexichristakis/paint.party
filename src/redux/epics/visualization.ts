import { filter, tap, ignoreElements } from "rxjs/operators";
import { isOfType } from "typesafe-actions";
import { Epic } from "redux-observable";

import { captureRef } from "react-native-view-shot";
import storage from "@react-native-firebase/storage";

import * as selectors from "../selectors";
import { RootState, ActionUnion as Actions, ActionTypes } from "../types";

const capturePreview: Epic<Actions, Actions, RootState> = (action$, state$) =>
  action$.pipe(
    filter(isOfType(ActionTypes.CAPTURE_CANVAS_PREVIEW)),
    tap(async (action) => {
      const { ref } = action.payload;

      const uri = await captureRef(ref);

      const canvasId = selectors.canvasVizId(state$.value);

      return Promise.resolve().then(() =>
        storage()
          .ref(canvasId)
          .putFile(uri, { contentType: "image/png" })
          .then((res) => console.log(res))
          .catch((err) => console.log(err))
      );
    }),
    ignoreElements()
  );

export default [capturePreview];
