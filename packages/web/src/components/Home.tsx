import React from "react";

import styles from "./Home.module.scss";

import { usePointerPosition, useScrollPosition } from "../hooks";

import ColorWheel from "./color-wheel";
import Cursor from "./cursor";
import Background from "./background";
import Footer from "./footer";
import Landing from "./landing";
import Gallery from "./gallery";
import SideBar from "./sidebar";
import { Create, Draw, Share } from "./demo";

export const Home: React.FC = () => {
  const scroll = useScrollPosition();
  const { position, handler } = usePointerPosition();

  return (
    <>
      <Background {...position} />
      <div className={styles.container} {...handler}>
        <SideBar />

        <div className={styles.content}>
          <Landing />
          <Gallery scroll={scroll} />
          <Create />
          <Gallery backwards scroll={scroll} />
          <Draw />
          <Gallery scroll={scroll} />
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
