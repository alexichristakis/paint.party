import React from "react";

import styles from "./Landing.scss";

const Landing: React.FC = React.memo(() => {
  return (
    <div className={styles.container}>
      <h1>paint party</h1>
      <h2>collaborative pixel drawing</h2>
    </div>
  );
});

export default Landing;
