(function() {
    var errors;
    errors = {
        200:{
            name: 'success',
            message: ''
        },
        400020:{
            name: 'token error',
            message: 'token 错误'
        },
        400021:{
            name: 'token',
            message: 'token 过期'
        },
        40001: {
            name: 'login error',
            message: '用户名或密码有误'
        },
        40002:{
            name: 'miss parameter',
            message: '缺乏参数'
        },
        40003:{
            name: 'error parameter',
            message: '参数错误'
        },
        40004:{
            name: 'error user',
            message: '该用户不存在'
        },
        40005:{
            name: 'error area',
            message: '该用户所属机构异常'
        },
        40006:{
            name: 'error state',
            message: '该任务状态异常'
        },
        50001: {
            name: 'interface error',
            message: '接口错误'
        },
        50002: {
            name: 'sign error',
            message: '签名错误'
        },
        50003: {
            name: 'data error',
            message: '数据异常'
        },
        50004: {
            name: 'no order',
            message: '任务号不存在'
        },
        50005: {
            name: 'task state wrong',
            message: '任务状态错误'
        },
        50006: {
            name: 'no login',
            message: '未登录'
        },
        NoFileExist: {
            name: 'NoFileExist',
            message: '文件不存在'
          }
    };

    module.exports = errors;

}).call(this);