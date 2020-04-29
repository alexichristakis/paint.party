import React from "react";

import styles from "./Home.scss";

import { usePointerPosition, useScrollPosition } from "../hooks";

import ColorWheel from "./ColorWheel";
import Cursor from "./Cursor";
import Background from "./Background";
import Landing from "./Landing";
import Gallery from "./Gallery";
import SideBar from "./Sidebar";
import { Create, Draw, Share } from "./Demo";

export const Home: React.FC = () => {
  const scroll = useScrollPosition();
  const { position, handler } = usePointerPosition();

  return (
    <div className={styles.container} {...handler}>
      <Background {...position} />
      <SideBar />

      <div className={styles.content}>
        <Landing />
        <Gallery scroll={scroll} />
        <Create />
        <Draw />
        <Share />
      </div>

      <ColorWheel scroll={scroll} />
      <Cursor {...position} />
    </div>
  );
};

export default Home;
