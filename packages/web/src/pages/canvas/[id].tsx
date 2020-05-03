// @ts-nocheck

import * as React from "react";

import Canvas from "../../components/Canvas";

const CanvasPage = ({ id }) => <Canvas {...{ id }} />;

CanvasPage.getInitialProps = async ({ query }) => {
  return { id: query.id };
};

export default CanvasPage;
