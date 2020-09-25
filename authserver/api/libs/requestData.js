const request = require('request');
function _requestData(option) {
  return new Promise((resolve, reject) => {
    request.post(option, function (error, response, body) {
      // console.log('error:',error);
      // console.log('body:',body);
      // console.log('response.statusCode:',response.statusCode);
      if (!error && response.statusCode == 200) {
        resolve(body)   // 返回response的内容
      } else {
        reject(error);   // 返回错误信息
      }
    })
  })
}
const awaitWrap = (promise) => {
  return promise
    .then(data => [null, data])
    .catch(err => [err, null])
}
function requestData(option) {
  return awaitWrap(_requestData(option));
}
module.exports = requestData;