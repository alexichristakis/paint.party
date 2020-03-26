import { Dimensions, Platform, StatusBar } from "react-native";

export const CANVAS_DIMENSIONS = 20;

export const DRAW_INTERVAL = 1;

export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get(
  "window"
);

export const IOS_VERSION = parseInt(String(Platform.Version), 10);

/* PROFILE GRID */
const X_WIDTH = 375;
const X_HEIGHT = 812;

const XSMAX_WIDTH = 414;
const XSMAX_HEIGHT = 896;

export const isIPhoneX =
  (SCREEN_WIDTH === X_WIDTH && SCREEN_HEIGHT === X_HEIGHT) ||
  (SCREEN_WIDTH === XSMAX_WIDTH && SCREEN_HEIGHT === XSMAX_HEIGHT);

export const SB_HEIGHT = Platform.select({
  ios: isIPhoneX ? 44 : 20,
  android: StatusBar.currentHeight,
  default: 0
});

export const MODAL_TOP_PADDING = Platform.select({
  ios: IOS_VERSION > 12 ? 12 : SB_HEIGHT + 5,
  android: 10,
  default: SB_HEIGHT
});

export const CELL_SIZE = SCREEN_WIDTH / CANVAS_DIMENSIONS;
