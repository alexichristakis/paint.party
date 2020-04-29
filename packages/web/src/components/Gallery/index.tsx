import React from "react";

import styles from "./gallery.scss";

export interface GalleryProps {
  scroll: number;
}

const Gallery: React.FC<GalleryProps> = React.memo(({ scroll }) => {
  return (
    <div className={styles.container}>
      <div className={styles.scroll}>
        <img className={styles.canvas} src={"/jpg/canvases/tree.jpg"} />
        <img className={styles.canvas} src={"/jpg/canvases/sea.jpg"} />
        <img className={styles.canvas} src={"/jpg/canvases/rainbow.jpg"} />
      </div>
    </div>
  );
});

export default Gallery;
