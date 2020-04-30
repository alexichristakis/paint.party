import React from "react";
import classnames from "classnames";

import styles from "./gallery.module.scss";

export interface GalleryProps {
  backwards?: boolean;
  scroll: number;
}

const Gallery: React.FC<GalleryProps> = React.memo(
  ({ backwards = false, scroll }) => {
    return (
      <div className={styles.container}>
        <div
          className={classnames(styles.scroll, {
            [styles.backwards]: backwards,
          })}
        >
          <img className={styles.canvas} src={"/jpg/canvases/tree.jpg"} />
          <img className={styles.canvas} src={"/jpg/canvases/sea.jpg"} />
          <img className={styles.canvas} src={"/jpg/canvases/rainbow.jpg"} />
          <img className={styles.canvas} src={"/jpg/canvases/tree.jpg"} />
          <img className={styles.canvas} src={"/jpg/canvases/sea.jpg"} />
          <img className={styles.canvas} src={"/jpg/canvases/rainbow.jpg"} />
        </div>
      </div>
    );
  }
);

export default Gallery;
