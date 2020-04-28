// @ts-nocheck

import * as React from "react";
import NextApp from "next/app";
import { DefaultSeo } from "next-seo";

import "../styles/global.scss";

class App extends NextApp {
  static async getInitialProps({ Component, ctx }) {
    let pageProps = {};

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }

    return { pageProps };
  }

  render() {
    const { Component, pageProps } = this.props;

    return (
      <>
        <DefaultSeo titleTemplate="%s" />
        <Component {...pageProps} />
      </>
    );
  }
}

export default App;
