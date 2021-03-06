(function () {
    var app, cluster, express, http, i, numCPUs, path, routes, settings, os, _i, ipaddress;
    express = require('express');
    routes = require('./routes/routes');
    http = require('http');
    path = require('path');
    cluster = require('cluster');
    settings = require('./settings.js');
    // numCPUs = require('os').cpus().length;
    numCPUs = 1;

    var multipart = require('connect-multiparty');

    var session = require('express-session');
    var MySQLStore = require('express-mysql-session')(session);
    var sessionStore = new MySQLStore(settings.mysql);
    settings.excelDir = path.join(__dirname, 'web/excel/');
    var mapi = require('./api/ManageSystem/ManageSystemApi');

    if (cluster.isMaster) {
        console.log('master');
        for (i = _i = 0; 0 <= numCPUs ? _i < numCPUs : _i > numCPUs; i = 0 <= numCPUs ? ++_i : --_i) {
            cluster.fork();
        }
        cluster.on('exit', function (worker) {
            console.log('Worker ' + worker.id + ' died :(');
            return cluster.fork();
        });
    } else {
        app = express();
        app.set('port', settings.serverPort);
        app.set('views', __dirname + 'web');
        app.set('view engine', 'html');
        var bodyParser = require('body-parser');
        var cookieParser = require('cookie-parser');
        app.use(bodyParser.json({ limit: '50mb' }));
        app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
        app.use(multipart());
        app.use(cookieParser('sessiontest'));
        app.use(session({
            key: 'session_cookie_name',
            secret: 'sessiontest',
            store: sessionStore,
            cookie: {
                maxAge: 60 * 1000 * 60 * 24
            },
            resave: false,
            saveUninitialized: false
        }));
        app.use(express["static"](path.join(__dirname, 'web')));
        app.all('*', function (req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "X-Requested-With");
            res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
            res.header("X-Powered-By", ' 3.2.1')
            res.header("Content-Type", "application/json;charset=utf-8");
            next();
        });
        routes(app);
        var server = http.createServer(app);
        server.setTimeout(0);
        http.createServer(app).listen(app.get('port'), function () {
            var consoleDay = new Date();
            var consoleDayStr = consoleDay.getFullYear() + '-' + (consoleDay.getMonth() + 1) + '-' +
                consoleDay.getDate() + ' ' + consoleDay.getHours() + ":" +
                consoleDay.getMinutes() + ":" + consoleDay.getSeconds();
                mapi.syncTokens(function(){
                    return console.log('服务器启动 - 端口:[' + app.get('port') + '] 时间:[' + consoleDayStr + ']');
                })
            
        });
    }
}).call(this);

