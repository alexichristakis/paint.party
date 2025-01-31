import { useMemo } from "react";
import { useDispatch } from "react-redux";

type ActionCreator = (...args: any) => any;

export function useReduxAction<AC extends ActionCreator>(actionCreator: AC) {
  const dispatch = useDispatch();

  return useMemo(
    () => (...args: AC extends (...args: infer Args) => any ? Args : any[]) => {
      dispatch(actionCreator(...(args as any[])));
    },
    [actionCreator]
  );
}
