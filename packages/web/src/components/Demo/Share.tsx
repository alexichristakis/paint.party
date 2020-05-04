import React from "react";

import styles from "./demo.module.scss";
import Screens from "./screens";

export interface ShareProps {}

const Share: React.FC<ShareProps> = React.memo(({}) => {
  return (
    <div className={styles.container}>
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
      <Screens src={["/png/share_1.png", "/png/share_2.png"]} />
    </div>
  );
});

export default Share;
