import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// returns PNG image from cloud storage instance
export default functions.https.onRequest(async (req, res) => {
  const id = req.query.canvas.toString();

  const [buffer] = await admin.storage().bucket().file(id).download();

  res.contentType("image/png");
  res.end(buffer, "binary");
});
