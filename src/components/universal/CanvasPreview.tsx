import React, { useEffect, useState } from "react";
import { Image, View, StyleSheet } from "react-native";
import Animated from "react-native-reanimated";
import storage from "@react-native-firebase/storage";
import { CANVAS_PREVIEW_SIZE } from "@lib";

export interface CanvasPreviewProps {
  canvasId: string;
  backgroundColor: string;
  size?: number;
}

const CanvasPreview: React.FC<CanvasPreviewProps> = ({
  backgroundColor,
  canvasId,
  size = CANVAS_PREVIEW_SIZE,
}) => {
  const [url, setUrl] = useState("");

  useEffect(() => {
    storage()
      .ref(canvasId)
      .getDownloadURL()
      .then(setUrl)
      .catch((err) => {});
  }, []);

  const style = {
    width: size,
    height: size,
    backgroundColor,
  };
  if (url.length)
    return (
      <Image
        source={{ uri: url }}
        resizeMethod={"scale"}
        resizeMode={"cover"}
        style={style}
      />
    );

  return <View style={style} />;
};

export default CanvasPreview;
