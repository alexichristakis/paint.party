import React from "react";

import styles from "./demo.scss";

export interface ScreensProps {
  src: [string, string];
}

const Screens: React.FC<ScreensProps> = ({ src: [image1, image2] }) => {
  return (
    <div className={styles.screens}>
      <img className={styles.screenshot} src={image1} />
      <img className={styles.screenshot} src={image2} />
    </div>
  );
};

export default Screens;
