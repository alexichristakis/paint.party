import React from "react";
import classNames from "classnames";

import styles from "./demo.module.scss";
import Screens from "./screens";

export interface DrawProps {}

const Draw: React.FC<DrawProps> = React.memo(({}) => {
  return (
    <div className={classNames(styles.container, styles.reverse)}>
      <Screens src={["/png/draw_1.png", "/png/draw_2.png"]} />
      <div className={"gutter"} />
      <div className={styles.description}>
        <h3>
          Drawing fills in a single pixel. Each canvas can limit how frequently
          authors draw, so it helps to communicate a plan to your fellow
          drawers!
        </h3>
        <br />
        <h3>
          The color wheel stores multiple palettes which are completely
          customizable.
        </h3>
      </div>
    </div>
  );
});

export default Draw;
