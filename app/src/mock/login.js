import Mock from 'mockjs'

import Jwt from 'jsonwebtoken'

// 拓展mockjs
Mock.Random.extend({
    phone: function () {
        var phonePrefixs = ['132', '135', '189'] // 自己写前缀哈
        return this.pick(phonePrefixs) + Mock.mock(/\d{8}/) //Number()
    }
})

const mockData = {
    "username": "@first",
    "realname": "@cname",
    "mobile": "@phone",
    "no|0-100": 0,
    "role": 1
}

const JwtToken = Jwt.sign({
    "userinfo": mockData,
    "time": new Date().getTime()
}, 'WHHCXW2020', {
    expiresIn: '24h'
});

const data = {
    "code": 200,
    "msg": "",
    "data": { "userinfo": mockData, "JwtToken": JwtToken }
}

Mock.mock('/api/Wechat/Login', 'post', data)

export default Mock;