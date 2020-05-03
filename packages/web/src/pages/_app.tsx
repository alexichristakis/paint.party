// @ts-nocheck

import * as React from "react";
import NextApp from "next/app";
import { DefaultSeo } from "next-seo";

import { usePointerPosition } from "../hooks";
import Cursor from "../components/cursor";
import Background from "../components/background";

import "../styles/styles.scss";

class App extends NextApp {
  static async getInitialProps({ Component, ctx }) {
    let pageProps = {};

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }

    return { pageProps };
  }

  render() {
    return <Wrapper {...this.props} />;
  }
}

const Wrapper: React.FC = ({ Component, pageProps }) => {
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
