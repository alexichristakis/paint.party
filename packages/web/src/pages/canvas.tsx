import * as React from "react";
import { NextPage, NextPageContext } from "next";

import Canvas from "../components/Canvas";

const CanvasPage: React.FC<{}> & NextPage<{}> = ({}) => <Canvas />;

CanvasPage.getInitialProps = async (_ctx: NextPageContext) => ({});

export default CanvasPage;
