import { useValues } from "react-native-redash";

import { ColorEditorState } from "@components/PaletteEditor/ColorEditor";

export const useColorEditorState = (): ColorEditorState => {
  const [id, x, y, width, height, h, s, v] = useValues<number>(
    [-1, 0, 0, 0, 0, 0, 0, 0],
    []
  );

  return {
    id,
    color: {
      h,
      s,
      v
    },
    layout: {
      x,
      y,
      width,
      height
    }
  };
};
