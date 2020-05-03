import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

import firebase from "@firebase";
import { Canvas as CanvasType, gifURL, validCanvasId } from "@global";

import styles from "./Canvas.module.scss";

const Canvas: React.FC = () => {
  const route = useRouter();

  const [canvas, setCanvas] = useState<CanvasType | null>(null);

  let canvasId = "";
  if (validCanvasId(route.query.c)) {
    canvasId = route.query.c as string;
  }

  useEffect(() => {
    if (validCanvasId(canvasId)) {
      firebase
        .firestore()
        .collection("canvases")
        .doc(canvasId)
        .get()
        .then(
          (val) => {
            if (val.exists) {
              const data = val.data();

              if (data) {
                setCanvas(data as CanvasType);
              }
            }
          },
          (err) => console.log(err)
        );
    }
  }, [canvasId]);

  console.log(route.query.c);

  if (canvasId.length)
    return (
      <div className={styles.container}>
        {!!canvas ? <h2>{canvas.name}</h2> : null}
        <img
          style={{ width: "500px", height: "500px" }}
          src={gifURL(canvasId)}
        />
      </div>
    );
  else
    return (
      <div>
        <h2>whoops! that canvas doesn't appear to exist</h2>
      </div>
    );
};

export default Canvas;
