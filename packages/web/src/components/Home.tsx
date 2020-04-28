import React from "react";

import styles from "./Home.scss";

import { useMousePosition, useScrollPosition } from "../hooks";

import ColorWheel from "./ColorWheel";
import Cursor from "./Cursor";
import Background from "./Background";
import Landing from "./Landing";
import Gallery from "./Gallery";

export const Home: React.FC = () => {
  const scroll = useScrollPosition();
  const { position, handleMouseMove } = useMousePosition();

  return (
    <div className={styles.container} onMouseMove={handleMouseMove}>
      <Background {...position} />

      <div className={styles.content}>
        <Landing />
        <Gallery />
      </div>
      <ColorWheel scroll={scroll} />
      <Cursor {...position} />
    </div>
  );
};

export default Home;
