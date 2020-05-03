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

export interface CanvasProps {
  id?: string;
}

const Canvas: React.FC<CanvasProps> = React.memo((props) => {
  const route = useRouter();

  let id = "";
  if (validCanvasId(route.query.id)) {
    id = route.query.id as string;
  }

  const [canvasExists, setCanvasExists] = useState(true);
  const [canvas, setCanvas] = useState<CanvasType | null>(null);

  useEffect(() => {
    if (!id) return;
    getCanvas(id)
      .then((val) => {
        if (val.exists) {
          const data = val.data();

          if (data) {
            setCanvas(data as CanvasType);
          }
        } else {
          setCanvasExists(false);
        }
      })
      .catch((err) => {
        setCanvasExists(false);
      });
  }, [id]);

  const handleClickJoin = () => window.open(localURL(id));

  const handleClickAppStore = () => window.open(appStoreUrl);

  if (canvasExists)
    return (
      <div className={styles.container}>
        <h2 className={styles.header}>{canvas?.name ?? "loading..."}</h2>
        {id.length ? (
          <img className={styles.gif} src={gifURL(id)} />
        ) : (
          <div className={styles.gif} />
        )}
        <Button
          className={styles.joinButton}
          onClick={handleClickJoin}
          title="join now"
        />
        <h4 className="breathe">
          {pluralize("other", canvas?.authors.length)} drawing right now
        </h4>
        <img
          onClick={handleClickAppStore}
          className={styles.appstore}
          src="/svg/download_on_appstore.svg"
        />
      </div>
    );

  return (
    <div className={styles.container}>
      <h2>whoops! that canvas doesn't appear to exist</h2>
    </div>
  );
});

export default Canvas;
