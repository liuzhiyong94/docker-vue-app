var EventProxy = require('eventproxy');
var schedule = require('node-schedule');
var settings = require('../../settings.js');
var _errors = require('../libs/errors');
var hcUti = require('../libs/hcUti');
var request = require('request');
var db = require('../libs/mysql.js')
var path = require('path');
var fs = require('fs');
var md5 = require('md5');
const queryData = require('../libs/queryData');
const requestData = require('../libs/requestData');
const uuid = require('uuid');
const wuhui = require('../libs/wth');
function init() {
	console.log('init');
	exchange_cards();
	setInterval(function() {
		syncHeadImg();
	}, 5000);

	syncPointsAndVip();
	setInterval(function() {
		syncPointsAndVip();
	}, 1 * 60 * 60 * 1000);

	fillpoints();
	schedule_task();

	// CreateCoupon();
	// setInterval(CreateCoupon, 5 * 60 * 1000);
	// setInterval(GiveOutCoupon, 1000);
	setInterval(GiveOutPoint, 1000);

	/**
	 * membersStock 数据初始化
	 * */
	 // inserMembersStock();
	
	/**
	 * 定时统计存量会员
	 * 每五分钟统计一次
	 * membersStock
	 * */
	 setInterval(function() {
		setMembersStock()
	 }, 1000 * 60 *5);
}
exports.init = init;

/**
 * 同步积分数量和会员等级
 * 1.查询积分等级配置表
 */
function syncPointsAndVip() {
	var ep = new EventProxy();
	var sql_getUsers = "select openid from publicuser where bindState=1;";
	var point_url = settings.pointServer + "getUserRemainPoints";
	var sql_getPoitsRule = "select * from viprule;";
	var ruleArr = [];
	var userArr = [];
	db.query(sql_getPoitsRule, [], function(err, result) {
		if (err || result[0].length == 0) return false;
		ruleArr = result;
		ep.emit('getUser');
	});
	ep.once('getUser', function() {
		db.query(sql_getUsers, [], function(err, result) {
			if (err) return false;
			if (result.length == 0) return false;
			userArr = result;
			ep.emit('doIt', 0);
		});
	});
	ep.on('doIt', function(index) {
		console.log('index:', index);
		if (index >= userArr.length) return console.log('over');
		var record = userArr[index];
		var openid = record.openid;
		request.post(point_url, {
			form: {
				openid: openid
			},
			json: true
		}, function(err, response, body) {
			console.log('body:', body);
			if (body && body.code == '200') {
				var pointsRemain = body['data']['0']['pointsRemain'];
				console.log('pointsRemain:', pointsRemain);
				var level = 1;
				for (var i = 0; i < ruleArr.length; i++) {
					if (pointsRemain >= ruleArr[i].minpoints) level = ruleArr[i].level;
				}
				ep.emit('updatePublicuser', index, level, pointsRemain, openid);
			} else {
				return ep.emit('doIt', ++index);
			}

		});
	});
	ep.on('updatePublicuser', function(index, level, pointsRemain, openid) {
		db.query('update publicuser set vipLevl=?,points=? where openid=?', [level, pointsRemain, openid], function(err,
			result) {
			if (err) return false;
			if (result.length == 0) return false;
			ep.emit('doIt', ++index);
		});
	});
}

/**
 * 同步微信头像
 */
function syncHeadImg() {
	var ep = new EventProxy();
	var tokenUrl = settings.wechatServer + "getTokenTemp";
	var sqk_getUser = "select * from publicuser where headImage='' limit 1;";
	var openid = "";
	var accessToken = "";
	db.query(sqk_getUser, [], function(err, result) {
		console.log(err, result);
		if (err) return false;
		if (result.length == 0) return false;
		openid = result[0].openid;
		return ep.emit('getToken');
	});
	ep.once('getToken', function() {
		request.post(tokenUrl, {
			json: true
		}, function(err, response, body) {
			console.log(err, body);
			if (body && body.data.accessToken) {
				accessToken = body.data.accessToken;
				return ep.emit('getImage');
			}
			return false
		});
	});
	ep.once('getImage', function() {
		var url = settings.wechat.wechatServer + "/cgi-bin/user/info?access_token=" + accessToken + "&openid=" + openid +
			"&lang=zh_CN";
		request.get(url, {
			json: true
		}, function(err, response, body) {
			console.log(err, body);
			if (body && body.subscribe == 0) {
				return ep.emit('update_1');
			}
			if (body && body.headimgurl == '') {
				return ep.emit('update_1');
			}
			if (body && body.headimgurl) {
				if (settings.wechat.wx_third) body.headimgurl = body.headimgurl.replace('http://thirdwx.qlogo.cn', settings.wechat
					.wx_third);
				return ep.emit('downloadImge', body.headimgurl);
			}
			return ep.emit('update_1');
		});
	});
	ep.once('update_1', function() {
		db.query('update publicuser set headImage=-1 where openid=?;', [openid], function(err, result) {
			if (err) return console.log(err);
			console.log("更新headurl完毕");
		})
	});
	ep.once('downloadImge', function(headimgurl) {
		var fileName = md5(openid) + '.jpg';
		var stream = fs.createWriteStream(settings.pictureFullUrl + fileName);
		request(headimgurl).pipe(stream).on("close", function(err) {
			if (err) return console.log(err);
			console.log("文件[" + fileName + "]下载完毕");
			db.query('update publicuser set headImage=? where openid=?;', [fileName, openid], function(err, result) {
				if (err) return console.log(err);
				console.log("更新headurl完毕");
			})
		});
	});
}

/**
 * 执行积分充值
 */
function fillpoints() {
	var ep = new EventProxy();
	// var sql_getRule="select * from pointsrule where state=1;";
	// var ruleObj={};
	// db.query(sql_getRule,[],function(err,result){
	//     if(err||result.length==0) return console.log('无需要充值的任务');
	//     for(var i=0;i<result.length;i++){
	//         ruleObj[result[i].id]=result[i];
	//     }
	//     ep.emit()
	// }); 
	var sql_getTask = "select * from pointasks where fillstate=0 limit 1;";
	var task = {};
	var createtime = new Date().getTime() + '';
	var today_time = hcUti;
	db.query(sql_getTask, [], function(err, result) {
		if (err || result.length == 0) {
			console.log('无需要充值的任务');
			return setTimeout(function() {
				fillpoints();
			}, 1000);
		}
		task = result[0];
		//特殊积分规则处理
		switch (task.pointsrule_id + "") {
			case "1":
				//pointsrule_id为1代表注册，注册积分同一openid只送一次
				ep.emit('check_points', 1);
				break;
			case "2":
				//pointsrule_id为2签到，一天只能充值一次，前端万一有并发出现多条记录，此时可以加以限制
				ep.emit('check_points', 2);
				break;
			case "3":
				//pointsrule_id为3推荐送积分，一般一个人最多送50次
				ep.emit('check_points', 3);
				break;
			default:
				ep.emit('do_fill');
				break;
		}
	});
	ep.once('check_points', function(d) {
		var sql_check = "select * from points where openid=? and pointsrule_id=? ";
		var timeCheck_start = hcUti.formatDate(new Date(task.createtime), 'yyyy-MM-dd 00:00:00'); //取该任务的签到时任务的创建时间
		var timeCheck_end = hcUti.formatDate(new Date(task.createtime), 'yyyy-MM-dd 23:59:59'); //取该任务的签到时任务的创建时间
		var sql_params = [task.openid, task.pointsrule_id];
		if (d == 2) {
			sql_check += " and createtime>= ? and createtime<=?;";
			sql_params.push(timeCheck_start, timeCheck_end);
		}
		db.query(sql_check, sql_params, function(err, result) {
			if (err) {
				console.log('check_points_err:', '报错');
				return setTimeout(function() {
					fillpoints();
				}, 1000);
			}
			if (d == 1) {
				if (result.length > 0) {
					return ep.emit('update_task', '注册积分重复充值');
				}
			}
			if (d == 2) {
				if (result.length > 0) {
					return ep.emit('update_task', '签到积分重复充值');
				}
			}
			if (d == 3) {
				if (result.length > 50) {
					return ep.emit('update_task', '推荐积分超过50个,不送了');
				}
			}
			return ep.emit('do_fill');
		})
	});
	ep.once('update_task', function(msg) {
		var sql_up = "update pointasks set fillstate=?,reason=?,filltime=? where id=?;";
		var sql_params = [1, msg, createtime, task.id];
		if (msg != 'success') {
			sql_params = [-1, msg, createtime, task.id];
		}
		db.query(sql_up, sql_params, function(err, result) {
			if (err) {
				console.log('update_task_err:', err);
			}
			return setTimeout(function() {
				fillpoints();
			}, 1000);
		})

	});
	ep.once('do_fill', function() {
		var sql_insert = "insert into points (openid,userid,areacode,insuredname,identifynumber,mobile,policyno" +
			",enddate,eventid,eventname,pointsrule_id,pointsrule_name,fillpoints,remainpoints,createtime,remark,reason" +
			",state) values(?,?,?,?,?,?,?," +
			"?,?,?,?,?,?,?,?,?,?," +
			"?)";
		var sql_params = [task.openid, task.userid, task.areacode, task.insuredname, task.identifynumber, task.mobile, task
			.policyno, task.enddate, task.eventid, task.eventname, task.pointsrule_id, task.pointsrule_name, task.fillpoints,
			task.fillpoints, createtime, task.remark, task.reason, 1
		];
		db.query(sql_insert, sql_params, function(err, result) {
			if (err) {
				console.log('do_fill_err:', err);
				return ep.emit('update_task', '执行充值时报错');
			}
			ep.emit('update_task', 'success');
		})
	})
}

/**
 * 生成优惠券
 */
function CreateCoupon() {
	var ep = new EventProxy();

	ep.once("createCoupon", function() {
		var charSet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		var num = 0; // 已执行数量
		var sum = 0; // 已成功数量
		for (var i = 0; i < 1000; i++) {
			var couponid = "";
			for (var n = 0; n < 12; n++) {
				var index = Math.floor(Math.random() * 1000) % 36;
				var char = charSet[index];
				couponid += char;
			}
			var sqlCmd = "insert into coupon(couponid)\n" +
				"values(?)";
			var sqlParams = [couponid];
			db.query(sqlCmd, sqlParams, function(err, result) {
				if (err) {
					console.log(err);
				} else {
					sum++;
				}
				num++;
				if (num == 1000) {
					console.log("CreateCoupon" + "_" + "操作结束" + "_" + sum + "\n");
				}
			});
		}
	});

	// 查询未发放优惠券数量
	var sqlCmd = "select * from coupon\n" +
		"where openid = ''";
	var sqlParams = [];
	db.query(sqlCmd, sqlParams, function(err, result) {
		if (err) {
			console.log(err);
		} else if (result.length > 1000) {
			console.log("CreateCoupon" + "_" + "数量充足" + "_" + result.length + "\n");
		} else {
			ep.emit("createCoupon");
		}
	});
}

/**
 * 分发优惠券
 */
function GiveOutCoupon() {
	var ep = new EventProxy();
	var plcPrdCode = "交强险";
	var autoTime = new Date().valueOf();

	// 回调函数
	ep.once("callBack", function(id, autoStatus) {
		var sqlCmd = "update policyno\n" +
			"set autoStatus = ?, autoTime = ?\n" +
			"where id = ?";
		var sqlParams = [autoStatus, autoTime, id];
		db.query(sqlCmd, sqlParams, function(err, result) {
			if (err) {
				console.log(err);
			} else if (result.affectedRows == 0) {
				console.log("GiveOutCoupon" + "_" + "回调无效" + "\n");
			} else {
				console.log("GiveOutCoupon" + "_" + "回调成功" + "\n");
			}
		});
	});

	// 发放优惠券
	ep.once("giveOut", function(id, openid, plcNo, plcEndDate) {
		// 查找手机号码
		var sqlCmd = "select * from publicuser\n" +
			"where openid = ?";
		var sqlParams = [openid];
		db.query(sqlCmd, sqlParams, function(err, result) {
			if (err) {
				console.log(err);
				ep.emit("callBack", id, "94");
			} else if (result.length == 0) {
				ep.emit("callBack", id, "7");
			} else {
				var mobile = result[0].mobile;
				var date = new Date(plcEndDate * 1); // 有效期
				var Y = date.getFullYear();
				var M = date.getMonth() + 2 < 10 ? "0" + (date.getMonth() + 2) : "" + (date.getMonth() + 2);
				if (M == "13") {
					M = "01";
					Y += 1;
				}
				var validityTime = new Date(Y + "-" + M + "-01 23:59:59").valueOf() - 1 * 24 * 60 * 60 * 1000;
				// 赠送第一张优惠券
				var sqlCmd = "update coupon\n" +
					"set openid = ?, mobile = ?, giveOutTime = ?, validityTime = ?, couponCate = '1', useStatus = '0'\n" +
					"where openid = ''\n" +
					"limit 1";
				var sqlParams = [openid, mobile, autoTime, validityTime];
				db.query(sqlCmd, sqlParams, function(err, result) {
					if (err) {
						console.log(err);
						ep.emit("callBack", id, "2");
					} else if (result.affectedRows == 0) {
						ep.emit("callBack", id, "3");
					} else {
						// 赠送第二张优惠券
						var sqlCmd = "update coupon\n" +
							"set openid = ?, mobile = ?, giveOutTime = ?, validityTime = ?, couponCate = '2', useStatus = '0'\n" +
							"where openid = ''\n" +
							"limit 1";
						var sqlParams = [openid, mobile, autoTime, validityTime];
						db.query(sqlCmd, sqlParams, function(err, result) {
							if (err) {
								console.log(err);
								ep.emit("callBack", id, "4");
							} else if (result.affectedRows == 0) {
								ep.emit("callBack", id, "5");
							} else {
								ep.emit("callBack", id, "1");
							}
						});
					}
				});
			}
		});
	});

	// 排除优惠券赠送重复
	ep.once("checkHistory", function(id, openid, plcNo, plcEndDate) {
		var sqlCmd = "select * from policyno\n" +
			"where plcNo = ? and id != ? and autoStatus != '' and autoStatus != '8'";
		var sqlParams = [plcNo, id];
		db.query(sqlCmd, sqlParams, function(err, result) {
			if (err) {
				console.log(err);
				ep.emit("callBack", id, "93");
			} else if (result.length > 0) {
				ep.emit("callBack", id, "8");
			} else {
				ep.emit("giveOut", id, openid, plcNo, plcEndDate);
			}
		});
	});

	// 排除事件并发性重复
	ep.once("checkProxy", function(id, openid, plcNo, plcEndDate) {
		var sqlCmd = "update policyno\n" +
			"set autoStatus = '8', autoTime = ?\n" +
			"where plcNo = ? and id != ? and autoStatus = ''";
		var sqlParams = [autoTime, plcNo, id];
		db.query(sqlCmd, sqlParams, function(err, result) {
			if (err) {
				console.log(err);
				ep.emit("callBack", id, "91");
			} else {
				var sqlCmd = "update policyno\n" +
					"set autoStatus = '0', autoTime = ?\n" +
					"where id = ? and autoStatus = ''";
				var sqlParams = [autoTime, id];
				db.query(sqlCmd, sqlParams, function(err, result) {
					if (err) {
						console.log(err);
						ep.emit("callBack", id, "92");
					} else if (result.affectedRows == 0) {
						console.log("GiveOutCoupon" + "_" + "已被处理" + "\n");
					} else {
						ep.emit("checkHistory", id, openid, plcNo, plcEndDate);
					}
				});
			}
		});
	});

	// 排除已处理保单
	ep.once("checkHandled", function(id, openid, plcNo, plcEndDate) {
		var sqlCmd = "select * from policyno\n" +
			"where plcNo = ? and autoStatus != ''";
		var sqlParams = [plcNo];
		db.query(sqlCmd, sqlParams, function(err, result) {
			if (err) {
				console.log(err);
			} else if (result.length > 0) {
				console.log("GiveOutCoupon" + "_" + "重复保单" + "\n");
				ep.emit("callBack", id, "8");
			} else {
				ep.emit("checkProxy", id, openid, plcNo, plcEndDate);
			}
		});
	});

	// 查找保单
	var sqlCmd = "select * from policyno\n" +
		"where plcPrdCode = ? and autoStatus = ''\n" +
		"order by bindTime\n" +
		"limit 1";
	var sqlParams = [plcPrdCode];
	db.query(sqlCmd, sqlParams, function(err, result) {
		if (err) {
			console.log(err);
		} else if (result.length == 0) {
			console.log("GiveOutCoupon" + "_" + "无新纪录" + "\n");
		} else {
			ep.emit("checkHandled", result[0].id, result[0].openid, result[0].plcNo, result[0].plcEndDate);
		}
	});
}

/**
 * 赠送积分
 */
function GiveOutPoint() {
	var ep = new EventProxy();
	var id       = "";
	var plcNo    = "";
	var openid   = "";
	var realname = "";
	var idCard   = "";
	var mobile   = "";
	var pdate    = "";
	var pid      = "";
	var pname    = "";
	var pnum     = 0;
	var autoTime = new Date().valueOf();

	// 回调函数
	ep.once("callBack", function(autoStatus) {
		var sqlCmd = "update policyno\n" +
					"set autoStatus = ?, autoTime = ?\n" +
					"where id = ?";
		var sqlParams = [autoStatus, autoTime, id];
		db.query(sqlCmd, sqlParams, function(err, result) {
			if(err) {
				console.log(err);
			} else if(result.affectedRows == 0) {
				console.log("GiveOutPoint" + "_" + "回调失败" + "\n");
			} else {
				console.log("GiveOutPoint" + "_" + "回调成功" + "\n");
			}
		});
	});

	// 充值积分
	ep.once("fillPoints", function() {
		var sqlCmd = "insert into pointasks(openid, userid, areacode, insuredname, identifynumber, mobile, enddate, " +
					"pointsrule_id, pointsrule_name, fillpoints, createtime, fillstate)\n" +
					"values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
		var sqlParams = [openid, "-101", "410100", realname, idCard, mobile, pdate, pid, pname, pnum, autoTime, "0"];
		db.query(sqlCmd, sqlParams, function(err, result) {
			if(err) {
				console.log(err);
				ep.emit("callBack", "2");
			} else {
				ep.emit("callBack", "1");
			}
		});
	});

	// 获取被充值者信息
	ep.once("getUser", function() {
		var sqlCmd = "select * from publicuser\n" +
					"where openid = ?";
		var sqlParams = [openid];
		db.query(sqlCmd, sqlParams, function(err, result) {
			if(err) {
				console.log(err);
				ep.emit("callBack", "95");
			} else if(result.length == 0) {
				ep.emit("callBack", "5");
			} else {
				realname = result[0].realname;
				idCard   = result[0].idCard;
				mobile   = result[0].mobile;
				ep.emit("fillPoints");
			}
		});
	});

	// 获取赠送积分详情
	ep.once("getNum", function() {
		var sqlCmd = "select * from pointsrule\n" +
					"where pname = ?";
		var sqlParams = [pname];
		db.query(sqlCmd, sqlParams, function(err, result) {
			if(err) {
				console.log(err);
				ep.emit("callBack", "94");
			} else if(result.length == 0) {
				ep.emit("callBack", "4");
			} else if(result[0].state == "0") {
				ep.emit("callBack", "3");
			} else {
				if(result[0].ynum == "0") {
					pdate = "0";
				} else {
					pdate = autoTime + result[0].ynum * 24 * 60 * 60 * 1000;
				}
				pid  = result[0].pid;
				pnum = result[0].pnum;
				ep.emit("getUser");
			}
		});
	});

	// 排除积分赠送重复
	ep.once("checkHistory", function() {
		var sqlCmd = "select * from policyno\n" +
					"where plcNo = ? and id != ? and autoStatus != '' and autoStatus != '8'";
		var sqlParams = [plcNo, id];
		db.query(sqlCmd, sqlParams, function(err, result) {
			if(err) {
				console.log(err);
				ep.emit("callBack", "93");
			} else if(result.length > 0) {
				ep.emit("callBack", "8");
			} else {
				ep.emit("getNum");
			}
		});
	});

	// 排除事件并发性重复
	ep.once("checkProxy", function() {
		var sqlCmd = "update policyno\n" +
					"set autoStatus = '8', autoTime = ?\n" +
					"where plcNo = ? and id != ? and autoStatus = ''";
		var sqlParams = [autoTime, plcNo, id];
		db.query(sqlCmd, sqlParams, function(err, result) {
			if(err) {
				console.log(err);
				ep.emit("callBack", "91");
			} else {
				var sqlCmd = "update policyno\n" +
							"set autoStatus = '0', autoTime = ?\n" +
							"where id = ? and autoStatus = ''";
				var sqlParams = [autoTime, id];
				db.query(sqlCmd, sqlParams, function(err, result) {
					if(err) {
						console.log(err);
						ep.emit("callBack", "92");
					} else if(result.affectedRows == 0) {
						console.log("GiveOutPoint" + "_" + "已被处理" + "\n");
					} else {
						ep.emit("checkHistory");
					}
				});
			}
		});
	});

	// 排除已处理保单
	ep.once("checkHandled", function() {
		var sqlCmd = "select * from policyno\n" +
					"where plcNo = ? and autoStatus != ''";
		var sqlParams = [plcNo];
		db.query(sqlCmd, sqlParams, function(err, result) {
			if(err) {
				console.log(err);
			} else if(result.length > 0) {
				console.log("GiveOutPoint" + "_" + "重复保单" + "\n");
				ep.emit("callBack", "8");
			} else {
				ep.emit("checkProxy");
			}
		});
	});

	// 查找保单
	var sqlCmd = "select * from policyno\n" +
				"where autoStatus = ''\n" +
				"order by bindTime\n" +
				"limit 1";
	var sqlParams = [];
	db.query(sqlCmd, sqlParams, function(err, result) {
		if(err) {
			console.log(err);
		} else if(result.length == 0) {
			console.log("GiveOutPoint" + "_" + "无新纪录" + "\n");
		} else {
			id     = result[0].id;
			plcNo  = result[0].plcNo;
			openid = result[0].openid;
			if(result[0].plcPrdCode == "交强险") {
				pname = "绑定交强险保单送积分";
			} else {
				pname = "绑定商业险保单送积分";
			}
			ep.emit("checkHandled");
		}
	});
}

function schedule_task() {
	console.log("执行定时方法")
	//dayOfWeek
	//month
	//dayOfMonth
	//hour
	//minute
	//second
	//每周二的下午23：59 : 59触发，其它组合可以根据我代码中的注释参数名自由组合
	schedule.scheduleJob({
		hour: 23,
		minute: 59,
		second: 59,
		dayOfWeek: 3
	}, function() {
		console.log("执行任务,", hcUti.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'));
		updatePublicUser()
	});
}

function updatePublicUser() {
	var sql = "UPDATE publicuser SET memberday_drawnum = '1' WHERE memberday_drawnum = '0';";
	db.query(sql, [], function(err, result) {
		if (err) {
			console.log(err);
			return false
		} else {
			console.log('result', result.length);
			return true;
		}
	});

}

/**
 * 每年得12月31号23:59:59
 * 新增一年得初始记录
 * 
 * */
function inserMembersStock(){
	schedule.scheduleJob({
		month: 12,
		dayOfMonth:31,
		hour: 23,
		minute: 59,
		second: 59,
	}, function() {
		console.log("执行任务,", hcUti.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'));
		inserMembersStockInit()
	});
}
 
function inserMembersStockInit(){
	var sql = " INSERT INTO membersStock ( cityname, YEAR )  SELECT cityname, LEFT (now(),4) + 1  as year from membersCity";
	db.query(sql, [], function(err, result) {
	 	if (err) {
	 		console.log(err);
	 		return false
	 	} else {
	 		console.log('result', result.length);
	 		return true;
	 	}
	});
 }

/**
 * 更新存量会员得数量
 * 
 * 
 * */
function setMembersStock(){
	
	var sql_oldData = " select if ( cityname = '', '未知', cityname ) AS cityname,count(*) AS num from publicuser where bindState = '1' GROUP BY  cityname  UNION ALL select '合计' AS cityname, count(*) AS num  from  publicuser where bindState = '1' ;";
		
	db.query(sql_oldData, [], function(err, result) {
	     if (err) {
	         return ("同步异常")
	     }else{
	        updatMembersStock(result)
	     }
	
	 });
}

function updatMembersStock(_result){
	var month = new Date().getMonth()+1;
		if(month < 10){
			month = "0" + month
		}
	var sqlCmd = "";
	for(var i = 0; i<_result.length ; i++){
		sqlCmd+="update membersStock set m"+month +" = "+ _result[i].num +  " where year = 2020 and cityname = '"  +  _result[i].cityname   + "' ;";
		
	}
	db.query(sqlCmd, function(err, result) {
	     if (err) {
	         return ("同步异常")
	     }else{
	       console.log("更新membersStock数据成功")
	     }
	
	 });
	
};

/**
 * 周三会员日  将一等奖，二等奖，三等奖分别兑换成 12001心语鲜花、F1001听书月卡、G5101蟹卡抵扣券
 */
async function exchange_cards(){
	function doNext(){
		setTimeout(function(){
			exchange_cards();
		},5*1000);
	}
	async function upDraw(id,d){
		var sql_cmd="update memberday_drawrecord set state=? where id=?;";
		var sql_params=[d,id];
		var [err,result] = await queryData(sql_cmd,sql_params);
		return -1;
	}
	async function upWh(obj,state){	
		var sql_cmd="update wuhui_ticket set errMsg=? ";
		var sql_where=" where serialNo=?;";
		var sql_params=[state];
		if(state=="success"){
			sql_cmd+=",couponSn=?,startDate=?,endDate=?,releaseTime=?";
			sql_params.push(obj.couponSn,obj.startDate,obj.endDate,obj.startDate);
		}
		sql_cmd+=sql_where;
		sql_params.push(obj.serialNo);
		var [err,result] = await queryData(sql_cmd,sql_params);
		return 1
	}
	function dealMsg(str){
		//var str='{"code":0,"msg":"success","url":"http:\/\/www.weallway.com\/magic\/wu\/mobile\/tb\/bind.html?key=e7ac8f88c7c621fcff7b51b23f00f335iZaP56-Que5El6hKLQ0GUDDn9H1bEHHvjyCkMg3trefdUOCwiDGkl3tIgJQtHcFD7dTDeVXjfraT5PPaYyBEaYNsx9iO2xI-zg08y7t4qjLx-ufBQSD0wFomBroFyJ7-JKQDm92csgXD_Yz5ose_H8bz0d8YZeuOrecgm-SMW9A."}|B2AF8627C1A58899FCDE2E0791C5FAB1';
		var str_0=str.split('|')[0];
		try{
			var obj=JSON.parse(str_0);
		}catch(err){
			return 'fail'
		}
		return obj;
	}
	var productsObj={};
	var productsArr=[];
	var products=settings.wth.products;
	for(var i=0;i<products.length;i++){
		Object.assign(productsObj,products[i]);//对象合并成一个
		productsArr.push(Object.keys(products[i])[0]);//将key合成一个对象
	}
	// console.log('productsArr:',productsArr);
	// console.log('productsObj:',productsObj);
	var sql_cmd="select * from memberday_drawrecord where grade in(?) and iswin=1  and state=0 limit 1;";
	var sql_params=[productsArr];
	var [err,result] = await queryData(sql_cmd,sql_params);
	if(err||result.length==0)  return doNext();
	var userObj=result[0];
	if(!productsObj[userObj.grade]){
		await upDraw(userObj.id,-1);
		return doNext();
	}
	var serialNo=uuid.v1();
	var sql_cmd="insert into wuhui_ticket (openid,allocateTime,serialNo,proCode,proName,drawID) values (?,?,?,?,?,?);";
	var sql_params=[userObj.openid,userObj.drawdate,serialNo,userObj.grade,productsObj[userObj.grade],userObj.id];
	var [err1,result1] = await queryData(sql_cmd,sql_params);
	if(err1){
		await upDraw(userObj.id,-1);
		return doNext();
	}
	//执行兑换
	var url_dh=settings.wth.url_wh+"/magic/wu/a/hntb/pkg.html";
	var timeNow=new Date();
	var time_90=timeNow.getTime()+90*24*60*60*1000
	var start_time= hcUti.formatDate(timeNow,"yyyy-MM-dd hh:mm:ss");
	var end_time=hcUti.formatDate(new Date(time_90),"yyyy-MM-dd hh:mm:ss");
	var postData = {
		"source": settings.wth.source,
		"serialNo":serialNo,
		"proCode": userObj.grade,
		"startTime": start_time,
		"endTime": end_time,
		"channel": settings.wth.channel
	};
	console.log('postData:',postData); 
	var cbObj=await wuhui.wh_face(url_dh,postData);
	console.log('cbObj1:',cbObj);
	cbObj=dealMsg(cbObj);
	if(cbObj=='fail'||cbObj.code!=0){
		console.log('dealMsgFail');
		var m=cbObj.msg||'dealMsgFail';
		await upWh({serialNo:serialNo},m);
		await upDraw(userObj.id,-1);
		return doNext();
	}else{
		var card=cbObj.cardList[0];
		await upWh({serialNo:serialNo,couponSn:card.couponSn,startDate:card.startDate,endDate:card.endDate},'success');
		await upDraw(userObj.id,1);
		return doNext();
	}

}