import React from "react";

import styles from "./landing.module.scss";

const Landing: React.FC = React.memo(() => {
  return (
    <div className={styles.container}>
      <h1 className={styles.intro}>paint party</h1>
      <h2 className={styles.intro}>collaborative pixel drawing</h2>
    </div>
  );
});

export default Landing;
