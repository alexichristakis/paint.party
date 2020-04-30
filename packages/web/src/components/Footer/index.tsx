import React from "react";

import styles from "./footer.module.scss";

const Footer: React.FC = React.memo(() => {
  return (
    <div className={styles.container}>
      <h3 className={styles.intro}>feedback</h3>
      <h3 className={styles.intro}>privacy</h3>
    </div>
  );
});

export default Footer;
