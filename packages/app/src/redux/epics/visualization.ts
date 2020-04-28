import { isOfType } from "typesafe-actions";
import { Observable } from "rxjs";
import moment from "moment";
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

import { captureRef, releaseCapture } from "react-native-view-shot";
import storage from "@react-native-firebase/storage";
import FastImage from "react-native-fast-image";

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
    switchMap(async () => {
      const uid = selectors.uid(state$.value);
      const activeCanvas = selectors.activeCanvas(state$.value);

      const color = selectors.selectedColor(state$.value);
      const cell = selectors.selectedCell(state$.value);

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
    tap(async () => {
      const ref = selectors.captureRef(state$.value);
      const canvasId = selectors.canvasVizId(state$.value);

      const uri = await captureRef(ref);
      return Promise.resolve().then(() =>
        storage()
          .ref(canvasId)
          .putFile(uri, { contentType: "image/png" })
          .then(async (res) => {
            releaseCapture(uri);

            const url = await res.ref.getDownloadURL();

            FastImage.preload([{ uri: url }]);
          })
          .catch((err) => console.log(err))
      );
    }),
    ignoreElements()
  );

export default [subscribeToCanvas, drawOnCanvas, capturePreview];
