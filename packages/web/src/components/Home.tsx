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

const images = [
  "/jpg/canvases/sea.jpg",
  "/jpg/canvases/rainbow.jpg",
  "/jpg/canvases/tree.jpg",
];

const images2 = [
  "/jpg/canvases/sea.jpg",
  "/jpg/canvases/otter.jpg",
  "/jpg/canvases/cousins.jpg",
];

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
          <Gallery images={images} />
          <Create />
          <Gallery backwards images={images2} />
          <Draw />
          <Gallery images={images} />
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
