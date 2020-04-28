import React from "react";

import styles from "./gallery.scss";

const Gallery: React.FC = React.memo(() => {
  return (
    <div className={styles.container}>
      <img className={styles.canvas} src={"/jpg/canvases/tree.jpg"} />
      <img className={styles.canvas} src={"/jpg/canvases/sea.jpg"} />
      <img className={styles.canvas} src={"/jpg/canvases/rainbow.jpg"} />
    </div>
  );
});

export default Gallery;
