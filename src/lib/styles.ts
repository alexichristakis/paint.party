import { StyleSheet, TextStyle } from "react-native";

export const Colors = {
  transGray: "rgba(0, 0, 0, 0.7)",
  nearBlack: "rgb(10, 10, 10)",
  gray: "rgb(120,120,120)",
  mediumGray: "rgb(210,210,210)",
  lightGray: "rgb(230, 230, 230)",
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

export const OuterWheel = [
  Colors.red,
  Colors.orange,
  Colors.yellow,
  Colors.green,
  Colors.blue,
  Colors.purple,
  Colors.pink,
  Colors.grayBlue,
  Colors.grayBlue,
  Colors.yellow,
  Colors.white,
  Colors.lightGray,
  Colors.gray,
  Colors.brown
];

export const InnerWheel = [
  Colors.red,
  Colors.orange,
  Colors.yellow,
  Colors.green,
  Colors.blue,
  Colors.purple,
  Colors.pink,
  Colors.grayBlue,
  Colors.brown
];

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
