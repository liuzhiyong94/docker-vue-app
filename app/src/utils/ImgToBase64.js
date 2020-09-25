/**
 * 将 Image URL 转换成 Base64 Data URI
 * @param {String} url - 待转换的 Image URL
 * @returns {Promise} - Promise Object 返回转换结果
 * @example
 *  imgUrlToBase64(url).then(base64Uri => { console.log(base64Uri); })
 */

const imgUrlToBase64 = url => {
  return new Promise((resolve, reject) => {
    let img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = url;

    img.onload = () => {
      let canvas = document.createElement("canvas");
      let ctx = canvas.getContext("2d");
      canvas.height = img.height;
      canvas.width = img.width;
      ctx.drawImage(img, 0, 0);
      const base64Uri = canvas.toDataURL();
      resolve(base64Uri);
    };
    img.onerror = err => {
      reject(err);
    };
  });
};

/**
 * 将 Image File 转换成 Base64 Data URI
 * @param {object} file - 待转换的 Image File Object
 * @returns {Promise}} - Promise Object 返回转换结果
 * @example
 *  imgFileToBase64(file).then(base64Uri => { console.log(base64Uri); })
 */

const imgFileToBase64 = file => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    let base64Uri = "";
    reader.readAsDataURL(file);

    reader.onload = function() {
      base64Uri = reader.result;
    };

    reader.onerror = err => {
      reject(err);
    };

    reader.onloadend = () => {
      resolve(base64Uri);
    };
  });
};

module.exports = { imgUrlToBase64, imgFileToBase64 };
