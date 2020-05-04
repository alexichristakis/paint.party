import React from "react";

import styles from "./footer.module.scss";

const Footer: React.FC = React.memo(() => {
  const handleOnClickFeedback = () =>
    window.open(
      "mailto:alexi.christakis@gmail.com?subject=Paint%20Party%20Feedback&body=Hello!"
    );

  const handleOnClickPrivacy = () => window.open("/privacy");

  return (
    <div className={styles.container}>
      <h3 onClick={handleOnClickFeedback} className={styles.intro}>
        feedback
      </h3>
      <h3 onClick={handleOnClickPrivacy} className={styles.intro}>
        privacy
      </h3>
    </div>
  );
});

export default Footer;
