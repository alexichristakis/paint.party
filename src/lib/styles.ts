import { StyleSheet, TextStyle } from "react-native";

export const Colors = {
  nearBlack: "rgb(10, 10, 10)",
  gray: "rgb(120,120,120)",
  lightGray: "rgb(230, 230, 230)",
  background: "rgb(242, 242, 242)",
  purple: "#4904FF",
  pink: "#D31EB6",
  red: "rgb(255, 0, 0)",
  yellow: "#FFD60A",
  orange: "orange",
  green: "#96D863",
  blue: "#597EDB"
};

const baseText: TextStyle = {};

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
    fontSize: 26,
    color: Colors.nearBlack
  },
  bold: {
    fontWeight: "bold"
  }
});
