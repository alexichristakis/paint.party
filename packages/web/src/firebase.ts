import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import "firebase/storage";

// Initialize Firebase
const config = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "canvus-1bcc2.firebaseapp.com",
  databaseURL: "https://canvus-1bcc2.firebaseio.com",
  projectId: "canvus-1bcc2",
  storageBucket: "canvus-1bcc2.appspot.com",
  messagingSenderId: "1051652325215",
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

try {
  firebase.initializeApp(config);
} catch (err) {
  // we skip the "already exists" message which is
  // not an actual error when we're hot-reloading
  if (!/already exists/.test(err.message)) {
    console.error("Firebase initialization error", err.stack);
  }
}

const instance = firebase.app();
// const instance = firebase.initializeApp(config);
export default instance;

export const getCanvas = (id: string) =>
  instance.firestore().collection("canvases").doc(id).get();
