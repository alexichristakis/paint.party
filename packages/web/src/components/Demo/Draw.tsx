import React from "react";
import { Element } from "react-scroll";

import styles from "./demo.scss";

export interface DrawProps {}

const Draw: React.FC<DrawProps> = React.memo(({}) => {
  return (
    <Element name="draw" className={styles.container}>
      hello
    </Element>
  );
});

export default Draw;
