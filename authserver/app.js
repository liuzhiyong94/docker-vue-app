(function() {
    var app, cluster, express, http, i, numCPUs, path, routes, settings,os,_i,ipaddress;
    express = require('express');
    routes = require('./routes/routes');
    http = require('http');
    path = require('path');
    cluster = require('cluster');
    settings = require('./settings.js');
    numCPUs = 1;//require('os').cpus().length;
    settings.excelDir = path.join(__dirname, 'web/excel/');
    /* session模块 */
    // var session = require('express-session');
    // var RedisStore = require('connect-redis')(session);
    // var redis = require('redis');
    Date.prototype.Format = function(fmt)
  { //author: meizz
      var o = {
          "M+" : this.getMonth()+1,                 //月份
          "d+" : this.getDate(),                    //日
          "h+" : this.getHours(),                   //小时
          "m+" : this.getMinutes(),                 //分
          "s+" : this.getSeconds(),                 //秒
          "q+" : Math.floor((this.getMonth()+3)/3), //季度
          "S"  : this.getMilliseconds()             //毫秒
      };
      if(/(y+)/.test(fmt))
          fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
      for(var k in o)
          if(new RegExp("("+ k +")").test(fmt))
              fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
      return fmt;
  }
    // var AppMobileSys=require('./api/app/api.js');
    if (cluster.isMaster) {
        console.log('master');
        for (i = _i = 0; 0 <= numCPUs ? _i < numCPUs : _i > numCPUs; i = 0 <= numCPUs ? ++_i : --_i) {
            cluster.fork();
        }
        cluster.on('exit', function(worker) {
            console.log('Worker ' + worker.id + ' died :(');
            return cluster.fork();
        });
    } else {
        app = express();
        app.set('port',settings.serverPort);
        app.set('views', __dirname + 'web');
        app.set('view engine', 'html');
        var bodyParser = require('body-parser');
        app.use(bodyParser.json({limit:'50mb'}));
        app.use(bodyParser.urlencoded({limit:'50mb',extended:true}));
        app.use(express["static"](path.join(__dirname, 'web')));
         /* session模块 */
        // app.use(session({
        //     name: 'identityKey',
        //     secret: settings.redis.password,  // 用来对session id相关的cookie进行签名
        //     store: new RedisStore({
        //         client:redis.createClient(settings.redis)
        //     }),  // (使用redis的存储session)
        //     saveUninitialized: false,  // 是否自动保存未初始化的会话，建议false
        //     resave: false,  // 是否每次都重新保存会话，建议false
        //     cookie: {
        //         maxAge: settings.redis.maxage*60 * 1000  // 有效期，单位是毫秒, 这里设置的是10分钟
        //     }
        // }));
        routes(app);
        server = http.createServer(app).listen(app.get('port'), function () {
            return console.log('Express server listening on port ' + app.get('port'));
        });

    }
}).call(this);
