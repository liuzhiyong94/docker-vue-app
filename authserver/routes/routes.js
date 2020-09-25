(function () {
  var  publicRoute;
  publicRoute = require('../api/app/route');
  module.exports = function (app) {
    app.use('/', publicRoute);
  };

}).call(this);
