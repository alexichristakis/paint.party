import React, { useMemo } from "react";

import styles from "./Home.module.scss";

import { useScrollPosition } from "../hooks";

import ColorWheel from "./color-wheel";
import Footer from "./footer";
import Landing from "./landing";
import Gallery from "./gallery";
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

export const Home: React.FC = React.memo(() => {
  // const [activeSection, setActiveSection] = useState("");
  const scroll = useScrollPosition();

  const content = useMemo(
    () => (
      <div className={styles.content}>
        <Landing />
        <Gallery images={images} />
        <Create />
        <Gallery backwards images={images2} />
        <Draw />
        <Gallery images={images} />
        <Share />
      </div>
    ),
    []
  );

  return (
    <div className={styles.container}>
      {/* <SideBar active={activeSection} /> */}

      {content}

      <Footer />
      <ColorWheel scroll={scroll} />
    </div>
  );
});

export default Home;
