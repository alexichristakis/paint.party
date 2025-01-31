import { FirebaseAuthTypes } from "@react-native-firebase/auth";

import { createAction, ActionUnion, ActionTypes } from "../types";
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
  status: "active",
};

export default (
  state: AppState = initialState,
  action: ActionUnion
): AppState => {
  switch (action.type) {
    case ActionTypes.LOGOUT_SUCCESS: {
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
        user,
      };
    }

    case ActionTypes.LOGOUT: {
      return {
        ...state,
        isAuthenticating: true,
      };
    }

    default:
      return state;
  }
};

export const AppActions = {
  login: () => createAction(ActionTypes.LOGIN),
  loginSuccess: (user: FirebaseAuthTypes.User) =>
    createAction(ActionTypes.LOGIN_SUCCESS, { user }),
  logout: () => createAction(ActionTypes.LOGOUT),
  logoutSuccess: () => createAction(ActionTypes.LOGOUT_SUCCESS),

  setStatus: (status: AppStateStatus) =>
    createAction(ActionTypes.SET_APP_STATUS, { status }),

  authError: (error: string) => createAction(ActionTypes.AUTH_ERROR, { error }),
};
