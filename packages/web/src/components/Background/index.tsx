import React, { useState, useEffect } from "react";

import random from "lodash/random";
import moment from "moment";

// @ts-ignore
import { v1 as uuid } from "uuid";

import { coordinatesFromIndex, coordinatesToIndex } from "@global";

import styles from "./background.module.scss";
import { useWindowSize, useInterval } from "../../hooks";
import { FillColors } from "../color-wheel";

type Square = {
  time: number;
  fill: string;
  i: number;
  x: number;
  y: number;
};

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

    // clear squares every second
    useInterval(() => {
      setSquares((squares) => {
        const currentTime = moment().unix();
        const filtered = Object.values(squares).filter(
          ({ time }) => currentTime - time < 5
        );

        return filtered;
      });
    }, 1000);

    const dimension = Math.ceil(Math.max(width, height) / CELL_SIZE);

    useEffect(() => {
      const i = coordinatesToIndex(mouseX, mouseY, dimension, CELL_SIZE);
      const { x, y } = coordinatesFromIndex(i, dimension, CELL_SIZE);

      const time = moment().unix();

      if (i !== prevSquare) {
        setSquares((prevSquares) => ({
          ...prevSquares,
          [i]: {
            i: uuid(),
            x,
            y,
            time,
            fill: FillColors[random(FillColors.length - 1)],
          },
        }));
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
