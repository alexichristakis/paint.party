import React from "react";
import { Canvas } from "@redux/modules";
import { View } from "react-native";
import Row, { RowProps } from "./Row";

export interface GalleryProps {
  canvases: Canvas[];
}

const generateRows = (canvases: Canvas[]) => {
  const rows: RowProps[] = [];
  for (let i = 0; i < canvases.length; ) {
    const remaining = canvases.length - i;

    if (remaining >= 3) {
      rows.push({ canvases: canvases.slice(i, i + 3) });
      i += 3;
    } else {
      rows.push({ canvases: canvases.slice(i) });
      i += remaining;
    }
  }

  return rows;
};

const Gallery: React.FC<GalleryProps> = ({ canvases }) => {
  const rows = generateRows(canvases);

  return (
    <>
      {rows.map((row, i) => (
        <Row key={i} {...row} />
      ))}
    </>
  );
};

export default Gallery;
