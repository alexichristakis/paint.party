import React from "react";

import styles from "./demo.module.scss";

export interface ScreensProps {
  src: [string, string];
}

const Screens: React.FC<ScreensProps> = ({ src: [image1, image2] }) => {
  return (
    <div className={styles.screens}>
      <img className={styles.screenshot} src={image1} />
      <div className={"gutter"} />
      <img className={styles.screenshot} src={image2} />
    </div>
  );
};

export default Screens;
