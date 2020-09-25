const EventProxy = require('eventproxy');
const settings = require('../../settings.js');
const hcUti = require('../libs/hcUti');
const path = require('path');
const queryData = require('../libs/queryData');
const saveBase64 = require('../libs/save-base64img');
const log4js = require('../libs/log4').log4js();
const md5 = require('md5-node');
async function typedocr(req, res) {
	var logger = log4js.getLogger('typedocr');
	var param = req.body;
	var cbObj = {
		code: 200,
		msg: 'success'
	};
	var type = param["type"];
	var image = param["image"];
	var ticketID = param["caseId"];
	var channelCode = param["channelCode"];
	if (param.appKey == "ctcc") {
		channelCode = "FJ30";
	}
	var imgName = param["imgName"];
	var appKey = param["appKey"];
	var appSecret = param["appSecret"];
	var reportno = param["reportno"];
	var filename = "";
	logger.info("param:", JSON.stringify({ type: type, caseId: ticketID, channelCode: channelCode, imgName: imgName, appKey: appKey, appSecret: appSecret, reportno: reportno }));
	if (settings.ctcc.appKey != appKey || settings.ctcc.appSecret != appSecret) {
		cbObj.code = 401;
		cbObj.msg = '授权失败';
		logger.error(JSON.stringify(cbObj));
		return res.send(cbObj);
	};
	if (!image || !ticketID || !imgName) {
		cbObj.code = 401;
		cbObj.msg = '参数缺失';
		logger.error(JSON.stringify(cbObj));
		return res.send(cbObj);
	}
	var SavePath = settings.SavePath;
	var now = hcUti.formatDate(new Date(), 'yyyy/MM/dd');
	var [err, result] = await saveBase64(SavePath + now, image);
	if (err) {
		cbObj.code = 300;
		cbObj.msg = '图片存储失败';
		logger.error(JSON.stringify(cbObj));
		return res.send(cbObj);
	}
	filename = result;
	var filepath = settings.FileUrl + "upload/images/" + now + "/" + filename;
	logger.info(JSON.stringify({ caseId: ticketID, imgName: imgName, filepath: filepath }));
	var uploadtime = hcUti.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss');
	var imgmd5 = md5(image).toUpperCase();
	var sqlCmd = "insert into files (filename,filepath,type,ticketID,uploadtime,channelCode,appKey,reportno,imgmd5) values (?,?,?,?,?,?,?,?,?);";
	var sqlParams = [imgName, filepath, type, ticketID, uploadtime, channelCode, appKey, reportno,imgmd5];
	var [err, result] = await queryData(sqlCmd, sqlParams);
	if (err) {
		cbObj.code = 300;
		cbObj.msg = '数据异常';
		logger.error(JSON.stringify(err));
		return res.send(cbObj);
	}
	cbObj["caseId"] = ticketID;
	logger.info(JSON.stringify(cbObj));
	return res.send(cbObj);
}
exports.typedocr = typedocr;
