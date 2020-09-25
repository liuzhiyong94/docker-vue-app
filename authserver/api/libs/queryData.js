const db = require('./mysql');
function _queryData(sql,params) {
    console.log('_queryData:',sql);
    return new Promise((resolve, reject) => {
      db.query(sql,params, function(err,result) {
          console.log('queryData:',err,result);
        if (result) {
          resolve(result)
        } else {
          reject(err)
        }
      })
    })
  }
  const awaitWrap = (promise) => {
    return promise
      .then(data => [null, data])
      .catch(err => [err, null])
  }
  function queryData(sql,params) {
    return awaitWrap(_queryData(sql,params));
  }
module.exports=queryData;