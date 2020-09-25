var express = require('express');
var settings = require('../../settings.js');
var router = express.Router();
var errors = require('../libs/errors');
module.exports = (function() {
    // 该路由使用的中间件
	var api=require('./api.js');
    router.use('/typedocr',function timeLog(req, res) {
     // console.log('req:',req);
		api.typedocr(req,res);
    });
    return router;

}).call(this);
