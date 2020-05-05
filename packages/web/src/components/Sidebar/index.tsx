import React from "react";
import classNames from "classnames";

import styles from "./sidebar.module.scss";

export interface SectionProps {
  active: boolean;
  title: string;
}

const Section: React.FC<SectionProps> = ({ active, title }) => (
  <div className={classNames(styles.section, { [styles.active]: active })}>
    <h2>{title}</h2>
  </div>
);

export interface SideBarProps {
  active: string;
}

const SideBar: React.FC<SideBarProps> = ({ active }) => (
  <div className={styles.container}>
    <Section active={active === "Create"} title="create" />
    <Section active={active === "Draw"} title="draw" />
    <Section active={active === "Share"} title="share" />
  </div>
);

export default SideBar;
