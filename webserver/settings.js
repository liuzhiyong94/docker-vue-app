(function () {
    module.exports = {
        cookie_secret: 'secret_meteoric',
        serverPort: 3100,
        privateKey: 'hcxwwhrb2019',
        mysql: {
            database: 'ocrnationalserviceplatform',
            host: 'mysql',  //指定yml文件中的mysql的名字
            user: 'root',
            password: '123456',
            port: 3306,
            connectionLimit: 120,
            multipleStatements: true
        },
        FileUrl: "http://47.116.76.208:3000/",
        FrontService: "http://authserver:3000/",
        tokenObj: {}
    };
}).call(this);

