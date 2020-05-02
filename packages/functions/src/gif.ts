import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import flatten from "lodash/flatten";

// @ts-ignore
import GIFEncoder from "gif-encoder-2";
import { createCanvas } from "canvas";
import { writeFile } from "fs";
import path from "path";

import { coordinatesFromIndex } from "./util";

export type CellUpdate = {
  id: string;
  time: number;
  author: string;
  color: string;
};

const RESOLUTION = 5;

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
  //   const  } = canvas;
  //   console.log(cells);

  const GIF_SIZE = size * RESOLUTION;
  const CELL_SIZE = RESOLUTION;

  const frame = createCanvas(GIF_SIZE, GIF_SIZE);
  const encoder = new GIFEncoder(GIF_SIZE, GIF_SIZE, "octree");

  const ctx = frame.getContext("2d");
  encoder.setDelay(250);
  encoder.start();

  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, GIF_SIZE, GIF_SIZE);

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
    const { x, y } = coordinatesFromIndex(cell, size, CELL_SIZE);

    ctx.fillStyle = color;
    ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);

    encoder.addFrame(ctx);
  });

  encoder.finish();

  const buffer = encoder.out.getData();

  writeFile(path.join(__dirname, "../output", "test.gif"), buffer, (error) => {
    // gif drawn or error
    console.log(error);
  });

  //   console.log(id);

  res.contentType("image/gif");
  res.end(buffer, "binary");
});
