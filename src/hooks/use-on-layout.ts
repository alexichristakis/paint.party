import { useState, useCallback } from "react";
import { LayoutChangeEvent } from "react-native";

export function useOnLayout() {
  const [layout, setLayout] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0
  });
  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setLayout(e.nativeEvent.layout);
  }, []);

  return {
    onLayout,
    ...layout
  };
}
