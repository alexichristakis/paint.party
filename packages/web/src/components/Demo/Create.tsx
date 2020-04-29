import React from "react";
import { Element } from "react-scroll";

import styles from "./demo.scss";

import Screens from "./Screens";

export interface CreateProps {}

const Create: React.FC<CreateProps> = React.memo(({}) => {
  return (
    <Element name="create" className={styles.container}>
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
      <Screens src={["/png/create_1.png", "/png/create_2.png"]} />
    </Element>
  );
});

export default Create;
