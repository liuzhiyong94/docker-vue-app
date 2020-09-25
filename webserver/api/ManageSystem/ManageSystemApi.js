var EventProxy = require('eventproxy')
var settings = require('../../settings.js')
var hcUti = require('../libs/hcUti')
var File = require('../libs/File')
var fs = require('fs')
var path = require('path')
var request = require('request')
const saveBase64Img = require("../libs/save-base64img");
const Jwt = require('jsonwebtoken')
var crypto = require('crypto');
const mineType = require('mime-types');
const log4js = require('../libs/log4').log4js();
var db = require('../libs/mysql.js');
var XLSXWriter = require('xlsx-writestream');
function syncTokens(cb) {
    var sql = "select id,username,realname,role,token from users where status=1 and deletestatus=0;";
    db.query(sql, [], function (err, result) {
        // console.log('err:',err);
        // console.log('err:',result);
        for (var i = 0; i < result.length; i++) {
            settings.tokenObj[result[i].id] = result[i];
        }
        cb(null, true);
    })
}
exports.syncTokens = syncTokens;
exports.GetApi = function (_req, _res, _callback) {
    return {
        db: require('../libs/mysql.js'), // 数据库连接属性
        req: _req,
        res: _res,
        cb: _callback,
        getParam: function (param, _code) {
            var Me = this;
            var code = _code || 40002
            if (typeof _req.query[param] === 'undefined' && typeof _req.body[param] === 'undefined') {
                console.log('缺乏参数:', param)
                throw {
                    code: "402",
                    msg: "缺乏参数" + param,
                    data: ""
                }
            } else if (!_req.query[param]) {
                return _req.body[param]
            }
            else {
                return _req.query[param]
            }
        },
        test: function () {
            var Me = this
            return Me.cb(200, null, 'ok')
        },
        // 模拟上传接口
        typedocr: function () {
            var Me = this;
            var appKey = Me.getParam("appKey");
            var appSecret = Me.getParam("appSecret");
            var type = Me.getParam("type");
            var image = Me.getParam("image");
            var ticketID = Me.getParam("ticketID");
            var params = {
                appKey: appKey,
                appSecret: appSecret,
                type: type,
                image: image,
                caseId: ticketID,
                channelCode: "FJ30",
                imgName: "ceshi.jpg",
            }
            request.post({
                url: settings.FrontService + "/typedocr",
                body: JSON.stringify(params),
                timeout: 3 * 60 * 1000,
                headers: {
                    "Content-Type": "application/json"
                }
            },
                function (err, response, body) {
                    if (err) {
                        return Me.cb(300, "上传失败", "")
                    }
                    else {
                        return Me.cb(200, "", "上传成功")
                    }
                }
            );
        },
        // 接受图片保存，记录到数据库
        ReceiveImage: function () {
            var Me = this;
            var ep = new EventProxy();
            var type = Me.getParam("type");
            var image = Me.getParam("image");
            var ticketID = Me.getParam("caseId");
            var channelCode = Me.getParam("channelCode");
            var imgName = Me.getParam("imgName");
            var appKey = Me.getParam("appKey");
            var filename = "";
            var now = hcUti.formatDate(new Date(), 'yyyy/MM/dd');
            saveBase64(image, now).then(function (res) {
                filename = res;
                if (res == "image base64 data error") {
                    return Me.cb(300, res, "");
                }
                else {
                    ep.emit("ep_insert_files");
                }
            })
            ep.on("ep_insert_files", function () {
                var filepath = settings.FileUrl + "upload/images/" + now + "/" + filename;
                var uploadtime = hcUti.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss');
                var sqlCmd = "insert into files (filename,filepath,type,ticketID,uploadtime,channelCode,appKey) values (?,?,?,?,?,?,?);";
                var sqlParams = [imgName, filepath, type, ticketID, uploadtime, channelCode, appKey];
                Me.db.query(sqlCmd, sqlParams, function (_err, _results) {
                    if (_err) {
                        return Me.cb(300, "数据异常", "");
                    }
                    else {
                        return Me.cb(200, "", "success");
                    }
                });
            })
        },
        // 登录接口
        Login: function () {
            var Me = this;
            var username = Me.getParam("username");
            var password = Me.getParam("password");
            var ep = new EventProxy();
            var sqlCmd = "select id,username,realname,role,status,caseId from users where username=? and password=? and deletestatus=0;";
            var sqlParams = [username, password];
            Me.db.query(sqlCmd, sqlParams, function (_err, _results) {
                if (_err) {
                    return Me.cb(300, "数据异常", "");
                }
                else {
                    if (_results.length) {
                        if (_results[0].status == 0) {
                            return Me.cb(300, "用户名已停用", "");
                        }
                        else {
                            const JwtToken = Jwt.sign({
                                "userinfo": _results[0],
                                "time": new Date().getTime()
                            }, 'WHHCXW2020', {
                                expiresIn: '24h'
                            });
                            ep.emit("ep_update", { "userinfo": _results[0], "JwtToken": JwtToken }, _results[0].id)
                            // return Me.cb(200, "", { "userinfo": _results[0], "JwtToken": JwtToken });
                        }
                    }
                    else {
                        return Me.cb(300, "用户名或密码错误", "");
                    }
                }
            });
            ep.on("ep_update", function (obj, userid) {
                var sqlCmd = "update users set token=? where id=?;";
                var token = crypto.createHash('md5').update(obj.JwtToken).digest("hex");
                var sqlParams = [token, userid];
                Me.db.query(sqlCmd, sqlParams, function (_err, result) {
                    if (_err) {
                        return Me.cb(300, "数据异常", "");
                    }
                    else {
                        settings.tokenObj[userid] = {}
                        settings.tokenObj[userid]["token"] = token;
                        return Me.cb(200, '', obj);
                    }
                });
            })
        },
        // 小程序登录
        AppletLogin: function () {
            var Me = this;
            var username = Me.getParam("username");
            var password = Me.getParam("password");
            var ep = new EventProxy();
            var sqlCmd = "select id,username,realname,role,status,caseId from users where username=? and password=? and deletestatus=0 and role=3;";
            var sqlParams = [username, password];
            Me.db.query(sqlCmd, sqlParams, function (_err, _results) {
                if (_err) {
                    return Me.cb(300, "数据异常", "");
                }
                else {
                    if (_results.length) {
                        if (_results[0].status == 0) {
                            return Me.cb(300, "用户名已停用", "");
                        }
                        else {
                            const JwtToken = Jwt.sign({
                                "userinfo": _results[0],
                                "time": new Date().getTime()
                            }, 'WHHCXW2020', {
                                expiresIn: '24h'
                            });
                            ep.emit("ep_update", { "userinfo": _results[0], "JwtToken": JwtToken }, _results[0].id)
                            // return Me.cb(200, "", { "userinfo": _results[0], "JwtToken": JwtToken });
                        }
                    }
                    else {
                        return Me.cb(300, "用户名或密码错误", "");
                    }
                }
            });
            ep.on("ep_update", function (obj, userid) {
                var sqlCmd = "update users set token=? where id=?;";
                var token = crypto.createHash('md5').update(obj.JwtToken).digest("hex");
                var sqlParams = [token, userid];
                Me.db.query(sqlCmd, sqlParams, function (_err, result) {
                    if (_err) {
                        return Me.cb(300, "数据异常", "");
                    }
                    else {
                        settings.tokenObj[userid] = {}
                        settings.tokenObj[userid]["token"] = token;
                        return Me.cb(200, '', obj);
                    }
                });
            })
        },
        // 获取任务
        GetTasks: function () {
            var Me = this;
            var currentPage = Me.getParam("currentPage");
            var pageSize = Me.getParam("pageSize") * 1;
            var userid = Me.getParam("userid") * 1;
            var sqlCmd = "select * from files where (userid=? or (userid2=? and status!=3)) ";
            var sqlParams = [userid, userid];
            var sqlWhere = "";
            sqlCmd = sqlCmd + sqlWhere + " limit ?,?;";
            sqlParams.push(currentPage * pageSize);
            sqlParams.push(pageSize);
            // 分页
            sqlCmd += "select count(0) as total from files where (userid=? or (userid2=? and status!=3)) ";
            sqlParams.push(userid);
            sqlParams.push(userid);
            sqlCmd += sqlWhere;
            Me.db.query(sqlCmd, sqlParams, function (_err, result) {
                if (_err) {
                    return Me.cb(300, "数据异常", "");
                }
                else {
                    return Me.cb(200, '', { 'total': result[1][0].total, 'topics': result[0] });
                }
            });
        },
        // 获取任务-当前任务
        GetTasksOne: function () {
            var Me = this;
            var currentPage = Me.getParam("currentPage");
            var pageSize = Me.getParam("pageSize") * 1;
            var userid = Me.getParam("userid") * 1;
            var sqlCmd = "select * from files where ((userid=? and status=1) or (userid2=? and status=2)) ";
            var sqlParams = [userid, userid];
            var sqlWhere = "";
            sqlCmd = sqlCmd + sqlWhere + " limit ?,?;";
            sqlParams.push(currentPage * pageSize);
            sqlParams.push(pageSize);
            // 分页
            sqlCmd += "select count(0) as total from files where ((userid=? and status=1) or (userid2=? and status=2)) ";
            sqlParams.push(userid);
            sqlParams.push(userid);
            sqlCmd += sqlWhere;
            Me.db.query(sqlCmd, sqlParams, function (_err, result) {
                if (_err) {
                    return Me.cb(300, "数据异常", "");
                }
                else {
                    return Me.cb(200, '', { 'total': result[1][0].total, 'topics': result[0] });
                }
            });
        },
        // 获取任务-驳回审核
        GetTasksTwo: function () {
            var Me = this;
            var currentPage = Me.getParam("currentPage");
            var pageSize = Me.getParam("pageSize") * 1;
            var userid = Me.getParam("userid") * 1;
            var sqlCmd = "select * from files where userid=? and status=3 ";
            var sqlParams = [userid];
            var sqlWhere = "";
            sqlCmd = sqlCmd + sqlWhere + " limit ?,?;";
            sqlParams.push(currentPage * pageSize);
            sqlParams.push(pageSize);
            // 分页
            sqlCmd += "select count(0) as total from files where userid=? and status=3 ";
            sqlParams.push(userid);
            sqlCmd += sqlWhere;
            Me.db.query(sqlCmd, sqlParams, function (_err, result) {
                if (_err) {
                    return Me.cb(300, "数据异常", "");
                }
                else {
                    return Me.cb(200, '', { 'total': result[1][0].total, 'topics': result[0] });
                }
            });
        },
        // 获取任务-质检审核
        GetTasksThree: function () {
            var Me = this;
            var currentPage = Me.getParam("currentPage");
            var pageSize = Me.getParam("pageSize") * 1;
            var userid = Me.getParam("userid") * 1;
            var sqlCmd = "select * from files where userid=? and status=2 ";
            var sqlParams = [userid];
            var sqlWhere = "";
            sqlCmd = sqlCmd + sqlWhere + " limit ?,?;";
            sqlParams.push(currentPage * pageSize);
            sqlParams.push(pageSize);
            // 分页
            sqlCmd += "select count(0) as total from files where userid=? and status=2 ";
            sqlParams.push(userid);
            sqlCmd += sqlWhere;
            Me.db.query(sqlCmd, sqlParams, function (_err, result) {
                if (_err) {
                    return Me.cb(300, "数据异常", "");
                }
                else {
                    return Me.cb(200, '', { 'total': result[1][0].total, 'topics': result[0] });
                }
            });
        },
        // 管理员查询全部任务
        GetAllTasks: function () {
            var Me = this;
            var currentPage = Me.getParam("currentPage");
            var pageSize = Me.getParam("pageSize") * 1;
            var ticketID = Me.getParam("ticketID");
            var userid = Me.getParam("userid");
            var userid2 = Me.getParam("userid2");
            var status = Me.getParam("status");
            var uploadtime_start = Me.getParam("uploadtime_start");
            var uploadtime_end = Me.getParam("uploadtime_end");
            var sqlCmd = "select * from files where 1 ";
            var sqlParams = [];
            var sqlWhere = "";
            if (ticketID) {
                sqlWhere += " and ticketID=? ";
                sqlParams.push(ticketID);
            }
            if (userid) {
                sqlWhere += " and userid=? ";
                sqlParams.push(userid);
            }
            if (userid2) {
                sqlWhere += " and userid2=? ";
                sqlParams.push(userid2);
            }
            if (status) {
                sqlWhere += " and status=? ";
                sqlParams.push(status);
            }
            if (uploadtime_start) {
                sqlWhere += " and uploadtime>=? ";
                sqlParams.push(uploadtime_start);
            }
            if (uploadtime_end) {
                sqlWhere += " and uploadtime<=? ";
                sqlParams.push(uploadtime_end);
            }

            sqlCmd = sqlCmd + sqlWhere + " limit ?,?;";
            sqlParams.push(currentPage * pageSize);
            sqlParams.push(pageSize);
            // 分页
            sqlCmd += "select count(0) as total from files where 1 ";
            if (ticketID) {
                sqlParams.push(ticketID);
            }
            if (userid) {
                sqlParams.push(userid);
            }
            if (userid2) {
                sqlParams.push(userid2);
            }
            if (status) {
                sqlParams.push(status);
            }
            if (uploadtime_start) {
                sqlParams.push(uploadtime_start);
            }
            if (uploadtime_end) {
                sqlParams.push(uploadtime_end);
            }
            sqlCmd += sqlWhere;
            Me.db.query(sqlCmd, sqlParams, function (_err, result) {
                if (_err) {
                    return Me.cb(300, "数据异常", "");
                }
                else {
                    return Me.cb(200, '', { 'total': result[1][0].total, 'topics': result[0] });
                }
            });
        },
        // 领取任务
        ReceiveTasks: function () {
            // 处理状态：0待处理，1已领取处理中，2已提交
            // 有待处理或者驳回的任务不能领取任务
            var Me = this;
            var userid = Me.getParam("userid");
            var realname = Me.getParam("realname");
            var ep = new EventProxy();
            var sqlCmd = "select * from files where userid=? and status =1 ;";
            var sqlParams = [userid];
            Me.db.query(sqlCmd, sqlParams, function (_err, result) {
                if (_err) {
                    return Me.cb(300, "数据异常", "");
                }
                else {
                    if (result.length > 0) {
                        return Me.cb(300, "请完成任务后再领取", "");
                    }
                    else {
                        ep.emit("ep_sh");
                    }
                }
            });

            // 优先处理上海、武汉的测试任务
            ep.on("ep_sh", function () {
                var sqlCmd = "update files set userid=?, realname=?, status=?, gettasktime=?  where userid=0 and status=0 and (ticketID=? or ticketID=? )order by uploadtime limit 1;";
                var gettasktime = hcUti.formatDate(new Date(), "yyyy-MM-dd hh:mm:ss");
                var sqlParams = [userid, realname, 1, gettasktime, "SH2020", "WH2020"];
                Me.db.query(sqlCmd, sqlParams, function (_err, result) {
                    if (_err) {
                        return Me.cb(300, "数据异常", "");
                    }
                    else {
                        if (result.affectedRows == 0) {
                            // return Me.cb(300, "无可领取任务", "");
                            ep.emit("ep_update_files");
                        }
                        else {
                            return Me.cb(200, "", "success");
                        }
                    }
                });
            })

            ep.on("ep_update_files", function () {
                var sqlCmd = "update files set userid=?, realname=?, status=?, gettasktime=?  where userid=0 and status=0 order by uploadtime limit 1;";
                var gettasktime = hcUti.formatDate(new Date(), "yyyy-MM-dd hh:mm:ss");
                var sqlParams = [userid, realname, 1, gettasktime];
                Me.db.query(sqlCmd, sqlParams, function (_err, result) {
                    if (_err) {
                        return Me.cb(300, "数据异常", "");
                    }
                    else {
                        if (result.affectedRows == 0) {
                            return Me.cb(300, "无可领取任务", "");
                        }
                        else {
                            return Me.cb(200, "", "success");
                        }
                    }
                });
            })
        },
        // 查询任务详情
        GetTaskDetail: function () {
            var Me = this;
            var fileid = Me.getParam("fileid");
            var sqlCmd = "select * from files where id=?;";
            var sqlParams = [fileid];
            Me.db.query(sqlCmd, sqlParams, function (_err, result) {
                if (_err) {
                    return Me.cb(300, "数据异常", "");
                }
                else {
                    return Me.cb(200, "", result);
                }
            });
        },
        // 数据暂存
        TempSave: function () {
            var Me = this;
            var fileid = Me.getParam("fileid");
            var content = Me.getParam("content");
            var rows = JSON.parse(content).p_detail.length;
            var titlename = Me.getParam("titlename");
            var checkedList1 = Me.getParam("checkedList1");
            var checkedList2 = Me.getParam("checkedList2");
            var bill_type = Me.getParam("bill_type");
            var invoice_type = Me.getParam("invoice_type");
            var sqlCmd = "update files set content=?, titlename=?, checkedList1=?, checkedList2=?, bill_type=?, invoice_type=?, rows=? where id=?;";
            var sqlParams = [content, titlename, checkedList1, checkedList2, bill_type, invoice_type, rows, fileid];
            console.log('sqlCmd:', sqlCmd);
            console.log('sqlParams:', sqlParams);
            Me.db.query(sqlCmd, sqlParams, function (_err, result) {
                if (_err) {
                    console.log('_err:', _err);
                    return Me.cb(300, "数据异常", "");
                }
                else {
                    return Me.cb(200, "", "success");
                }
            });
        },
        // 推送处理结果接口
        GetResult: function () {
            var Me = this;
            var params = {
                caseId: "20200903161605914_20200903161635",
                data: []
            }
            console.log('params:', JSON.stringify(params));
            request.post({
                url: "http://ocr-picc.bxt189.com/api/case/getResult",
                body: JSON.stringify(params),
                timeout: 3 * 60 * 1000,
                headers: {
                    "Content-Type": "application/json"
                }
            },
                function (err, response, body) {
                    if (err) {
                        return Me.cb(300, "数据异常", "")
                    }
                    else {
                        console.log('err:', err);
                        console.log('body:', body);
                        return Me.cb(200, err, body);
                    }
                }
            );
        },
        // 查询质检人员
        GetQualityUser: function () {
            var Me = this;
            var userid = Me.getParam("userid");
            var sqlCmd = "select id,username,realname from users where role=2 and status=1 and deletestatus=0 and id!=? and inspection=1;";
            var sqlParams = [userid];
            Me.db.query(sqlCmd, sqlParams, function (_err, result) {
                if (_err) {
                    return Me.cb(300, "数据异常", "");
                }
                else {
                    return Me.cb(200, "", result);
                }
            });
        },
        // 录单提交
        ToQualityUser: function () {
            console.log("进入ToQualityUser接口");
            var Me = this;
            var ep = new EventProxy();
            var fileid = Me.getParam("fileid");
            var content = Me.getParam("content");
            var userid2 = Me.getParam("userid2");
            var realname2 = Me.getParam("realname2");
            var remark = Me.getParam("remark");
            var checkedList1 = Me.getParam("checkedList1");
            var checkedList2 = Me.getParam("checkedList2");
            var sqlCmd = "update files set submittime=?, content=?, status=2, userid2=?, realname2=?, remark=?,checkedList1=?, checkedList2=? where id=?;";
            var submittime = hcUti.formatDate(new Date(), "yyyy-MM-dd hh:mm:ss");
            var sqlParams = [submittime, content, userid2, realname2, remark, checkedList1, checkedList2, fileid];
            Me.db.query(sqlCmd, sqlParams, function (_err, result) {
                if (_err) {
                    return Me.cb(300, "数据异常", "");
                }
                else {
                    // ep.emit("ep_handle_goods");
                    // return Me.cb(200, "", "success");
                    ep.emit("ep_insert_filestore")
                }
            });
            ep.on("ep_handle_goods", function () {
                var drug_list = JSON.parse(content).p_detail;
                handle_one(0, drug_list);
                function handle_one(n, list) {
                    if (n >= list.length) return 'over'
                    try {
                        var goods_name = list[n].item_name;
                        ep.emit("ep_serach_one", goods_name);
                        if (n + 1 < list.length) {
                            handle_one(n + 1, list);
                        }
                    }
                    catch (err) {
                        console.log(err);
                    }
                }
            })
            ep.on("ep_serach_one", function (name) {
                var sqlCmd = "select * from druglist where general_Chinese_name=?";
                var sqlParams = [name];
                Me.db.query(sqlCmd, sqlParams, function (_err, result) {
                    if (_err) {
                        console.log(_err);
                    } else {
                        if (result.length == 0) {
                            ep.emit("ep_insert_one", name);
                        } else if (result.length == 1) {
                            var _id = result[0].id;
                            ep.emit("ep_update_one", _id);
                        } else {
                            console.log(name + "有" + result.length + "条数据,联系管理员处理");
                        }
                    }
                });
            })
            ep.on("ep_insert_one", function (name) {
                var sqlCmd = "insert IGNORE into druglist (general_Chinese_name) values (?) ;";
                var sqlParams = [name];
                Me.db.query(sqlCmd, sqlParams, function (_err, result) {
                    if (_err) {
                        return Me.cb(300, "数据异常", "");
                    }
                    else {
                        if (result.affectedRows == 0) {
                            console.log("该名称已存在");
                        } else {
                            console.log("名称插入成功");
                        }
                    }
                });
            })
            ep.on("ep_update_one", function (id) {
                var sqlCmd = "update druglist SET count=count+1 where id=?;";
                console.log(id);
                var sqlParams = [id];
                Me.db.query(sqlCmd, sqlParams, function (_err, result) {
                    if (_err) {
                        console.log(_err);
                    } else {
                        console.log("名称使用次数修改成功");
                    }
                });
            })
            ep.on("ep_insert_filestore", function () {
                content = JSON.parse(content)
                var sqlCmd = ''
                var sqlParams = []
                var p_detail = content.p_detail
                for(var i = 0; i < p_detail.length; i++) {
                    sqlCmd += 'insert into filestore (fileid,item_name,count,unit_price,item_amount,class,manual_proportion,manual_amount) values (?,?,?,?,?,?,?,?);'
                    sqlParams.push(fileid, p_detail[i].item_name, p_detail[i].count, p_detail[i].unit_price, p_detail[i].item_amount, p_detail[i].calss, p_detail[i].manual_proportion, p_detail[i].manual_amount)
                }
                Me.db.query(sqlCmd, sqlParams, function (_err, result) {
                    if (_err) {
                        return Me.cb(300, "数据异常", "");
                    }
                    else {
                        return Me.cb(200, "", "success");
                    }
                });
            })
        },
        // 驳回
        Reject: function () {
            var Me = this;
            var fileid = Me.getParam("fileid");
            var content = Me.getParam("content");
            var remark = Me.getParam("remark");
            var sqlCmd = "update files set content=?, status=3, submittime2=?, remark=? where id=?;";
            var submittime2 = hcUti.formatDate(new Date(), "yyyy-MM-dd hh:mm:ss");
            var sqlParams = [content, submittime2, remark, fileid];
            Me.db.query(sqlCmd, sqlParams, function (_err, result) {
                if (_err) {
                    return Me.cb(300, "数据异常", "");
                }
                else {
                    return Me.cb(200, "", "success");
                }
            });
        },
        // 推送数据
        PushToCore: function () {
            var Me = this;
            var ep = new EventProxy();
            var fileid = Me.getParam("fileid");
            var content = Me.getParam("content");
            var remark = Me.getParam("remark");
            var ticketID = Me.getParam("ticketID");
            var sendback = Me.getParam("sendback");
            var checkedList1 = Me.getParam("checkedList1");
            var checkedList2 = Me.getParam("checkedList2");
            var params = {
                caseId: ticketID,
                data: [JSON.parse(content)]
            }
            var logger = log4js.getLogger('PushToCore');
            logger.info("ticketID:" + ticketID + ";fileid:" + fileid + ";content:" + JSON.stringify(params));
            request.post({
                url: "http://ocr-picc.bxt189.com/api/case/getResult",
                body: JSON.stringify(params),
                timeout: 3 * 60 * 1000,
                headers: {
                    "Content-Type": "application/json"
                }
            },
                function (err, response, body) {
                    if (err) {
                        console.log('推送数据异常:', err);
                        logger.error("ticketID:" + ticketID + ";fileid:" + fileid + ";err:" + err);
                        return Me.cb(300, "数据异常1", "")
                    }
                    else {
                        console.log('err:', err);
                        console.log('body:', body);
                        logger.info("ticketID:" + ticketID + ";fileid:" + fileid + ";body:" + body);
                        try {
                            body = JSON.parse(body);
                        } catch (error) {
                            return Me.cb(300, '解析推送接口的返回数据', "");
                        }

                        if (body.code == 0) {
                            ep.emit("ep_update_files");
                        }
                        else {
                            return Me.cb(300, body.errMsg, "");
                        }
                    }
                }
            );
            ep.on("ep_update_files", function () {
                var sqlCmd = "update files set content=?, status=4, submittime2=?, pushtime=?, remark=?, sendback=?, checkedList1=?, checkedList2=? where id=?;";
                var submittime2 = hcUti.formatDate(new Date(), "yyyy-MM-dd hh:mm:ss");
                var sqlParams = [content, submittime2, submittime2, remark, sendback, checkedList1, checkedList2, fileid];
                Me.db.query(sqlCmd, sqlParams, function (_err, result) {
                    if (_err) {
                        console.log('_err:', _err);
                        return Me.cb(300, "数据异常2", "");
                    }
                    else {
                        return Me.cb(200, "", "success");
                    }
                });
            })
        },
        // 任务派发
        Allocate: function () {
            var Me = this;
            var userid = Me.getParam("userid");
            var realname = Me.getParam("realname");
            var fileid = Me.getParam("fileid");
            var sqlCmd = "update files set realname=?, status=1, userid=?, source=2, gettasktime=? where id=?;";
            var gettasktime = hcUti.formatDate(new Date(), "yyyy-MM-dd hh:mm:ss");
            var sqlParams = [realname, userid, gettasktime, fileid];
            Me.db.query(sqlCmd, sqlParams, function (_err, result) {
                if (_err) {
                    return Me.cb(300, "数据异常", "");
                }
                else {
                    return Me.cb(200, "", "success");
                }
            });
        },
        // 查询全部用户
        GetUsers: function () {
            var Me = this;
            var currentPage = Me.getParam("currentPage");
            var pageSize = Me.getParam("pageSize") * 1;
            var sqlCmd = "select * from users where deletestatus=0 and role=2 ";
            var sqlParams = [];
            var sqlWhere = "";
            sqlCmd = sqlCmd + sqlWhere + " limit ?,?;";
            sqlParams.push(currentPage * pageSize);
            sqlParams.push(pageSize);
            // 分页
            sqlCmd += "select count(0) as total from users where deletestatus=0 and role=2 ";
            sqlCmd += sqlWhere;
            Me.db.query(sqlCmd, sqlParams, function (_err, result) {
                if (_err) {
                    return Me.cb(300, "数据异常", "");
                }
                else {
                    return Me.cb(200, '', { 'total': result[1][0].total, 'topics': result[0] });
                }
            });
        },
        // 新增用户
        NewUser: function () {
            var Me = this;
            var realname = Me.getParam("realname");
            var username = Me.getParam("username");
            var password = Me.getParam("password");
            var sqlCmd = "insert IGNORE into users (username,realname,password,role) values (?,?,?,?) ;";
            var sqlParams = [username, realname, password, 2];
            Me.db.query(sqlCmd, sqlParams, function (_err, result) {
                if (_err) {
                    return Me.cb(300, "数据异常", "");
                }
                else {
                    if (result.affectedRows == 0) {
                        return Me.cb(300, '用户已存在', "");
                    }
                    else {
                        return Me.cb(200, '', "success");
                    }
                }
            });
        },
        // 编辑用户信息
        EditUser: function () {
            var Me = this;
            var realname = Me.getParam("realname");
            var username = Me.getParam("username");
            var password = Me.getParam("password");
            var userid = Me.getParam("userid");
            var sqlCmd = "update ignore users set realname=?, username=? ";
            var sqlParams = [realname, username];
            if (password) {
                sqlCmd += " ,password=? ";
                sqlParams.push(password);
            }
            sqlCmd += " where id=?;";
            sqlParams.push(userid);
            Me.db.query(sqlCmd, sqlParams, function (_err, result) {
                if (_err) {
                    console.log('_err:', _err);
                    return Me.cb(300, "数据异常", "");
                }
                else {
                    if (result.changedRows == 0) {
                        return Me.cb(300, '用户已存在', "");
                    }
                    else {
                        return Me.cb(200, '', "success");
                    }
                }
            });
        },
        // 查询未领取任务数量
        GetRemainTasks: function () {
            var Me = this;
            var sqlCmd = "select * from files where status=0;";
            var sqlParams = [];
            Me.db.query(sqlCmd, sqlParams, function (_err, result) {
                if (_err) {
                    return Me.cb(300, "数据异常", "");
                }
                else {
                    return Me.cb(200, '', result.length);
                }
            });
        },
        // 删除用户
        DeleteUser: function () {
            var Me = this;
            var userid = Me.getParam("userid");
            var ep = new EventProxy();
            var sqlCmd = "select * from files where (userid=? or userid2=?) and status!=4;";
            var sqlParams = [userid, userid];
            Me.db.query(sqlCmd, sqlParams, function (_err, result) {
                if (_err) {
                    return Me.cb(300, "数据异常", "");
                }
                else {
                    if (result.length > 0) {
                        return Me.cb(300, "该用户有未完成任务，不能删除", "");
                    }
                    ep.emit("ep_update_users");
                }
            });
            ep.on("ep_update_users", function () {
                var sqlCmd = "update users set deletestatus=1 where id=?;";
                var sqlParams = [userid];
                Me.db.query(sqlCmd, sqlParams, function (_err, result) {
                    if (_err) {
                        return Me.cb(300, "数据异常", "");
                    }
                    else {
                        return Me.cb(200, '', "success");
                    }
                });
            })
        },
        // 停用启用
        SwitchUser: function () {
            var Me = this;
            var userid = Me.getParam("userid");
            var status = Me.getParam("status");
            var ep = new EventProxy();
            var sqlCmd = "select * from files where (userid=? or userid2=?) and status!=4;";
            var sqlParams = [userid, userid];
            Me.db.query(sqlCmd, sqlParams, function (_err, result) {
                if (_err) {
                    return Me.cb(300, "数据异常", "");
                }
                else {
                    var str = "该用户有未完成任务，不能" + (status == 1 ? "启用" : "停用");
                    if (result.length > 0) {
                        return Me.cb(300, str, "");
                    }
                    ep.emit("ep_update_users");
                }
            });
            ep.on("ep_update_users", function () {
                var sqlCmd = "update users set status=? where id=?;";
                var sqlParams = [status, userid];
                Me.db.query(sqlCmd, sqlParams, function (_err, result) {
                    if (_err) {
                        return Me.cb(300, "数据异常", "");
                    }
                    else {
                        return Me.cb(200, '', "success");
                    }
                });
            })
        },
        // 停用启用质检权限
        SwitchInspection: function () {
            var Me = this;
            var userid = Me.getParam("userid");
            var inspection = Me.getParam("inspection");
            var sqlCmd = "update users set inspection=? where id=?;";
            var sqlParams = [inspection, userid];
            Me.db.query(sqlCmd, sqlParams, function (_err, result) {
                if (_err) {
                    return Me.cb(300, "数据异常", "");
                }
                else {
                    return Me.cb(200, '', "success");
                }
            });
        },
        // 修改密码
        ChangePwd: function () {
            var Me = this;
            var oldPwd = Me.getParam("oldPwd");
            var newPwd = Me.getParam("newPwd");
            var userid = Me.getParam("userid");
            var ep = new EventProxy();
            var sqlCmd = "select * from users where id=?;";
            var sqlParams = [userid];
            Me.db.query(sqlCmd, sqlParams, function (_err, result) {
                if (_err) {
                    return Me.cb(300, "数据异常", "");
                }
                else {
                    if (result[0].password != oldPwd) {
                        return Me.cb(300, "原密码不正确", "");
                    }
                    ep.emit("ep_update_users");
                }
            });
            ep.on("ep_update_users", function () {
                var sqlCmd = "update users set password=? where id=?;";
                var sqlParams = [newPwd, userid];
                Me.db.query(sqlCmd, sqlParams, function (_err, result) {
                    if (_err) {
                        return Me.cb(300, "数据异常", "");
                    }
                    else {
                        return Me.cb(200, '', "success");
                    }
                });
            })
        },
        // Base64
        Base64: function () {
            var Me = this;
            var imgurl = path.join(__dirname, '../../web/upload/images/2020/08/22/', "4ec8bcd0-e426-11ea-8de7-ab2e8dc367c6.jpg");
            let data = fs.readFileSync(imgurl);
            data = Buffer.from(data).toString('base64');
            let base64 = 'data:' + mineType.lookup(imgurl) + ';base64,' + data;
            return Me.res.send(base64);
        },
        // 机器识别
        MachineOCR: function () {
            var Me = this;
            var ocrType = Me.getParam("ocrType");
            var fileid = Me.getParam("fileid");
            var ep = new EventProxy();
            var filepath = "";
            var sqlCmd = "select * from files where id=?;";
            var sqlParams = [fileid];
            Me.db.query(sqlCmd, sqlParams, function (_err, result) {
                if (_err) {
                    return Me.cb(300, "数据异常", "");
                }
                else {
                    filepath = result[0].filepath;
                    ep.emit("ep_ocr")
                }
            });
            ep.on("ep_ocr", function () {
                var imgurl = path.join(__dirname, '../../web/upload/images' + filepath.split("images")[1]);
                imgurl = imgurl.replace(/TestServer/, "OCR-National-Service-Platform/server")
                var data = fs.readFileSync(imgurl);
                data = Buffer.from(data).toString('base64');
                var base64 = 'data:' + mineType.lookup(imgurl) + ';base64,' + data;
                Typedocr(base64, ocrType).then(function (res) {
                    console.log('res:', res);
                    let data = {};
                    try {
                        data = JSON.parse(res).data;
                    }
                    catch (error) {

                    }
                    if (ocrType == "Generalmedicalbillclassify_deep") {
                        if ("{}" == JSON.stringify(data)) {
                            return Me.cb(200, "", {})
                        }
                        return Me.cb(200, "", JSON.parse(JSON.parse(res).data))
                    }
                    else if (ocrType == "TencentInsurance") {
                        return Me.cb(200, "", data)
                    }
                    else if (ocrType == "FuJianMedicalInsurance") {
                        return Me.cb(200, "", data)
                    }
                    else if (ocrType == "FuJianMedicalInsuranceDeep") {
                        return Me.cb(200, "", data)
                    }
                }, function (err) {
                    return Me.cb(300, err, "")
                })
            })
        },
        // 药品模糊匹配
        GetDruglist: function () {
            var Me = this;
            var drugname = Me.getParam("drugname");
            var sqlCmd = "select drug_registration_name from druglist where drug_registration_name like ? order by count desc limit 20;";
            var sqlParams = ["%" + drugname + "%"];
            Me.db.query(sqlCmd, sqlParams, function (_err, result) {
                if (_err) {
                    return Me.cb(300, "数据异常", "");
                }
                else {
                    return Me.cb(200, '', result);
                }
            });
        },
        // 药品搜索频率
        DrugListPlus: function () {
            var Me = this;
            var drugname = Me.getParam("name");
            var sqlCmd = "insert into druglist (general_Chinese_name,drug_registration_name,count) values (?,?,?) ON DUPLICATE KEY update count=count+1;";
            var sqlParams = [drugname, drugname, 1];
            Me.db.query(sqlCmd, sqlParams, function (_err, result) {
                if (_err) {
                    return Me.cb(300, "数据异常", "");
                }
                else {
                    return Me.cb(200, '', "success");
                }
            });
        },
        // 人工处理查询
        GetManualTask: function () {
            var Me = this;
            var ticketID = Me.getParam("ticketID");
            var reportno = Me.getParam("reportno");
            var filename = Me.getParam("filename");
            var sqlCmd = "select * from files where 1";
            var sqlParams = [];
            if (ticketID) {
                sqlCmd += " and ticketID=?";
                sqlParams.push(ticketID);
            }
            if (reportno) {
                sqlCmd += " and reportno=?";
                sqlParams.push(reportno);
            }
            if (filename) {
                sqlCmd += " and filename=?";
                sqlParams.push(filename);
            }
            Me.db.query(sqlCmd, sqlParams, function (_err, result) {
                if (_err) {
                    return Me.cb(300, "数据异常", "");
                }
                else {
                    if (result.length == 0) {
                        return Me.cb(300, "未查询到任务信息", "");
                    }
                    else if (result.length >= 2) {
                        return Me.cb(300, "查询到多条任务信息，请确认查询条件", "");
                    }
                    else {
                        return Me.cb(200, '', result[0]);
                    }
                }
            });
        },
        // 人工补录
        SuppleTask: function () {
            var Me = this;
            var fileid = Me.getParam("fileid");
            var reinputremark = Me.getParam("reinputremark");
            var ep = new EventProxy();

            var sqlCmd = "select * from files where id=?;";
            var sqlParams = [fileid];
            Me.db.query(sqlCmd, sqlParams, function (_err, result) {
                if (_err) {
                    return Me.cb(300, "数据异常", "");
                }
                else {
                    ep.emit("ep_insert_files", result[0])
                }
            });
            ep.on("ep_insert_files", function (item) {
                var sqlCmd = "insert into files (filename,filepath,type,ticketID,uploadtime,channelCode,appKey,reportno,content,reinput,reinputremark,reinputtime) values (?,?,?,?,?,?,?,?,?,?,?,?);";
                var reinputtime = hcUti.formatDate(new Date(), "yyyy-MM-dd hh:mm:ss");
                var sqlParams = [item.filename, item.filepath, item.type, item.ticketID, item.uploadtime, item.channelCode, item.appKey, item.reportno, item.content, 1, reinputremark, reinputtime];
                Me.db.query(sqlCmd, sqlParams, function (_err, result) {
                    if (_err) {
                        return Me.cb(300, "数据异常", "");
                    }
                    else {
                        return Me.cb(200, '', "success");
                    }
                });
            })
            // insert into 表1(字段1,字段2,字段3) select 字段1,字段2,字段3 from 表1 where id= ** ; 
        },
        // 推送数据
        PushAgain: function () {
            var Me = this;
            var ep = new EventProxy();
            var content = Me.getParam("content");
            var ticketID = Me.getParam("ticketID");
            var fileid = Me.getParam("fileid");
            var params = {
                caseId: ticketID,
                data: [JSON.parse(content)]
            }
            var logger = log4js.getLogger('PushToCore');
            logger.info("ticketID:" + ticketID + ";fileid:" + fileid + ";content:" + JSON.stringify(params));
            request.post({
                url: "http://ocr-picc.bxt189.com/api/case/getResult",
                body: JSON.stringify(params),
                timeout: 3 * 60 * 1000,
                headers: {
                    "Content-Type": "application/json"
                }
            },
                function (err, response, body) {
                    if (err) {
                        console.log('推送数据异常:', err);
                        logger.error("ticketID:" + ticketID + ";fileid:" + fileid + ";err:" + err);
                        return Me.cb(300, "数据异常", "")
                    }
                    else {
                        // console.log('err:', err);
                        // console.log('body:', body);
                        logger.info("ticketID:" + ticketID + ";fileid:" + fileid + ";body:" + body);
                        try {
                            body = JSON.parse(body);
                        } catch (error) {
                            return Me.cb(300, '解析推送接口的返回数据', "");
                        }

                        if (body.code == 0) {
                            ep.emit("ep_update_files");
                        }
                        else {
                            return Me.cb(300, body.errMsg, "");
                        }
                    }
                }
            );
            ep.on("ep_update_files", function () {
                var sqlCmd = "update files set repush=?, repushcontent=?, repushtime=? where id=?;";
                var repushtime = hcUti.formatDate(new Date(), "yyyy-MM-dd hh:mm:ss");
                var sqlParams = [1, content, repushtime, fileid];
                Me.db.query(sqlCmd, sqlParams, function (_err, result) {
                    if (_err) {
                        return Me.cb(300, "数据异常", "");
                    }
                    else {
                        return Me.cb(200, "", "success");
                    }
                });
            })
        },

        //上海的测试任务ocr
        pushocrtest: function () {
            var Me = this;
            var image = Me.getParam("image");
            var imgName = Me.getParam("imgName");
            var role = Me.getParam("role")
            var reportno = Me.getParam("reportno")
            var caseId = Me.getParam("caseId")
            // var reportno = 'SH' + new Date().getTime()
            // var caseId = ''
            // if (role == 3) {
            //     caseId = 'SH2020'
            // }
            // if (role == 4) {
            //     caseId = 'WH2020'
            // }
            var params = {
                appKey: 'ctcc',
                appSecret:
                    'M023Xwsif+62TRLVlSy/x6hC+jlrDCV62Fe9etDGHURsThAst/otkzOfvRaVoZ34nfkPJTXrYlGogtDUuesNCw==',
                type: '',
                image: image,
                caseId: caseId,
                channelCode: "FJ30",
                imgName: imgName,
                reportno: reportno
            }
            request.post({
                url: settings.FrontService + "/typedocr",
                body: JSON.stringify(params),
                timeout: 3 * 60 * 1000,
                headers: {
                    "Content-Type": "application/json"
                }
            },
                function (err, response, body) {
                    if (err) {
                        return Me.cb(300, "上传失败", "")
                    }
                    else {
                        return Me.cb(200, "上传成功", "上传成功")
                    }
                }
            );
        },

        pushocrtest2: function () {
            return this.cb(200, "some problem", "success")
        },

        //上海查询上传任务
        GetUploadTasks: function () {
            var Me = this;
            var currentPage = Me.getParam("currentPage");
            var pageSize = Me.getParam("pageSize") * 1;
            var status = Me.getParam("status");
            var uploadtime_start = Me.getParam("uploadtime_start");
            var uploadtime_end = Me.getParam("uploadtime_end");
            // var role = Me.getParam("role");
            var ticketID = Me.getParam("caseId");

            // var ticketID = "";
            // if (role == 3) {
            //     ticketID = "SH2020"
            // }
            // if (role == 4) {
            //     ticketID = "WH2020"
            // }

            var sqlCmd = "select * from files where 1 ";
            var sqlParams = [];
            var sqlWhere = "";
            sqlWhere += ' and ticketID=? '
            sqlParams.push(ticketID)
            if (status) {
                sqlWhere += " and status=? ";
                sqlParams.push(status);
            }
            if (uploadtime_start) {
                sqlWhere += " and uploadtime>=? ";
                sqlParams.push(uploadtime_start);
            }
            if (uploadtime_end) {
                sqlWhere += " and uploadtime<=? ";
                sqlParams.push(uploadtime_end);
            }

            sqlCmd = sqlCmd + sqlWhere + " order by uploadtime desc limit ?,?;";
            sqlParams.push(currentPage * pageSize);
            sqlParams.push(pageSize);
            // 分页
            sqlCmd += "select count(0) as total from files where 1 ";
            sqlParams.push(ticketID)
            if (status) {
                sqlParams.push(status);
            }
            if (uploadtime_start) {
                sqlParams.push(uploadtime_start);
            }
            if (uploadtime_end) {
                sqlParams.push(uploadtime_end);
            }
            sqlCmd += sqlWhere;
            Me.db.query(sqlCmd, sqlParams, function (_err, result) {
                if (_err) {
                    return Me.cb(300, "数据异常", "");
                }
                else {
                    return Me.cb(200, '', { 'total': result[1][0].total, 'topics': result[0] });
                }
            });
        },


        //获取省份信息
        GetProvince: function () {
            var Me = this

            var sqlCmd = 'select distinct code,name from province;'
            Me.db.query(sqlCmd, [], function (err, results) {
                if (err) {
                    return Me.cb(300, "数据异常", "");
                } else {
                    Me.cb(200, null, results)
                }
            })
        },

        //运营统计报表
        GetOperationStatistics: function () {
            var Me = this
            var ep = new EventProxy()

            var province = Me.getParam('province')
            // var currentPage = Me.getParam('currentPage')
            // var pageSize = Me.getParam('pageSize') * 1
            var uploadtime_start = Me.getParam('uploadtime_start')
            var uploadtime_end = Me.getParam('uploadtime_end')

            var sqlCmd = 'select province.name,count(*) as count from ' +
                ' (select SUBSTRING(reportno, 9,4) as cd from files where 1=1 '
            var sqlCmd1 = sqlCmd
            var sqlCmd2 = sqlCmd
            var sqlCmd3 = sqlCmd
            var sqlCmd4 = sqlCmd
            var sqlCmd5 = sqlCmd
            var sqlCmd6 = ''
            var sqlCmd7 = 'select province.name,count(*) as count, ' +
                ' count(if(t1.invoice_type=1,true,null)) as fpcount, count(if(t1.invoice_type=2,true,null)) as qdcount, count(if(t1.invoice_type=3,true,null)) as qtcount ' + ' from ' +
                ' (select SUBSTRING(reportno, 9,4) as cd,invoice_type from files where 1=1 '
            var sqlParams1 = []
            var sqlParams2 = []
            var sqlParams3 = []
            var sqlParams4 = []
            var sqlParams5 = []
            var sqlParams7 = []
            var sqlWhere1 = ''
            var sqlWhere2 = ''
            var sqlWhere3 = ''
            var sqlWhere4 = ''
            var sqlWhere5 = ''
            var sqlWhere6 = ''
            var sqlWhere7 = ''

            if (uploadtime_start && uploadtime_end) {
                sqlWhere1 += ' and uploadtime >= ? and uploadtime <= ? '
                sqlWhere2 += ' and uploadtime >= ? and uploadtime <= ? '
                sqlWhere3 += ' and uploadtime >= ? and uploadtime <= ? '
                sqlWhere4 += ' and uploadtime >= ? and uploadtime <= ? '
                sqlWhere5 += ' and uploadtime >= ? and uploadtime <= ? '
                sqlWhere7 += ' and uploadtime >= ? and uploadtime <= ? '
                sqlParams1.push(uploadtime_start, uploadtime_end)
                sqlParams2.push(uploadtime_start, uploadtime_end)
                sqlParams3.push(uploadtime_start, uploadtime_end)
                sqlParams4.push(uploadtime_start, uploadtime_end)
                sqlParams5.push(uploadtime_start, uploadtime_end)
                sqlParams7.push(uploadtime_start, uploadtime_end)
            }

            sqlWhere1 += ' and status=0) t1 inner join province on t1.cd = province.citycode '
            sqlWhere2 += ' and status=1) t1 inner join province on t1.cd = province.citycode '
            sqlWhere3 += ' and status=2) t1 inner join province on t1.cd = province.citycode '
            sqlWhere4 += ' and status=4) t1 inner join province on t1.cd = province.citycode '
            sqlWhere5 += ' and sendback=1) t1 inner join province on t1.cd = province.citycode '
            sqlWhere7 += ' ) t1 inner join province on t1.cd = province.citycode '

            if (province) {
                sqlWhere1 += ' where province.code=? '
                sqlWhere2 += ' where province.code=? '
                sqlWhere3 += ' where province.code=? '
                sqlWhere4 += ' where province.code=? '
                sqlWhere5 += ' where province.code=? '
                sqlWhere7 += ' where province.code=? '
                sqlParams1.push(province)
                sqlParams2.push(province)
                sqlParams3.push(province)
                sqlParams4.push(province)
                sqlParams5.push(province)
                sqlParams7.push(province)
            }


            sqlCmd6 += ' group by province.name ORDER BY province.name '


            sqlCmd1 += sqlWhere1 += sqlCmd6
            sqlCmd2 += sqlWhere2 += sqlCmd6
            sqlCmd3 += sqlWhere3 += sqlCmd6
            sqlCmd4 += sqlWhere4 += sqlCmd6
            sqlCmd5 += sqlWhere5 += sqlCmd6
            sqlCmd7 += sqlWhere7 += sqlCmd6
            //  + 'limit ?,?;'
            // sqlParams1.push(currentPage * pageSize);
            // sqlParams1.push(pageSize);
            // sqlParams2.push(currentPage * pageSize);
            // sqlParams2.push(pageSize);
            // sqlParams3.push(currentPage * pageSize);
            // sqlParams3.push(pageSize);
            // sqlParams4.push(currentPage * pageSize);
            // sqlParams4.push(pageSize);
            // sqlParams5.push(currentPage * pageSize);
            // sqlParams5.push(pageSize);

            // console.log('sqlCmd1' + sqlCmd1)
            // console.log(sqlParams1)
            // console.log('sqlCmd2' + sqlCmd2)
            // console.log(sqlParams2)
            // console.log('sqlCmd3' + sqlCmd3)
            // console.log(sqlParams3)
            // console.log('sqlCmd4' + sqlCmd4)
            // console.log(sqlParams4)
            // console.log('sqlCmd5' + sqlCmd5)
            // console.log(sqlParams5)
            // console.log('sqlCmd7' + sqlCmd7)
            // console.log(sqlParams7)
            Me.db.query(sqlCmd1, sqlParams1, ep.done("_query1"));
            Me.db.query(sqlCmd2, sqlParams2, ep.done("_query2"));
            Me.db.query(sqlCmd3, sqlParams3, ep.done("_query3"));
            Me.db.query(sqlCmd4, sqlParams4, ep.done("_query4"));
            Me.db.query(sqlCmd5, sqlParams5, ep.done("_query5"));
            Me.db.query(sqlCmd7, sqlParams7, ep.done("_query7"));
            ep.all("_query1", "_query2", "_query3", "_query4", "_query5", "_query7", function (result1, result2, result3, result4, result5, result7) {
                // console.log(result1)
                // console.log(result2)
                // console.log(result3)
                // console.log(result4)
                // console.log(result5)
                // console.log(result7)
                var topics = []
                var rec = {}
                var provincename = []
                for (var i = 0; i < result1.length; i++) {
                    var iData = result1[i]
                    if (!rec[iData.name]) {
                        rec[iData.name] = {
                            name: iData.name,
                            count1: iData.count,
                            count2: 0,
                            count3: 0,
                            count4: 0,
                            count5: 0,
                            fpcount: 0,
                            qdcount: 0,
                            qtcount: 0
                        }
                    }
                    provincename.push(iData.name)
                }
                for (var j = 0; j < result2.length; j++) {
                    var jData = result2[j]
                    if (!rec[jData.name]) {
                        rec[jData.name] = {
                            name: jData.name,
                            count1: 0,
                            count2: jData.count,
                            count3: 0,
                            count4: 0,
                            count5: 0,
                            fpcount: 0,
                            qdcount: 0,
                            qtcount: 0
                        }
                    } else {
                        rec[jData.name]['count2'] = jData.count
                    }
                    provincename.push(jData.name)
                }
                for (var p = 0; p < result3.length; p++) {
                    var pData = result3[p]
                    if (!rec[pData.name]) {
                        rec[pData.name] = {
                            name: pData.name,
                            count1: 0,
                            count2: 0,
                            count3: pData.count,
                            count4: 0,
                            count5: 0,
                            fpcount: 0,
                            qdcount: 0,
                            qtcount: 0
                        }
                    } else {
                        rec[pData.name]['count3'] = pData.count
                    }
                    provincename.push(pData.name)
                }
                for (var q = 0; q < result4.length; q++) {
                    var qData = result4[q]
                    if (!rec[qData.name]) {
                        rec[qData.name] = {
                            name: qData.name,
                            count1: 0,
                            count2: 0,
                            count3: 0,
                            count4: qData.count,
                            count5: 0,
                            fpcount: 0,
                            qdcount: 0,
                            qtcount: 0
                        }
                    } else {
                        rec[qData.name]['count4'] = qData.count
                    }
                    provincename.push(qData.name)
                }
                for (var k = 0; k < result5.length; k++) {
                    var kData = result5[k]
                    if (!rec[kData.name]) {
                        rec[kData.name] = {
                            name: kData.name,
                            count1: 0,
                            count2: 0,
                            count3: 0,
                            count4: 0,
                            count5: kData.count,
                            fpcount: 0,
                            qdcount: 0,
                            qtcount: 0
                        }
                    } else {
                        rec[kData.name]['count5'] = kData.count
                    }
                    provincename.push(kData.name)
                }
                for (var t = 0; t < result7.length; t++) {
                    var tData = result7[t]
                    if (!rec[tData.name]) {
                        rec[tData.name] = {
                            name: tData.name,
                            count1: 0,
                            count2: 0,
                            count3: 0,
                            count4: 0,
                            count5: 0,
                            fpcount: tData.fpcount,
                            qdcount: tData.qdcount,
                            qtcount: tData.qtcount
                        }
                    } else {
                        rec[tData.name]['fpcount'] = tData.fpcount
                        rec[tData.name]['qdcount'] = tData.qdcount
                        rec[tData.name]['qtcount'] = tData.qtcount
                    }
                    provincename.push(tData.name)
                }
                // rec = JSON.stringify(rec)
                // console.log(rec)
                var temp = []
                //省份名称去重
                provincename.sort()
                for (var m = 0; m < provincename.length; m++) {
                    if (temp.indexOf(provincename[m]) === -1) {
                        temp.push(provincename[m])
                    }
                }
                for (var o = 0; o < temp.length; o++) {
                    var oData = temp[o]
                    topics.push(rec[oData])
                }

                Me.cb(200, "", {
                    "totalCount": topics.length,
                    'topics': topics
                });
            })
        },

        //获取服务地址
        GetFileUrl: function () {
            var Me = this
            var url = settings.FileUrl

            Me.cb(200, null, url)
        },
        //导出运营统计报表
        exportOperationStatistics: function () {
            var Me = this
            var ep = new EventProxy()

            var province = Me.getParam('province')
            // var currentPage = Me.getParam('currentPage')
            // var pageSize = Me.getParam('pageSize') * 1
            var uploadtime_start = Me.getParam('uploadtime_start')
            var uploadtime_end = Me.getParam('uploadtime_end')

            var sqlCmd = 'select province.name,count(*) as count from ' +
                ' (select SUBSTRING(reportno, 9,4) as cd from files where 1=1 '
            var sqlCmd1 = sqlCmd
            var sqlCmd2 = sqlCmd
            var sqlCmd3 = sqlCmd
            var sqlCmd4 = sqlCmd
            var sqlCmd5 = sqlCmd
            var sqlCmd6 = ''
            var sqlCmd7 = 'select province.name,count(*) as count, ' +
                ' count(if(t1.invoice_type=1,true,null)) as fpcount, count(if(t1.invoice_type=2,true,null)) as qdcount, count(if(t1.invoice_type=3,true,null)) as qtcount ' + ' from ' +
                ' (select SUBSTRING(reportno, 9,4) as cd,invoice_type from files where 1=1 '
            var sqlParams1 = []
            var sqlParams2 = []
            var sqlParams3 = []
            var sqlParams4 = []
            var sqlParams5 = []
            var sqlParams7 = []
            var sqlWhere1 = ''
            var sqlWhere2 = ''
            var sqlWhere3 = ''
            var sqlWhere4 = ''
            var sqlWhere5 = ''
            var sqlWhere6 = ''
            var sqlWhere7 = ''

            if (uploadtime_start && uploadtime_end) {
                sqlWhere1 += ' and uploadtime >= ? and uploadtime <= ? '
                sqlWhere2 += ' and uploadtime >= ? and uploadtime <= ? '
                sqlWhere3 += ' and uploadtime >= ? and uploadtime <= ? '
                sqlWhere4 += ' and uploadtime >= ? and uploadtime <= ? '
                sqlWhere5 += ' and uploadtime >= ? and uploadtime <= ? '
                sqlWhere7 += ' and uploadtime >= ? and uploadtime <= ? '
                sqlParams1.push(uploadtime_start, uploadtime_end)
                sqlParams2.push(uploadtime_start, uploadtime_end)
                sqlParams3.push(uploadtime_start, uploadtime_end)
                sqlParams4.push(uploadtime_start, uploadtime_end)
                sqlParams5.push(uploadtime_start, uploadtime_end)
                sqlParams7.push(uploadtime_start, uploadtime_end)
            }

            sqlWhere1 += ' and status=0) t1 inner join province on t1.cd = province.citycode '
            sqlWhere2 += ' and status=1) t1 inner join province on t1.cd = province.citycode '
            sqlWhere3 += ' and status=2) t1 inner join province on t1.cd = province.citycode '
            sqlWhere4 += ' and status=4) t1 inner join province on t1.cd = province.citycode '
            sqlWhere5 += ' and sendback=1) t1 inner join province on t1.cd = province.citycode '
            sqlWhere7 += ' ) t1 inner join province on t1.cd = province.citycode '

            if (province) {
                sqlWhere1 += ' where province.code=? '
                sqlWhere2 += ' where province.code=? '
                sqlWhere3 += ' where province.code=? '
                sqlWhere4 += ' where province.code=? '
                sqlWhere5 += ' where province.code=? '
                sqlWhere7 += ' where province.code=? '
                sqlParams1.push(province)
                sqlParams2.push(province)
                sqlParams3.push(province)
                sqlParams4.push(province)
                sqlParams5.push(province)
                sqlParams7.push(province)
            }


            sqlCmd6 += ' group by province.name ORDER BY province.name '


            sqlCmd1 += sqlWhere1 += sqlCmd6
            sqlCmd2 += sqlWhere2 += sqlCmd6
            sqlCmd3 += sqlWhere3 += sqlCmd6
            sqlCmd4 += sqlWhere4 += sqlCmd6
            sqlCmd5 += sqlWhere5 += sqlCmd6
            sqlCmd7 += sqlWhere7 += sqlCmd6
            Me.db.query(sqlCmd1, sqlParams1, ep.done("_query1"));
            Me.db.query(sqlCmd2, sqlParams2, ep.done("_query2"));
            Me.db.query(sqlCmd3, sqlParams3, ep.done("_query3"));
            Me.db.query(sqlCmd4, sqlParams4, ep.done("_query4"));
            Me.db.query(sqlCmd5, sqlParams5, ep.done("_query5"));
            Me.db.query(sqlCmd7, sqlParams7, ep.done("_query7"));
            ep.all("_query1", "_query2", "_query3", "_query4", "_query5", "_query7", function (result1, result2, result3, result4, result5, result7) {
                // console.log(result1)
                // console.log(result2)
                // console.log(result3)
                // console.log(result4)
                // console.log(result5)
                // console.log(result7)
                var topics = []
                var rec = {}
                var provincename = []
                for (var i = 0; i < result1.length; i++) {
                    var iData = result1[i]
                    if (!rec[iData.name]) {
                        rec[iData.name] = {
                            name: iData.name,
                            count1: iData.count,
                            count2: 0,
                            count3: 0,
                            count4: 0,
                            count5: 0,
                            fpcount: 0,
                            qdcount: 0,
                            qtcount: 0
                        }
                    }
                    provincename.push(iData.name)
                }
                for (var j = 0; j < result2.length; j++) {
                    var jData = result2[j]
                    if (!rec[jData.name]) {
                        rec[jData.name] = {
                            name: jData.name,
                            count1: 0,
                            count2: jData.count,
                            count3: 0,
                            count4: 0,
                            count5: 0,
                            fpcount: 0,
                            qdcount: 0,
                            qtcount: 0
                        }
                    } else {
                        rec[jData.name]['count2'] = jData.count
                    }
                    provincename.push(jData.name)
                }
                for (var p = 0; p < result3.length; p++) {
                    var pData = result3[p]
                    if (!rec[pData.name]) {
                        rec[pData.name] = {
                            name: pData.name,
                            count1: 0,
                            count2: 0,
                            count3: pData.count,
                            count4: 0,
                            count5: 0,
                            fpcount: 0,
                            qdcount: 0,
                            qtcount: 0
                        }
                    } else {
                        rec[pData.name]['count3'] = pData.count
                    }
                    provincename.push(pData.name)
                }
                for (var q = 0; q < result4.length; q++) {
                    var qData = result4[q]
                    if (!rec[qData.name]) {
                        rec[qData.name] = {
                            name: qData.name,
                            count1: 0,
                            count2: 0,
                            count3: 0,
                            count4: qData.count,
                            count5: 0,
                            fpcount: 0,
                            qdcount: 0,
                            qtcount: 0
                        }
                    } else {
                        rec[qData.name]['count4'] = qData.count
                    }
                    provincename.push(qData.name)
                }
                for (var k = 0; k < result5.length; k++) {
                    var kData = result5[k]
                    if (!rec[kData.name]) {
                        rec[kData.name] = {
                            name: kData.name,
                            count1: 0,
                            count2: 0,
                            count3: 0,
                            count4: 0,
                            count5: kData.count,
                            fpcount: 0,
                            qdcount: 0,
                            qtcount: 0
                        }
                    } else {
                        rec[kData.name]['count5'] = kData.count
                    }
                    provincename.push(kData.name)
                }
                for (var t = 0; t < result7.length; t++) {
                    var tData = result7[t]
                    if (!rec[tData.name]) {
                        rec[tData.name] = {
                            name: tData.name,
                            count1: 0,
                            count2: 0,
                            count3: 0,
                            count4: 0,
                            count5: 0,
                            fpcount: tData.fpcount,
                            qdcount: tData.qdcount,
                            qtcount: tData.qtcount
                        }
                    } else {
                        rec[tData.name]['fpcount'] = tData.fpcount
                        rec[tData.name]['qdcount'] = tData.qdcount
                        rec[tData.name]['qtcount'] = tData.qtcount
                    }
                    provincename.push(tData.name)
                }
                // rec = JSON.stringify(rec)
                // console.log(rec)
                var temp = []
                //省份名称去重
                provincename.sort()
                for (var m = 0; m < provincename.length; m++) {
                    if (temp.indexOf(provincename[m]) === -1) {
                        temp.push(provincename[m])
                    }
                }
                for (var o = 0; o < temp.length; o++) {
                    var oData = temp[o]
                    topics.push(rec[oData])
                }

                if (topics.length > 0) {
                    var excel = []
                    var data = topics
                    for (var r = 0; r < data.length; r++) {
                        var count1 = data[i].count1
                        var count2 = data[i].count2
                        var count3 = data[i].count3
                        var count4 = data[i].count4
                        var count5 = data[i].count5
                        var fpcount = data[i].fpcount
                        var qdcount = data[i].qdcount
                        var qtcount = data[i].qtcount
                        if (count1 == 0) {
                            count1 = '0'
                        }
                        if (count2 == 0) {
                            count2 = '0'
                        }
                        if (count3 == 0) {
                            count3 = '0'
                        }
                        if (count4 == 0) {
                            count4 = '0'
                        }
                        if (count5 == 0) {
                            count5 = '0'
                        }
                        if (fpcount == 0) {
                            fpcount = '0'
                        }
                        if (qdcount == 0) {
                            qdcount = '0'
                        }
                        if (qtcount == 0) {
                            qtcount = '0'
                        }
                        excel.push({
                            '省份': data[i].name,
                            '待领取': count1,
                            '待处理': count2,
                            '待质检': count3,
                            '已完成': count4,
                            '发票数量': fpcount,
                            '清单数量': qdcount,
                            '其他': qtcount,
                            '退回数量': count5
                        });
                    }


                    var path = require('path');
                    var _employeePath = path.join(__dirname, '../../web/export_excel');
                    var filename = "运营统计导出";
                    _time = hcUti.formatDate(new Date(), "yyyyMMddhhmmss");
                    filename = filename + "_" + _time + ".xlsx";
                    var _fullPath = File.joinfilePath([_employeePath, filename])
                    XLSXWriter.write(_fullPath, excel, function (err) {
                        if (err) {
                            return cbError(50003, Me.cb);
                        } else {

                            var _data = {
                                filename: filename
                            }
                            File.prototype.deleteFile(_fullPath, 30000, function () { });
                            Me.cb(200, "导出成功", _data);
                        }
                    })
                } else {
                    Me.cb(300, "无可导数据", null);
                }
            })
        },

        //获取所有人员信息
        GetAllUser: function () {
            var Me = this;
            var userid = Me.getParam("userid");
            var sqlCmd = "select id,username,realname from users where role=2 and status=1 and deletestatus=0 and id!=?";
            var sqlParams = [userid];
            Me.db.query(sqlCmd, sqlParams, function (_err, result) {
                if (_err) {
                    return Me.cb(300, "数据异常", "");
                }
                else {
                    return Me.cb(200, "", result);
                }
            });
        },
        //任务统计报表
        GetTaskStatistics: function () {
            var Me = this
            var ep = new EventProxy()

            var userid = Me.getParam("userid")
            var uploadtime_start = Me.getParam('uploadtime_start')
            var uploadtime_end = Me.getParam('uploadtime_end')

            var sqlCmd1 = 'select users.realname, count(0) as count, sum(rows) as rowscount from (select userid,rows from files where 1=1 '
            var sqlCmd2 = 'select users.realname, count(0) as count, sum(rows) as rowscount from (select userid2,rows from files where 1=1 '
            var sqlCmd3 = ''
            var sqlParams1 = []
            var sqlParams2 = []
            var sqlWhere1 = ' and status in (2,3,4) '
            var sqlWhere2 = ' and status in (3,4) '

            if (uploadtime_start && uploadtime_end) {
                sqlWhere1 += ' and uploadtime>=? and uploadtime<=? '
                sqlWhere2 += ' and uploadtime>=? and uploadtime<=? '
                sqlParams1.push(uploadtime_start, uploadtime_end)
                sqlParams2.push(uploadtime_start, uploadtime_end)
            }
            sqlWhere1 += ' ) t1 inner join users on t1.userid= users.id '
            sqlWhere2 += ' ) t1 inner join users on t1.userid2= users.id '

            if (userid) {
                sqlWhere1 += ' where id=? '
                sqlWhere2 += ' where id=? '
                sqlParams1.push(userid)
                sqlParams2.push(userid)
            }
            sqlCmd3 += ' group by users.realname order by users.realname;'

            sqlCmd1 += sqlWhere1 += sqlCmd3
            sqlCmd2 += sqlWhere2 += sqlCmd3

            // console.log("sqlCmd1" + sqlCmd1)
            // console.log("sqlCmd2" + sqlCmd2)
            // console.log(sqlParams1)
            // console.log(sqlParams2)

            Me.db.query(sqlCmd1, sqlParams1, ep.done("_query1"));
            Me.db.query(sqlCmd2, sqlParams2, ep.done("_query2"));
            ep.all("_query1", "_query2", function (result1, result2) {
                // console.log(result1)
                // console.log(result2)
                var topics = []
                var rec = {}
                var temp = []
                var realname = []
                for (var i = 0; i < result1.length; i++) {
                    var iData = result1[i]
                    if (!rec[iData.realname]) {
                        rec[iData.realname] = {
                            realname: iData.realname,
                            count1: iData.count,
                            count2: 0,
                            rowscount1: iData.rowscount,
                            rowscount2: 0,
                        }
                    }
                    realname.push(iData.realname)
                }
                for (var j = 0; j < result2.length; j++) {
                    var jData = result2[j]
                    if (!rec[jData.realname]) {
                        rec[jData.realname] = {
                            realname: jData.realname,
                            count1: 0,
                            count2: jData.count,
                            rowscount1: 0,
                            rowscount2: jData.rowscount,
                        }
                    } else {
                        rec[jData.realname]['count2'] = jData.count
                        rec[jData.realname]['rowscount2'] = jData.rowscount
                    }
                    realname.push(jData.realname)
                }
                // console.log(rec)
                // console.log(realname)

                //姓名去重
                realname.sort()
                for (var m = 0; m < realname.length; m++) {
                    if (temp.indexOf(realname[m]) === -1) {
                        temp.push(realname[m])
                    }
                }
                for (var k = 0; k < temp.length; k++) {
                    var kData = temp[k]
                    topics.push(rec[kData])
                }

                Me.cb(200, "", {
                    "totalCount": topics.length,
                    'topics': topics
                });
            })
        },

        //加班任务统计
        GetOvertimeStatistics: function () {
            var Me = this
            var ep = new EventProxy()

            var userid = Me.getParam('userid')
            var uploadtime_start = Me.getParam('uploadtime_start')
            var uploadtime_end = Me.getParam('uploadtime_end')
            var pushtime = Me.getParam('pushtime')


            var sqlCmd1 = 'select users.realname, count(0) as count, sum(rows) as rowscount from (select userid,rows from files where 1=1  and status in (2,3,4) '
            var sqlCmd2 = 'select users.realname, count(0) as count, sum(rows) as rowscount from (select userid2,rows from files where 1=1  and status in (3,4) '
            var sqlCmd3 = ''
            var sqlParams1 = []
            var sqlParams2 = []
            var sqlWhere1 = ''
            var sqlWhere2 = ''
            if (uploadtime_start && uploadtime_end) {
                sqlWhere1 += ' and uploadtime>=? and uploadtime<=? '
                sqlWhere2 += ' and uploadtime>=? and uploadtime<=? '
                sqlParams1.push(uploadtime_start, uploadtime_end)
                sqlParams2.push(uploadtime_start, uploadtime_end)
            }
            if (pushtime) {
                sqlWhere1 += ' and (pushtime>=? and pushtime<=?) or (pushtime>=? and pushtime<=?) '
                sqlWhere2 += ' and (pushtime>=? and pushtime<=?) or (pushtime>=? and pushtime<=?) '
                sqlParams1.push(pushtime + ' 00:00:00', pushtime + ' 07:59:59', pushtime + ' 18:00:00', pushtime + ' 23:59:59')
                sqlParams2.push(pushtime + ' 00:00:00', pushtime + ' 07:59:59', pushtime + ' 18:00:00', pushtime + ' 23:59:59')
            }

            sqlWhere1 += ' ) t1 inner join users on t1.userid= users.id '
            sqlWhere2 += ' ) t1 inner join users on t1.userid2= users.id '
            if (userid) {
                sqlWhere1 += ' where id=? '
                sqlWhere2 += ' where id=? '
                sqlParams1.push(userid)
                sqlParams2.push(userid)
            }

            sqlCmd3 += ' group by users.realname order by users.realname;'
            sqlCmd1 += sqlWhere1 += sqlCmd3
            sqlCmd2 += sqlWhere2 += sqlCmd3
            // console.log(sqlCmd1)
            // console.log(sqlParams1)
            // console.log(sqlCmd2)
            // console.log(sqlParams2)

            Me.db.query(sqlCmd1, sqlParams1, ep.done("_query1"));
            Me.db.query(sqlCmd2, sqlParams2, ep.done("_query2"));
            ep.all("_query1", "_query2", function (result1, result2) {
                // console.log(result1)
                // console.log(result2)
                var topics = []
                var rec = {}
                var temp = []
                var realname = []
                for (var i = 0; i < result1.length; i++) {
                    var iData = result1[i]
                    if (!rec[iData.realname]) {
                        rec[iData.realname] = {
                            realname: iData.realname,
                            count1: iData.count,
                            count2: 0,
                            rowscount1: iData.rowscount,
                            rowscount2: 0
                        }
                    }
                    realname.push(iData.realname)
                }
                for (var j = 0; j < result2.length; j++) {
                    var jData = result2[j]
                    if (!rec[jData.realname]) {
                        rec[jData.realname] = {
                            realname: jData.realname,
                            count1: 0,
                            count2: jData.count,
                            rowscount1: 0,
                            rowscount2: jData.rowscount
                        }
                    } else {
                        rec[jData.realname]['count2'] = jData.count
                        rec[jData.realname]['rowscount2'] = jData.rowscount
                    }
                    realname.push(jData.realname)
                }
                // console.log(rec)
                // console.log(realname)

                //姓名去重
                realname.sort()
                for (var m = 0; m < realname.length; m++) {
                    if (temp.indexOf(realname[m]) === -1) {
                        temp.push(realname[m])
                    }
                }
                for (var k = 0; k < temp.length; k++) {
                    var kData = temp[k]
                    topics.push(rec[kData])
                }

                Me.cb(200, "", {
                    "totalCount": topics.length,
                    'topics': topics
                });
            })
        },

        //小程序案件列表查询
        AppletQuery: function () {
            var Me = this

            var caseId = Me.getParam("caseId")
            var reportno = Me.getParam("reportno")
            var page = Me.getParam('page')
            var pagesize = Me.getParam('pagesize') * 1

            var sqlCmd = "select * from files where 1 ";
            var sqlParams = [];
            var sqlWhere = "";
            sqlWhere += ' and ticketID=? '
            sqlParams.push(caseId)
            if(reportno) {
                sqlWhere += ' and reportno=? '
                sqlParams.push(reportno)
            }
            sqlCmd += sqlWhere += ' order by uploadtime desc limit ?,?;'
            sqlParams.push(page * pagesize, pagesize)
            Me.db.query(sqlCmd, sqlParams, function (err, results) {
                if(err) {
                    return Me.cb(300, "数据异常", "");
                } else {
                    return Me.cb(200, "查询成功", results)
                }
            })
        }
    }
}

async function saveBase64(image, now) {
    let imgFilename = "";
    try {
        imgFilename = await saveBase64Img(
            path.join(__dirname, '../../web/upload/images/', now),
            image
        );
    } catch (err) {
        imgFilename = "image base64 data error";
    }
    return imgFilename;
}

async function Typedocr(base64, ocrtype) {
    return new Promise(function (resolve, reject) {
        var params = {
            appKey: "inocr",
            appSecret: "QQyumwfMkFjdc4W7ro9DuQ1/EuYrsIQZKkG08XcMK7cVtJqyXLbpwv6bze44bXru/ksIdRo1Mx9A0IxhgHIwfw==",
            image: base64,
            type: ocrtype,
        }
        let reqUrl = "http://www.inocr.com.cn/api/typedocr";
        request.post({
            url: reqUrl,
            // url: "http://180.76.100.100:8889/typedocr",
            body: JSON.stringify(params),
            timeout: 3 * 60 * 1000,
            headers: {
                "Content-Type": "application/json"
            }
        },
            function (err, response, body) {
                if (err) {
                    resolve(err)
                }
                else {
                    resolve(body)
                }
            }
        );
    })
}