import moment from "moment";
import uniq from "lodash/uniq";
import { filter, switchMap } from "rxjs/operators";
import { isOfType } from "typesafe-actions";
import { Epic } from "redux-observable";

import firestore from "@react-native-firebase/firestore";

import * as selectors from "../selectors";
import { CanvasActions } from "../modules";
import { Canvas } from "../modules/canvas";
import { RootState, ActionUnion as Actions, ActionTypes } from "../types";
import { Alert } from "react-native";

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
        nextDrawAt: 0,
      });
    })
  );

const joinCanvas: Epic<Actions, Actions, RootState> = (action$, state$) =>
  action$.pipe(
    filter(isOfType(ActionTypes.JOIN_CANVAS)),
    switchMap(async ({ payload }) => {
      const { id } = payload;

      const canvas = await firestore().collection("canvases").doc(id).get();

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

const renameCanvas: Epic<Actions, Actions, RootState> = (action$, state$) =>
  action$.pipe(
    filter(isOfType(ActionTypes.RENAME_CANVAS)),
    switchMap(async ({ payload }) => {
      const { id, name } = payload;

      console.log(id, name);

      await firestore().collection("canvases").doc(id).update({ name });

      return CanvasActions.renameSuccess(id, name);
    })
  );

const leaveCanvas: Epic<Actions, Actions, RootState> = (action$, state$) =>
  action$.pipe(
    filter(isOfType(ActionTypes.LEAVE_CANVAS)),
    switchMap(async ({ payload }) => {
      const { id } = payload;

      const canvas = await firestore().collection("canvases").doc(id).get();

      const canvasMetadata = canvas.data();

      if (!canvasMetadata) {
        return CanvasActions.leaveFailure();
      }

      const uid = selectors.uid(state$.value);

      await firestore()
        .collection("canvases")
        .doc(id)
        .update({
          authors: (canvasMetadata.authors as string[]).filter(
            (e) => e !== uid
          ),
        });

      return CanvasActions.leaveSuccess(id);
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

      const canvases = res.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Canvas[];

      return CanvasActions.fetchSuccess(canvases);
    })
  );

// const updateLivePosition: Epic<Actions, Actions, RootState> = (
//   action$,
//   state$
// ) =>
//   action$.pipe(
//     filter(isOfType(ActionTypes.SELECT_CELL)),
//     tap(async action => {
//       const { cell } = action.payload;

//       const uid = selectors.uid(state$.value);
//       const canvas = selectors.activeCanvas(state$.value);

//       await database()
//         .ref(canvas)
//         .child(`live/${uid}`)
//         .set(cell);
//     }),
//     ignoreElements()
//   );

export default [
  // closeCanvas,
  renameCanvas,
  leaveCanvas,
  createCanvas,
  joinCanvas,
  fetchCanvases,
  // updateLivePosition
];
