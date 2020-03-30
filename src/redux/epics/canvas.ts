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
  ignoreElements
} from "rxjs/operators";
import { isOfType } from "typesafe-actions";
import { Epic } from "redux-observable";
import database, {
  FirebaseDatabaseTypes
} from "@react-native-firebase/database";
import firestore from "@react-native-firebase/firestore";

import * as selectors from "../selectors";
import {
  CanvasActions,
  VisualizationActions,
  VisualizationState
} from "../modules";
import { Canvas } from "../modules/canvas";
import { RootState, ActionUnion as Actions, ActionTypes } from "../types";
import { Notifications } from "react-native-notifications";
import { DRAW_INTERVAL, canvasUrl } from "@lib";

const openCanvas: Epic<Actions, Actions, RootState> = (action$, state$) =>
  action$.pipe(
    filter(isOfType(ActionTypes.OPEN_CANVAS)),
    switchMap(action => {
      const { id } = action.payload;

      const ref = database().ref(id);

      const uid = selectors.uid(state$.value);
      const obs = new Observable<Actions>(subscriber => {
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

        ref.once("value").then(val => {
          const data = val.val();

          ref
            .child(`live/${uid}`)
            .set(-1)
            .then(() => {
              loaded = true;

              if (!data) {
                return subscriber.next(
                  VisualizationActions.openSuccess(null, null)
                );
              }

              const { live, ...cells } = data;

              subscriber.next(VisualizationActions.openSuccess(cells, live));
            });
        });

        return () => {
          ref.off("child_added");
          ref.off("child_changed");
        };
      });

      return obs.pipe(
        map(action => action),
        takeUntil(action$.pipe(filter(isOfType(ActionTypes.CLOSE_CANVAS))))
      );
    }),
    catchError(error =>
      Promise.resolve(VisualizationActions.updateFailure(error))
    )
  );

const drawOnCanvas: Epic<Actions, Actions, RootState> = (action$, state$) =>
  action$.pipe(
    filter(isOfType(ActionTypes.DRAW)),
    switchMap(async () => {
      const uid = selectors.uid(state$.value);
      const activeCanvas = selectors.activeCanvas(state$.value);
      const cellId = selectors.selectedCell(state$.value);
      const color = selectors.selectedColor(state$.value);

      await database()
        .ref(activeCanvas)
        .child(String(cellId))
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
        link: canvasUrl(activeCanvas)
      });

      return VisualizationActions.drawSuccess(activeCanvas, nextDrawAt.unix());
    })
  );

const createCanvas: Epic<Actions, Actions, RootState> = (action$, state$) =>
  action$.pipe(
    filter(isOfType(ActionTypes.CREATE_CANVAS)),
    switchMap(async ({ payload }) => {
      const { canvas } = payload;

      const createdAt = moment().unix();

      const creator = selectors.uid(state$.value) as string;

      const { id } = await firestore()
        .collection("canvases")
        .add({ ...canvas, creator, authors: [creator], createdAt });

      return CanvasActions.createSuccess({
        ...canvas,
        id,
        authors: [creator],
        creator,
        createdAt,
        nextDrawAt: 0
      });
    })
  );

const joinCanvas: Epic<Actions, Actions, RootState> = (action$, state$) =>
  action$.pipe(
    filter(isOfType(ActionTypes.JOIN_CANVAS)),
    switchMap(async ({ payload }) => {
      const { id } = payload;

      const canvas = await firestore()
        .collection("canvases")
        .doc(id)
        .get();

      const canvasMetadata = canvas.data();

      if (!canvasMetadata) {
        return CanvasActions.joinFailure();
      }

      const uid = selectors.uid(state$.value);

      await firestore()
        .collection("canvases")
        .doc(id)
        .update({ authors: uniq([...canvasMetadata.authors, uid]) });

      return CanvasActions.joinSuccess({ ...canvasMetadata, id } as Canvas);
    })
  );

const fetchCanvases: Epic<Actions, Actions, RootState> = (action$, state$) =>
  action$.pipe(
    filter(isOfType(ActionTypes.FETCH_CANVASES)),
    switchMap(async () => {
      const uid = selectors.uid(state$.value);

      const res = await firestore()
        .collection("canvases")
        .where("authors", "array-contains", uid)
        .get();

      const canvases = res.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Canvas[];

      return CanvasActions.fetchSuccess(canvases);
    })
  );

const closeCanvas: Epic<Actions, Actions, RootState> = (action$, state$) =>
  action$.pipe(
    filter(isOfType(ActionTypes.CLOSE_CANVAS)),
    tap(async () => {
      const uid = selectors.uid(state$.value);
      const id = selectors.canvasVizId(state$.value);

      await database()
        .ref(id)
        .child(`live/${uid}`)
        .remove();
    }),
    ignoreElements()
  );

const updateLivePosition: Epic<Actions, Actions, RootState> = (
  action$,
  state$
) =>
  action$.pipe(
    filter(isOfType(ActionTypes.SELECT_CELL)),
    tap(async action => {
      const { cell } = action.payload;

      const uid = selectors.uid(state$.value);
      const canvas = selectors.activeCanvas(state$.value);

      await database()
        .ref(canvas)
        .child(`live/${uid}`)
        .set(cell);
    }),
    ignoreElements()
  );

export default [
  openCanvas,
  closeCanvas,
  drawOnCanvas,
  createCanvas,
  joinCanvas,
  fetchCanvases,
  updateLivePosition
];
