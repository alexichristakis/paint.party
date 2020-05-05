import React from "react";
import times from "lodash/times";

import { appStoreUrl } from "@global";

import styles from "./color-wheel.module.scss";

export const Colors = {
  transGray: "rgba(0, 0, 0, 0.7)",
  nearBlack: "rgb(10, 10, 10)",
  gray: "rgb(120,120,120)",
  mediumGray: "rgb(210,210,210)",
  lightGray: "rgb(230, 230, 230)",
  lightGreen: "#DEFFD4",
  background: "rgb(242, 242, 242)",
  blue: "#007FFF",
  orange: "#FA6400",
  lightblue: "#64D2FF",
  darkblue: "#007FFF",
  magenta: "#FB00FF",
  green: "#49E020",
  purple: "#5E5CE6",
  yellow: "#FFD60A",
  red: "#E02020",
  grayBlue: "#C6E2FF",
  white: "#FFFFFF",
  pink: "#FF6FA6",
  brown: "#664441",
};

export const FillColors = [
  Colors.red,
  Colors.orange,
  Colors.yellow,
  Colors.green,
  Colors.blue,
  Colors.purple,
  Colors.pink,
  Colors.grayBlue,
  Colors.white,
  Colors.lightGray,
  Colors.gray,
  Colors.brown,
];

export interface ColorWheelProps {
  scroll: number;
}

const ColorWheel: React.FC<ColorWheelProps> = React.memo(({ scroll }) => {
  const handleOnClick = () => window.open(appStoreUrl);

  return (
    <div className={styles.container}>
      <h3 className={styles.download}>GET</h3>
      <div onClick={handleOnClick} className={styles.spin}>
        <div className={styles.wheel}>
          {times(FillColors.length, (i) => (
            <div
              style={{
                backgroundColor: FillColors[i],
                // @ts-ignore
                "--rotate":
                  (i * 360) / (FillColors.length - 1) + scroll / 10 + "deg",
              }}
              className={styles.color}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

export default ColorWheel;
