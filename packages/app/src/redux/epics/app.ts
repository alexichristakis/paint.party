import {
  map,
  delay,
  filter,
  mergeMap,
  exhaustMap,
  catchError,
  flatMap,
  mapTo,
  switchMap
} from "rxjs/operators";
import { Action } from "redux";
import { isOfType } from "typesafe-actions";
import { Epic } from "redux-observable";
import auth from "@react-native-firebase/auth";
import AsyncStorage from "@react-native-community/async-storage";
import { Observable, fromEvent, pipe } from "rxjs";
import { REHYDRATE } from "redux-persist";
import { AppState, Linking } from "react-native";

import * as selectors from "@redux/selectors";

import { AppActions, CanvasActions } from "../modules";
import {
  RootState,
  ActionTypes,
  ActionUnion as Actions,
  ExtractActionFromActionCreator
} from "../types";

const appStateEpic: Epic<Actions, Actions, RootState> = (action$, state$) =>
  action$.pipe(
    filter(isOfType(REHYDRATE)),
    switchMap(
      () =>
        new Observable<Actions>(subscriber => {
          const obs1 = fromEvent(AppState, "change").subscribe(async status => {
            subscriber.next(AppActions.setStatus(status));
          });

          const obs2 = fromEvent(Linking, "url").subscribe(({ url }) => {
            const group = url.match(/canvas\/(.*)/);

            if (group) {
              const [, canvasId] = group;

              const canvases = selectors.canvases(state$.value);

              if (Object.keys(canvases).includes(canvasId)) {
                return subscriber.next(CanvasActions.open(canvasId));
              }

              return subscriber.next(CanvasActions.join(canvasId));
            }
          });

          return () => {
            obs1.unsubscribe();
            obs2.unsubscribe();
          };
        })
    )
  );

const loginEpic: Epic<Actions, Actions, RootState> = (action$, store$) =>
  action$.pipe(
    filter(isOfType(ActionTypes.LOGIN)),
    exhaustMap(async action => {
      const { user } = await auth().signInAnonymously();

      return AppActions.loginSuccess(user);
    }),
    catchError(error => AppActions.authError)
  );

const logoutEpic: Epic<Actions, Actions, RootState> = (action$, store$) =>
  action$.pipe(
    filter(isOfType(ActionTypes.LOGOUT)),
    exhaustMap(async action => {
      await Promise.all([auth().signOut(), AsyncStorage.clear()]);

      return AppActions.logoutSuccess();
    }),
    catchError(error => AppActions.authError)
  );

export default [loginEpic, logoutEpic, appStateEpic];
