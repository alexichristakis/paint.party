import React from "react";
import classNames from "classnames";

import styles from "./demo.module.scss";

export interface ScreensProps {
  className: string;
  src: [string, string];
}

const Screens: React.FC<ScreensProps> = ({
  className,
  src: [image1, image2],
}) => {
  return (
    <div className={classNames(styles.screens, className)}>
      <img className={classNames(styles.screenshot, className)} src={image1} />
      <img className={classNames(styles.screenshot, className)} src={image2} />
    </div>
  );
};

export default Screens;
