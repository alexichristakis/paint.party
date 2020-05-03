import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

import { getCanvas } from "@firebase";
import {
  Canvas as CanvasType,
  appStoreUrl,
  gifURL,
  localURL,
  validCanvasId,
  pluralize,
} from "@global";
import { Button } from "./universal";

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
    getCanvas(canvasId).then(
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
      (err) => {
        setCanvasExists(false);
      }
    );
  }, [canvasId]);

  const handleClickJoin = () => {
    window.open(localURL(canvasId));
  };

  const handleClickAppStore = () => {
    window.open(appStoreUrl);
  };

  if (canvasExists)
    return (
      <div className={styles.container}>
        <h2 className={styles.header}>{canvas?.name ?? "loading..."}</h2>
        <img className={styles.gif} src={gifURL(canvasId)} />
        <Button
          className={styles.joinButton}
          onClick={handleClickJoin}
          title={"join now"}
        />
        <h4 className={"breathe"}>
          {pluralize("other", canvas?.authors.length)} drawing right now
        </h4>
        <img
          onClick={handleClickAppStore}
          className={styles.appstore}
          src={"svg/download-on-appstore.svg"}
        />
      </div>
    );

  return (
    <div>
      <h2>whoops! that canvas doesn't appear to exist</h2>
    </div>
  );
};

export default Canvas;
