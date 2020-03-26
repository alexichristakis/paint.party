import { from, fromEvent, fromEventPattern, Observable } from "rxjs";
import moment from "moment";
import uniq from "lodash/uniq";
import {
  map,
  withLatestFrom,
  delay,
  filter,
  mergeMap,
  exhaustMap,
  catchError,
  takeUntil,
  startWith,
  switchMap
} from "rxjs/operators";
import { Action } from "redux";
import { isOfType } from "typesafe-actions";
import {
  Epic,
  ofType,
  ActionsObservable,
  StateObservable
} from "redux-observable";
import database, {
  FirebaseDatabaseTypes
} from "@react-native-firebase/database";
import firestore from "@react-native-firebase/firestore";

import * as selectors from "../selectors";
import { Actions, ActionTypes, AppActions, CanvasActions } from "../modules";
import canvas, { CellUpdate, Canvas, CanvasViz } from "../modules/canvas";
import { RootState, ExtractActionFromActionCreator } from "../types";

const openCanvas: Epic<Actions> = action$ =>
  action$.pipe(
    filter(isOfType(ActionTypes.OPEN_CANVAS)),
    switchMap(action => {
      const { id } = action.payload;

      const ref = database().ref(id);

      const obs = new Observable<Actions>(subscriber => {
        let initialLoadComplete = false;
        ref.once("value").then(val => {
          initialLoadComplete = true;
          subscriber.next(CanvasActions.openSuccess({ id, cells: val.val() }));
        });

        ref.on(
          "child_changed",
          (change: FirebaseDatabaseTypes.DataSnapshot) => {
            subscriber.next(CanvasActions.update(+change.key!, change.val()));
          }
          //   error => console.log("ERROR", error)
        );

        ref.on(
          "child_added",
          (change: FirebaseDatabaseTypes.DataSnapshot) => {
            if (initialLoadComplete) {
              subscriber.next(CanvasActions.update(+change.key!, change.val()));
            }
          }
          //   error => console.log("ERROR", error)
        );

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
    catchError(error => Promise.resolve(CanvasActions.updateFailure(error)))
  );

const drawOnCanvas: Epic<Actions, Actions, RootState> = (action$, state$) =>
  action$.pipe(
    filter(isOfType(ActionTypes.DRAW_ON_CANVAS)),
    switchMap(async ({ payload }) => {
      const { cellId, color } = payload;

      const uid = selectors.uid(state$.value);
      const activeCanvas = selectors.activeCanvas(state$.value);

      await database()
        .ref(activeCanvas)
        .child(String(cellId))
        .push()
        .set({ author: uid, time: moment().unix(), color });

      return CanvasActions.drawSuccess();
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

export default [
  openCanvas,
  drawOnCanvas,
  createCanvas,
  joinCanvas,
  fetchCanvases
];
