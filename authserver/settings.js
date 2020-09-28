(function () {
    module.exports = {
        cookie_secret: 'secret_meteoric',
        serverPort: 3000,
        privateKey: 'hcxwwhrb2019',
        mysql: {
            database: 'ocrnationalserviceplatform',
            host: 'mysql',
            user: 'root',
            password: '123456',
            port: 3306,
            connectionLimit: 120,
            multipleStatements: true
        },
        "ctcc": {
            "appKey": "ctcc",
            "appSecret": "M023Xwsif+62TRLVlSy/x6hC+jlrDCV62Fe9etDGHURsThAst/otkzOfvRaVoZ34nfkPJTXrYlGogtDUuesNCw==",
            "description": "中国电信政企客户部保险行业OCR平台",
            "signaturePlain": "insurance@china.telecom",
            "typeList": ["*"],
            "allow": true,
            "ipRestriction": false,
            "ipAllowed": "",
            "limitConcurrency": 0,
            "limitPerDay": 0,
            "limitPerMonth": 0
        },
        SavePath: "/home/authserver/web/upload/images/",
        FileUrl: "http://47.116.76.208:3000/"
    };
}).call(this);
