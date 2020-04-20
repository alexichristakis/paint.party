import { isOfType } from "typesafe-actions";
import { Observable } from "rxjs";
import moment from "moment";
import uniq from "lodash/uniq";
import {
  map,
  filter,
  catchError,
  takeUntil,
  switchMap,
  tap,
  ignoreElements,
} from "rxjs/operators";
import { Epic } from "redux-observable";
import database, {
  FirebaseDatabaseTypes,
} from "@react-native-firebase/database";

import * as selectors from "../selectors";
import { VisualizationActions } from "../modules";
import { RootState, ActionUnion as Actions, ActionTypes } from "../types";
import { Notifications } from "react-native-notifications";
import { DRAW_INTERVAL, canvasUrl } from "@lib";

import { captureRef } from "react-native-view-shot";
import storage from "@react-native-firebase/storage";

const subscribeToCanvas: Epic<Actions, Actions, RootState> = (
  action$,
  state$
) =>
  action$.pipe(
    filter(isOfType(ActionTypes.SUBSCRIBE)),
    switchMap(() => {
      const id = selectors.activeCanvas(state$.value);
      const uid = selectors.uid(state$.value);

      const ref = database().ref(id);

      const obs = new Observable<Actions>((subscriber) => {
        let loaded = false;

        ref.on(
          "child_added",
          (change: FirebaseDatabaseTypes.DataSnapshot) => {
            if (loaded) {
              subscriber.next(
                VisualizationActions.update(+change.key!, change.val())
              );
            }
          }
          //   error => console.log("ERROR", error)
        );

        ref.on(
          "child_changed",
          (change: FirebaseDatabaseTypes.DataSnapshot) => {
            if (loaded) {
              const id = change.key;
              if (id === "live") {
                return subscriber.next(
                  VisualizationActions.setLivePositions(change.val())
                );
              }

              return subscriber.next(
                VisualizationActions.update(+change.key!, change.val())
              );
            }
          }
          //   error => console.log("ERROR", error)
        );

        ref.once("value").then((val) => {
          const data = val.val();
          ref
            .child(`live/${uid}`)
            .set(-1)
            .then(() => {
              loaded = true;

              if (!data) {
                return subscriber.next(
                  VisualizationActions.subscribeSuccess(id, null, null)
                );
              }

              const { live, ...cells } = data;

              subscriber.next(
                VisualizationActions.subscribeSuccess(id, cells, live)
              );
            });
        });

        return () => {
          ref.off("child_added");
          ref.off("child_changed");
        };
      });

      return obs.pipe(
        map((action) => action),
        takeUntil(action$.pipe(filter(isOfType(ActionTypes.CLOSE_CANVAS))))
      );
    }),
    catchError((error) =>
      Promise.resolve(VisualizationActions.updateFailure(error))
    )
  );

const drawOnCanvas: Epic<Actions, Actions, RootState> = (action$, state$) =>
  action$.pipe(
    filter(isOfType(ActionTypes.DRAW)),
    switchMap(async ({ payload }) => {
      const uid = selectors.uid(state$.value);
      const activeCanvas = selectors.activeCanvas(state$.value);

      const { cell, color } = payload;

      await database()
        .ref(activeCanvas)
        .child(String(cell))
        .push()
        .set({ author: uid, time: moment().unix(), color });

      const { name } = selectors.activeCanvasEntity(state$.value);

      const nextDrawAt = moment().add(DRAW_INTERVAL, "minutes");

      // @ts-ignore
      Notifications.postLocalNotification({
        fireDate: nextDrawAt.toISOString(),
        body: "Ready to draw!",
        title: name,
        sound: "chime.aiff",
        link: canvasUrl(activeCanvas),
      });

      return VisualizationActions.drawSuccess(activeCanvas, nextDrawAt.unix());
    })
  );

const capturePreview: Epic<Actions, Actions, RootState> = (action$, state$) =>
  action$.pipe(
    filter(isOfType(ActionTypes.DRAW)),
    tap(async (action) => {
      const { canvasRef } = action.payload;

      const uri = await captureRef(canvasRef);
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

export default [subscribeToCanvas, drawOnCanvas, capturePreview];
