import React from "react";

import styles from "./Home.module.scss";

import { usePointerPosition, useScrollPosition, useWindowSize } from "../hooks";

import ColorWheel from "./color-wheel";
import Cursor from "./cursor";
import Background from "./background";
import Footer from "./footer";
import Landing from "./landing";
import SideBar from "./sidebar";
import { Create, Draw, Share } from "./demo";

export const Home: React.FC = () => {
  const { width = 0, height = 0, isMobile } = useWindowSize();
  const scroll = useScrollPosition();
  const { position, handler } = usePointerPosition();

  return (
    <>
      <Background {...position} {...{ width, height }} />
      <div className={styles.container} {...handler}>
        <SideBar {...{ isMobile }} />

        <div className={styles.content}>
          <Landing />
          <Create />
          <Draw />
          <Share />
          <Footer />
        </div>

        <ColorWheel scroll={scroll} />
        <Cursor {...position} />
      </div>
    </>
  );
};

export default Home;
