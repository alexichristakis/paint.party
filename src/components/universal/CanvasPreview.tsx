import React, { useEffect } from "react";
import { Image, View, ImageURISource } from "react-native";
import storage from "@react-native-firebase/storage";
import { connect, ConnectedProps } from "react-redux";

import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { CanvasActions } from "@redux/modules";
import { CANVAS_PREVIEW_SIZE } from "@lib";

const mapStateToProps = (state: RootState, props: CanvasPreviewProps) => ({
  url: selectors.previewUrl(state, props),
});

const mapDispatchToProps = {
  setUrl: CanvasActions.setPreviewUrl,
};

export type CanvasPreviewConnectedProps = ConnectedProps<typeof connector>;

export interface CanvasPreviewProps {
  id: string;
  backgroundColor: string;
  cache?: ImageURISource["cache"];
  size?: number;
}

const CanvasPreview: React.FC<
  CanvasPreviewProps & CanvasPreviewConnectedProps
> = ({
  backgroundColor,
  id,
  url,
  setUrl,
  cache,
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
    width: size,
    height: size,
    backgroundColor,
  };

  if (url)
    return (
      <Image
        source={{ uri: url, cache }}
        resizeMethod={"scale"}
        resizeMode={"cover"}
        style={style}
      />
    );

  return <View style={style} />;
};

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(CanvasPreview);
