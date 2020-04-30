import React from "react";
import { Element } from "react-scroll";

import styles from "./demo.module.scss";
import Screens from "./screens";
import Gallery from "../gallery";

export interface CreateProps {}

const images = [
  "/jpg/canvases/sea.jpg",
  "/jpg/canvases/rainbow.jpg",
  "/jpg/canvases/tree.jpg",
];

const Create: React.FC<CreateProps> = React.memo(({}) => {
  return (
    <Element name="create">
      <Gallery images={images} />
      <div className={styles.container}>
        <div className={styles.description}>
          <h3>
            With paint party, you can draw pixel art with your friends in real
            time.
          </h3>
          <br />
          <h3>
            Every canvas offers a unique experience with customizeable size,
            background color, duration, and draw interval.
          </h3>
        </div>
        <div className={"gutter"} />
        <Screens src={["/png/create_1.png", "/png/create_2.png"]} />
      </div>
    </Element>
  );
});

export default Create;
