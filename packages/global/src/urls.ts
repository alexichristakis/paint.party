export const appStoreURl =
  "https://apps.apple.com/us/app/paint-party/id1504830265";

const linkingBase = "paintparty://";
const baseURL = "http://paintparty.io";
const cloudFunction = "https://us-central1-canvus-1bcc2.cloudfunctions.net";

export const gifURL = (canvasId: string) =>
  `${cloudFunction}/gif?canvas=${canvasId}`;

export const pngURL = (canvasId: string) =>
  `${cloudFunction}/png?canvas=${canvasId}`;

export const canvasURL = (canvasId: string) => `${baseURL}/canvas/${canvasId}`;

export const localURL = (canvasId: string) =>
  linkingBase + "canvas/" + canvasId;
