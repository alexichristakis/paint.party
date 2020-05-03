import React from "react";
import classNames from "classnames";

import styles from "./styles.module.scss";

export interface ButtonProps {
  title: string;
  className?: string;
  onClick: () => void;
}

const Button: React.FC<ButtonProps> = ({ title, className, onClick }) => {
  return (
    <div className={classNames(styles.button, className)} onClick={onClick}>
      <h3>{title}</h3>
    </div>
  );
};

export default Button;
