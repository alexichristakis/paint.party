import { useValues } from "react-native-redash";
import { ColorEditorState } from "@components/PaletteEditor/ColorEditor";

export const useColorEditorState = (): ColorEditorState => {
  const [index, x, y, width, height, h, s, v] = useValues<number>(
    [-1, 0, 0, 0, 0, 0, 0, 0],
    []
  );
  const [transitioning] = useValues<0 | 1>([0], []);
  const [paletteId] = useValues<string>([""], []);

  return {
    index,
    color: {
      h,
      s,
      v
    },
    transitioning,
    paletteId,
    layout: {
      x,
      y,
      width,
      height
    }
  };
};
