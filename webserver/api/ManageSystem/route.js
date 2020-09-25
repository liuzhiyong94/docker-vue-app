var express = require('express');
var settings = require('../../settings.js');
var router = express.Router();
var errors = require('../libs/errors');
const log4js = require('../libs/log4').log4js();
// var jwt = require("jsonwebtoken");
var crypto = require('crypto');
function checkToken(userid, token) {
    if (settings.tokenObj[userid].token == token) return true;
    return false;
}
module.exports = (function () {
    router.all('/:ifName',
        function (req, res) {
            var ifName = req.params.ifName;
            if (!ifName) res.send(404);
            function callback(_code, _err, _result) {
                res.send({ code: _code, msg: _err, data: _result });
            }
            var errors = require('../libs/errors.js');
            var api = require('./ManageSystemApi.js').GetApi(req, res, callback);
            try {
                if (api[ifName]) {
                    if (ifName == 'Login' || ifName == 'GetResult' || ifName == 'pushocrtest' || ifName == 'AppletLogin' || ifName == 'AppletQuery' || ifName == 'test') {
                        return api[ifName]();
                    }
                    try {
                        var auth = req.get("Authorization");
                        var token = getToken(auth);
                        token = crypto.createHash('md5').update(token).digest("hex");
                        if (!checkToken(req.get("userid"), token)) {
                            return res.send({ code: 4042, msg: "Token认证失败", data: "证书有误" });
                        }
                        api[ifName]();
                    } catch (error) {
                        res.send({ code: "300", msg: 'Token认证失败', data: "" });
                    }
                    // if (ifName == 'Login') {
                    //     api[ifName]();
                    // }
                    // else {
                    //     var auth = req.get("Authorization");
                    //     var token = getToken(auth);
                    //     if (!token) {
                    //         return res.send({ code: 4042, msg: "Token认证失败", data: "证书有误" });
                    //     }
                    //     jwt.verify(token, "WHHCXW2020", function (err, decoded) {
                    //         if (err) {
                    //             return res.send({ code: 4042, msg: "Token认证失败", data: "Token有误或Token失效" });
                    //         }
                    //         else {
                    //             if (new Date().getTime() > decoded.exp * 1000) {
                    //                 return res.send({ code: 4042, msg: "Token认证失败", data: "Token失效" });
                    //             }
                    //             api[ifName](decoded);
                    //         }
                    //     });
                    // }

                } else {
                    res.send({ code: 50001, msg: errors[50001].message, data: "" });
                }
            } catch (_err) {
                console.log(_err);
                res.send({ code: "300", msg: _err, data: "" });
            }
        }
    );

    return router;

}).call(this);

function getToken(auth) {
    if (!auth) return false;

    if (auth.length < 9) return false;

    var arr = auth.split(" ");
    if (arr[0] == "Bearer") {
        return arr[1];
    } else {
        return false;
    }
}