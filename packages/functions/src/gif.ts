import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import flatten from "lodash/flatten";

// @ts-ignore
import GIFEncoder from "gif-encoder-2";
import { createCanvas } from "canvas";

import { coordinatesFromIndex } from "./util";

export type CellUpdate = {
  id: string;
  time: number;
  author: string;
  color: string;
};

const RESOLUTION = 6;

export const compileCanvas = functions.https.onRequest(async (req, res) => {
  const id = req.query.canvas.toString();

  const canvasRef = admin.database().ref(id);
  const canvasMetadataRef = admin.firestore().collection("canvases").doc(id);

  let [cellsSnap, canvasSnap] = await Promise.all([
    canvasRef.once("value"),
    canvasMetadataRef.get(),
  ]);

  if (!cellsSnap.val() || !canvasSnap.data()) {
    res.status(404).send("invalid canvas id");
  }

  const cells = cellsSnap.val();
  const canvas = canvasSnap.data();

  const { size = 20, backgroundColor = "#FFFFFF" } = canvas as any;

  const gifSize = size * RESOLUTION;

  const frame = createCanvas(gifSize, gifSize);
  const encoder = new GIFEncoder(gifSize, gifSize, "octree");

  const ctx = frame.getContext("2d");
  encoder.setDelay(250);
  encoder.start();

  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, gifSize, gifSize);

  encoder.addFrame(ctx);

  // iterate through board updates
  const updates = flatten(
    Object.keys(cells)
      .filter((id) => id !== "live")
      .map((index) => {
        const cell = cells[index];

        return Object.values<CellUpdate>(cell).map(({ time, color }) => ({
          time,
          color,
          cell: +index,
        }));
      })
  ).sort((a, b) => a.time - b.time);

  updates.forEach(({ color, cell }) => {
    const { x, y } = coordinatesFromIndex(cell, size, RESOLUTION);

    ctx.fillStyle = color;
    ctx.fillRect(x, y, RESOLUTION, RESOLUTION);

    encoder.addFrame(ctx);
  });

  encoder.finish();

  const buffer = encoder.out.getData();

  res.contentType("image/gif");
  res.end(buffer, "binary");
});
