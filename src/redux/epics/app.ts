import {
  map,
  delay,
  filter,
  mergeMap,
  exhaustMap,
  catchError
} from "rxjs/operators";
import { Action } from "redux";
import { isOfType } from "typesafe-actions";
import {
  Epic,
  ofType,
  ActionsObservable,
  StateObservable
} from "redux-observable";
import auth from "@react-native-firebase/auth";
import AsyncStorage from "@react-native-community/async-storage";

import { Actions, ActionTypes, AppActions } from "../modules";
import { RootState, ExtractActionFromActionCreator } from "../types";

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

export default [loginEpic, logoutEpic];
