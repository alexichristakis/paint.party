import { useValues } from "react-native-redash";

import { ColorEditorState } from "@components/ColorEditor";

export const useColorEditorState = (): ColorEditorState => {
  const [id, x, y, width, height] = useValues<number>([-1, 0, 0, 0, 0], []);

  return {
    id,
    layout: {
      x,
      y,
      width,
      height,
    },
  };
};
