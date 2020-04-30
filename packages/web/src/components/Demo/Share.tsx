import React from "react";
import { Element } from "react-scroll";

import styles from "./demo.module.scss";
import Screens from "./screens";

export interface ShareProps {}

const Share: React.FC<ShareProps> = React.memo(({}) => {
  return (
    <Element name="share" className={styles.container}>
      <div className={styles.description}>
        <h3>
          Share your canvases with as many friends as you want! Anyone with the
          unique canvas link can join.
        </h3>
        <br />
        <h3>
          You can watch your co-authors draw in real-time, share colors, and
          curate a gallery of your work.
        </h3>
      </div>
      <Screens src={["/png/create_1.png", "/png/create_2.png"]} />
    </Element>
  );
});

export default Share;
