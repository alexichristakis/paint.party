import { Dimensions, Platform, StatusBar, PixelRatio } from "react-native";

export const URL_PREFIX = "paintparty://";

export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get(
  "window"
);

export const IOS_VERSION = parseInt(String(Platform.Version), 10);

export const CANVAS_DIMENSIONS = 20;

export const COLOR_WHEEL_RADIUS = 180;
export const COLOR_SIZE = 60;
export const COLOR_BORDER_WIDTH = 3;
export const COLOR_MARGIN = 5;

export const EDITOR_SIZE = SCREEN_WIDTH - 50;
export const INDICATOR_SIZE = 20;
export const EDITOR_LEFT = (SCREEN_WIDTH - EDITOR_SIZE) / 2;
export const EDITOR_TOP = (SCREEN_HEIGHT - EDITOR_SIZE) / 2;
export const INDICATOR_MIN = INDICATOR_SIZE / 2;
export const INDICATOR_MAX = EDITOR_SIZE - INDICATOR_SIZE + 5;

export const POPUP_SIZE = COLOR_SIZE / 1.5;
export const POPUP_BORDER_RADIUS = POPUP_SIZE / 2;

export const CANVAS_ROW_PREVIEW_SIZE = 80;
export const CANVAS_PREVIEW_MARGIN = 5;
export const CANVAS_PREVIEW_SIZE =
  (SCREEN_WIDTH - 2 * CANVAS_PREVIEW_MARGIN) / 3 - CANVAS_PREVIEW_MARGIN / 2;
export const CAROUSEL_SIZE = SCREEN_WIDTH - 20;
export const CAROUSEL_TOP = (SCREEN_HEIGHT - CAROUSEL_SIZE) / 2;

// export const CANVAS_PREVIEW_SIZE = 100;
// export const CANVAS_GALLERY_SIZE = (SCREEN_WIDTH - 10) / 3 - 2.5;

export const DRAW_INTERVAL = 0.2;

export const SPRING_CONFIG = {
  damping: 40,
  mass: 1,
  stiffness: 300,
  overshootClamping: false,
  restSpeedThreshold: 0.1,
  restDisplacementThreshold: 0.1,
};

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
  default: 0,
});

export const MODAL_TOP_PADDING = Platform.select({
  ios: IOS_VERSION > 12 ? 12 : SB_HEIGHT + 5,
  android: 10,
  default: SB_HEIGHT,
});

export const CELL_SIZE = PixelRatio.roundToNearestPixel(
  SCREEN_WIDTH / CANVAS_DIMENSIONS
);

export const CANVAS_SIZE = CELL_SIZE * CANVAS_DIMENSIONS;
