import React, { useEffect } from "react";
import { View, ImageURISource, StyleProp, ImageStyle } from "react-native";
import storage from "@react-native-firebase/storage";
import { connect, ConnectedProps } from "react-redux";
import Image from "react-native-fast-image";

import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { CanvasActions } from "@redux/modules";
import { CANVAS_PREVIEW_SIZE } from "@lib";

const connector = connect(
  (state: RootState, props: CanvasPreviewProps) => ({
    url: selectors.previewUrl(state, props),
  }),
  {
    setUrl: CanvasActions.setPreviewUrl,
  }
);

export type CanvasPreviewConnectedProps = ConnectedProps<typeof connector>;

export interface CanvasPreviewProps {
  id: string;
  backgroundColor: string;
  style?: ImageStyle;
  size?: number;
}

const CanvasPreview: React.FC<
  CanvasPreviewProps & CanvasPreviewConnectedProps
> = ({
  backgroundColor,
  id,
  url,
  setUrl,
  style: styleProp,
  size = CANVAS_PREVIEW_SIZE,
}) => {
  useEffect(() => {
    if (!url) {
      storage()
        .ref(id)
        .getDownloadURL()
        .then((newUrl) => setUrl(id, newUrl))
        .catch((err) => {});
    }
  }, [url]);

  const style = {
    ...styleProp,
    width: size,
    height: size,
    backgroundColor,
  };

  if (url)
    return <Image source={{ uri: url }} resizeMode={"cover"} style={style} />;

  return <View style={style} />;
};

export default connector(CanvasPreview);
