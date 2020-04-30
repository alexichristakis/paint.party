import React from "react";
import { Element } from "react-scroll";

import styles from "./demo.module.scss";
import Screens from "./screens";
import Gallery from "../gallery";

export interface DrawProps {}

const images2 = [
  "/jpg/canvases/sea.jpg",
  "/jpg/canvases/otter.jpg",
  "/jpg/canvases/cousins.jpg",
];

const Draw: React.FC<DrawProps> = React.memo(({}) => {
  return (
    <Element name="draw">
      <Gallery backwards images={images2} />
      <div className={styles.container}>
        <Screens src={["/png/draw_1.png", "/png/draw_2.png"]} />
        <div className={"gutter"} />
        <div className={styles.description}>
          <h3>
            Drawing fills in a single pixel. Each canvas can limit how
            frequently authors draw, so it helps to communicate a plan to your
            fellow drawers!
          </h3>
          <br />
          <h3>
            The color wheel stores multiple palettes which are completely
            customizable.
          </h3>
        </div>
      </div>
    </Element>
  );
});

export default Draw;
