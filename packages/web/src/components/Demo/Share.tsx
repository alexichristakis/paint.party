import React from "react";
import { Element } from "react-scroll";

import styles from "./demo.scss";

export interface ShareProps {}

const Share: React.FC<ShareProps> = React.memo(({}) => {
  return (
    <Element name="share" className={styles.container}>
      hello
    </Element>
  );
});

export default Share;
