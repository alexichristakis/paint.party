import React from "react";
import classnames from "classnames";

import styles from "./gallery.module.scss";
import times from "lodash/times";

export interface GalleryProps {
  backwards?: boolean;
  images: string[];
}

const Gallery: React.FC<GalleryProps> = React.memo(
  ({ backwards = false, images }) => {
    return (
      <div className={styles.container}>
        <div
          className={classnames(styles.scroll, {
            [styles.backwards]: backwards,
          })}
        >
          {times(3, (i) =>
            images.map((src, j) => (
              <img key={`${i}-${j}`} className={styles.canvas} {...{ src }} />
            ))
          )}
        </div>
      </div>
    );
  },
  (p, n) => p.backwards === n.backwards
);

export default Gallery;
