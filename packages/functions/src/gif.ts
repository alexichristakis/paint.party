import * as functions from "firebase-functions";
// import GIFEncoder from "gif-encoder-2";
// import { createCanvas } from "canvas";
// import { writeFile } from "fs";
// import path from "path";

export const compileCanvas = functions.https.onRequest(async (req, res) => {
  const id = req.query.canvas;

  console.log(id);

  return id;
});
