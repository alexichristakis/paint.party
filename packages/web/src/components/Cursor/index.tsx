import React, { useState } from "react";
import classnames from "classnames";

import styles from "./cursor.scss";

export interface CursorProps {
  x: number;
  y: number;
}

const Cursor: React.FC<CursorProps> = React.memo(({ x, y }) => {
  return (
    <div className={styles.container}>
      <div className={styles.cursor} style={{ top: y, left: x }} />
    </div>
  );
});

export default Cursor;
