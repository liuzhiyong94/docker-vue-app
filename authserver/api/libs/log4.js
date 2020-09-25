var log4js = require('log4js');
log4js.configure({
    appenders: {
        console: { type: 'console' },
        file: {
            type: 'file',
            filename: './web/logs/ocr.log',
            maxLogSize: 10 * 1024 * 1024, // = 10Mb
//                maxLogSize: 10 *  1024, // = 10Mb
            backups: 100
        },
        out: {  type: 'stdout' },
    },
    categories: {
        default: { appenders: ['file'], level: 'info' },
        worker: { appenders: ['out'], level: 'info' }
    }
});
exports.log4js=function(){
    return log4js;
}