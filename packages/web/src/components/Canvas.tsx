import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

import firebase from "@firebase";
import { Canvas as CanvasType, gifURL, validCanvasId } from "@global";

import styles from "./Canvas.module.scss";

const Canvas: React.FC = () => {
  const route = useRouter();

  let canvasId = "";
  if (validCanvasId(route.query.c)) {
    canvasId = route.query.c as string;
  }

  const [canvasExists, setCanvasExists] = useState(!!canvasId.length);
  const [canvas, setCanvas] = useState<CanvasType | null>(null);

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
            } else {
              setCanvasExists(false);
            }
          },
          (err) => console.log(err)
        );
    }
  }, [canvasId]);

  if (canvasExists)
    return (
      <div className={styles.container}>
        {!!canvas ? <h2 className={styles.header}>{canvas.name}</h2> : null}
        <img className={styles.gif} src={gifURL(canvasId)} />
      </div>
    );

  return (
    <div>
      <h2>whoops! that canvas doesn't appear to exist</h2>
    </div>
  );
};

export default Canvas;
