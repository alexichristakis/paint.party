import {
  createAction,
  ActionsUnion,
  ExtractActionFromActionCreator
} from "../types";

export type AppState = Readonly<{
  isAuthenticated: boolean;
}>;

const initialState: AppState = {
  isAuthenticated: false
};

export default (
  state: AppState = initialState,
  action: ActionsUnion<typeof Actions>
): AppState => {
  switch (action.type) {
    case ActionTypes.RESET: {
      return { ...initialState };
    }

    default:
      return state;
  }
};

export enum ActionTypes {
  RESET = "app/RESET"
}

export const Actions = {
  requestAuth: () => createAction(ActionTypes.RESET)
};
