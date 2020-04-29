import React from "react";
import { Link } from "react-scroll";

import styles from "./sideBar.scss";

export interface SectionLinkProps {
  to: string;
  title: string;
}

const SectionLink: React.FC<SectionLinkProps> = ({ to, title }) => (
  <Link
    spy
    smooth
    to={to}
    className={styles.section}
    activeClass={styles.active}
    duration={500}
  >
    <h3>{title}</h3>
  </Link>
);

const SideBar = () => (
  <div className={styles.container}>
    <SectionLink to="create" title="create" />
    <SectionLink to="draw" title="draw" />
    <SectionLink to="share" title="share" />
  </div>
);

export default SideBar;
