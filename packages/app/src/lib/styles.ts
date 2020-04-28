import { StyleSheet, TextStyle } from "react-native";

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
  brown: "#664441"
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
  Colors.brown
];

export const Palette1 = [
  "#2D1908",
  "#E02020",
  "#FA6400",
  "#FFD60A",
  "#49E020",
  "#255517",
  "#007FFF",
  "#2F2DDE",
  "#FF5495",
  "#7C217D",
  "#000000",
  "#FFFFFF"
];

export const Palette2 = [
  "#7E5431",
  "#E56464",
  "#F68D47",
  "#FAE26D",
  "#AEF29B",
  "#83C871",
  "#FFFFFF",
  "#D6EAFF",
  "#6E95BD",
  "#5B5AAA",
  "#FF6AA3",
  "#EC6CED"
];

// export const Palette1 = [
//   Colors.red,
//   Colors.orange,
//   Colors.yellow,
//   Colors.green,
//   Colors.blue,
//   Colors.purple,
//   Colors.pink,
//   Colors.grayBlue,
//   Colors.white,
//   Colors.lightGray,
//   Colors.gray,
//   Colors.brown
// ];

// export const Palette2 = [
//   Colors.red,
//   Colors.orange,
//   Colors.yellow,
//   Colors.green,
//   Colors.blue,
//   Colors.purple,
//   Colors.pink,
//   Colors.grayBlue,
//   Colors.white,
//   Colors.lightGray,
//   Colors.gray,
//   Colors.brown
// ];

const baseText: TextStyle = {
  fontFamily: "Sofia Pro"
};

export enum TextSizes {
  small = "small",
  medium = "medium",
  large = "large",
  title = "title",
  light = "light",
  bold = "bold"
}
export const TextStyles: { [key in TextSizes]: TextStyle } = StyleSheet.create({
  light: {
    color: Colors.lightGray
  },
  small: {
    ...baseText,
    fontSize: 12,
    color: Colors.nearBlack
  },
  medium: {
    ...baseText,
    fontSize: 16,

    color: Colors.nearBlack
  },
  large: {
    ...baseText,
    fontSize: 20,
    color: Colors.nearBlack
  },
  title: {
    ...baseText,
    fontSize: 36,
    color: Colors.nearBlack
  },
  bold: {
    fontWeight: "bold"
  }
});
