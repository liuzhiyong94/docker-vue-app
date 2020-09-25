const base64Img = require("base64-img");
const path = require("path");
const { v1: uuidv1 } = require("uuid");

const _saveBase64Img = (destPath, data) => {
  return new Promise((resolve, reject) => {
    const filename = uuidv1();
    base64Img.img(data, destPath, filename, (err, filepath) => {
      if (err) {
        reject(err);
      } else {
        resolve(path.basename(filepath));
      }
    });
  });
};
const awaitWrap = (promise) => {
  return promise
    .then(data => [null, data])
    .catch(err => [err, null])
}
function saveBase64Img(destPath, data) {
  return awaitWrap(_saveBase64Img(destPath, data));
}
module.exports = saveBase64Img;
