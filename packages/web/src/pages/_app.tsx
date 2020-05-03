// @ts-nocheck
import React from "react";
import { DefaultSeo } from "next-seo";

import { usePointerPosition } from "../hooks";
import Cursor from "../components/cursor";
import Background from "../components/background";

import "../styles/styles.scss";

const App: React.FC = ({ Component, pageProps }) => {
  const { position, handler } = usePointerPosition();

  return (
    <>
      <Background {...position} />
      <div {...handler}>
        <DefaultSeo titleTemplate="%s" />
        <Component {...pageProps} />
        <Cursor {...position} />
      </div>
    </>
  );
};

export default App;
