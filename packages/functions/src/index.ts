import "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

export { default as gif } from "./gif";
export { default as png } from "./png";
