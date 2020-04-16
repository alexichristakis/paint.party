import React, { useEffect, useState } from "react";
import { Image, View } from "react-native";
import Animated from "react-native-reanimated";
import storage from "@react-native-firebase/storage";
import axios from "axios";
import Resizer from "react-native-image-resizer";
import { Bitmap, base64 } from "@lib";

export interface PreviewProps {
  canvasId: string;
}

const Preview: React.FC<PreviewProps> = ({ canvasId }) => {
  const [url, setUrl] = useState("");

  useEffect(() => {
    storage()
      .ref(canvasId)
      .getDownloadURL()
      .then(async (url) => {
        console.log(url);
        setUrl(url);

        const res = await axios
          .get(url, { responseType: "arraybuffer" })
          .then((response) => {
            let image = base64(
              new Uint8Array(response.data).reduce(
                (data, byte) => data + String.fromCharCode(byte),
                ""
              )
            );
            return `data:${response.headers[
              "content-type"
            ].toLowerCase()};base64,${image}`;
          });

        console.log("new string:", res);

        Resizer.createResizedImage(
          "data:image/png" + res.substring(29),
          80,
          80,
          "PNG",
          100
        ).then((res) => {
          //   setUrl(res.uri);
        });

        // fetch(url).then((res) => {
        //   console.log("RES:", res);

        //   res.json().then((json) => console.log(json));
        // });
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <Image
      source={{ uri: url }}
      resizeMethod={"scale"}
      resizeMode={"cover"}
      style={{
        width: 80,
        height: 80,
        // resizeMode: "cover",
        //   transform: [{ scale: 40 }],
        backgroundColor: "red",
      }}
    />
  );
};

export default Preview;
