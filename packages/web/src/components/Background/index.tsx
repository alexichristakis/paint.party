import React, { useState, useEffect } from "react";

import random from "lodash/random";
import moment from "moment";

import styles from "./Background.scss";
import { useWindowSize } from "../../hooks";
import { FillColors } from "../ColorWheel";

type Square = {
  active: boolean;
  time: number;
  fill: string;
  i: number;
  x: number;
  y: number;
};

const TAIL = 3;
const CELL_SIZE = 30;

export interface BackgroundProps {
  x: number;
  y: number;
}

const Background: React.FC<BackgroundProps> = React.memo(
  ({ x: mouseX, y: mouseY }) => {
    const { width = 0, height = 0 } = useWindowSize();
    const [prevSquare, setPrevSquare] = useState(-1);
    const [squares, setSquares] = useState<{ [id: number]: Square }>({});

    const dimension = Math.ceil(Math.max(width, height) / CELL_SIZE);

    const coordinatesToIndex = (x: number, y: number) =>
      Math.floor(y / CELL_SIZE) * dimension + Math.floor(x / CELL_SIZE);

    const indicesFromIndex = (index: number) => {
      const i = Math.floor(index % dimension);
      const j = Math.floor(index / dimension);

      return { i, j };
    };

    const coordinatesFromIndex = (index: number) => {
      const { i, j } = indicesFromIndex(index);

      return { x: i * CELL_SIZE, y: j * CELL_SIZE };
    };

    useEffect(() => {
      const i = coordinatesToIndex(mouseX, mouseY);
      const { x, y } = coordinatesFromIndex(i);

      const currentTime = moment().unix();

      if (i !== prevSquare) {
        //   const filteredSquares = Object.values(squares).filter(
        //     ({ time }) => currentTime - time < 5
        //   );

        setSquares({
          ...squares,
          [i]: {
            i,
            x,
            y,
            time: currentTime,
            active: true,
            fill: FillColors[random(FillColors.length - 1)],
          },
        });
        setPrevSquare(i);
      }
    }, [dimension, mouseX, mouseY]);

    return (
      <div className={styles.container}>
        <svg className={styles.svg}>
          {Object.values(squares).map(({ i, ...square }) => (
            <rect
              className={styles.square}
              key={i}
              {...square}
              width={CELL_SIZE}
              height={CELL_SIZE}
            />
          ))}
        </svg>
      </div>
    );
  }
);

export default Background;
