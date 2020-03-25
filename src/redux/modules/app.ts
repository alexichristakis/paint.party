import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import {
  createAction,
  ActionsUnion,
  ExtractActionFromActionCreator,
  RootState
} from "../types";

export type AppState = Readonly<{
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  user?: FirebaseAuthTypes.User;
}>;

const initialState: AppState = {
  isAuthenticated: false,
  isAuthenticating: false
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
  AUTH_ERROR = "app/AUTH_ERROR"
}

export const Actions = {
  reset: () => createAction(ActionTypes.RESET),
  login: () => createAction(ActionTypes.LOGIN),
  loginSuccess: (user: FirebaseAuthTypes.User) =>
    createAction(ActionTypes.LOGIN_SUCCESS, { user }),
  logout: () => createAction(ActionTypes.LOGOUT),
  logoutSuccess: () => createAction(ActionTypes.LOGOUT_SUCCESS),
  authError: (error: string) => createAction(ActionTypes.AUTH_ERROR, { error })
};
