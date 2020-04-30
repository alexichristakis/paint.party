import React from "react";
import { Element } from "react-scroll";

import globalStyles from "../../styles/global.scss";

import styles from "./demo.scss";
import Screens from "./Screens";

export interface DrawProps {}

const Draw: React.FC<DrawProps> = React.memo(({}) => {
  return (
    <Element name="draw" className={styles.container}>
      <Screens src={["/png/create_1.png", "/png/create_2.png"]} />
      <div className={globalStyles.gutter} />
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
    </Element>
  );
});

export default Draw;
