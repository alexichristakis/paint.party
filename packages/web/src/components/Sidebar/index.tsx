import React from "react";
import { Link } from "react-scroll";

import styles from "./sidebar.module.scss";

export interface SideBarProps {
  isMobile: boolean;
}

export interface SectionLinkProps {
  to: string;
  title: string;
}

const SectionLink: React.FC<SectionLinkProps> = React.memo(({ to, title }) => (
  <Link
    spy
    smooth
    to={to}
    className={styles.section}
    activeClass={styles.active}
    duration={500}
  >
    <h2>{title}</h2>
  </Link>
));

const SideBar: React.FC<SideBarProps> = React.memo(({ isMobile }) => {
  return (
    <div className={styles.container}>
      <SectionLink to="create" title="create" />
      <SectionLink to="draw" title="draw" />
      <SectionLink to="share" title="share" />
    </div>
  );
});

export default SideBar;
