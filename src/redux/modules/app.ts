import { FirebaseAuthTypes } from "@react-native-firebase/auth";

import { createAction, ActionsUnion } from "../types";
import { AppStateStatus } from "react-native";

export type AppState = Readonly<{
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  status: AppStateStatus;
  user?: FirebaseAuthTypes.User;
}>;

const initialState: AppState = {
  isAuthenticated: false,
  isAuthenticating: false,
  status: "active"
};

export default (
  state: AppState = initialState,
  action: ActionsUnion<typeof Actions>
): AppState => {
  switch (action.type) {
    case ActionTypes.LOGOUT_SUCCESS:
    case ActionTypes.RESET: {
      return { ...initialState };
    }

    case ActionTypes.LOGIN: {
      return { ...state, isAuthenticating: true };
    }

    case ActionTypes.LOGIN_SUCCESS: {
      const { user } = action.payload;
      return {
        ...state,
        isAuthenticated: true,
        isAuthenticating: false,
        user
      };
    }

    case ActionTypes.LOGOUT: {
      return {
        ...state,
        isAuthenticating: true
      };
    }

    default:
      return state;
  }
};

export enum ActionTypes {
  RESET = "app/RESET",
  LOGIN = "app/LOGIN",
  LOGIN_SUCCESS = "app/LOGIN_SUCCESS",
  LOGOUT = "app/LOGOUT",
  LOGOUT_SUCCESS = "app/LOGOUT_SUCCESS",
  SET_APP_STATUS = "app/SET_STATUS",
  AUTH_ERROR = "app/AUTH_ERROR"
}

export const Actions = {
  reset: () => createAction(ActionTypes.RESET),
  login: () => createAction(ActionTypes.LOGIN),
  loginSuccess: (user: FirebaseAuthTypes.User) =>
    createAction(ActionTypes.LOGIN_SUCCESS, { user }),
  logout: () => createAction(ActionTypes.LOGOUT),
  logoutSuccess: () => createAction(ActionTypes.LOGOUT_SUCCESS),

  setStatus: (status: AppStateStatus) =>
    createAction(ActionTypes.SET_APP_STATUS, { status }),

  authError: (error: string) => createAction(ActionTypes.AUTH_ERROR, { error })
};
