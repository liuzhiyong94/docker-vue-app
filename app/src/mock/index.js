/**
 * Mockjs数据生成规则
 * 
 * 1.重复指定的字符串string，重复次数min-max: 'name|min-max': string
 * 数据示例: {name: "mockjsmockjs"}, {name: "mockjsmockjsmockjsmockjsmockjsmockjs"}
 * 
 * 2.重复指定的字符串string，重复次数count: 'name|count': string
 * 数据示例: {name: "mockjsmockjs"}
 * 
 * 3.初始值为number，每次自动加1: 'name|+1': number
 * 数据示例: {name: 10}, {name: 11}, {name: 12}
 * 
 * 4.生成一个大于等于min、小于等于max的整数，属性值number只是用来确定类型: 'name|min-max': number
 * 数据示例: {name: 14}, {name: 62}, {name: 36}
 * 
 * 5.生成一个浮点数，整数部分大于等于min、小于等于max，小数部分保留dmin到dmax位: 'name|min-max.dmin-dmax': number
 * 数据示例: {name: 89.232}, {name: 9.3}, {name: 88.46}
 * 
 * 6.随机生成一个布尔值，值为 true 的概率是 1/2，值为 false 的概率同样是 1/2: 'name|1': boolean
 * 数据示例: {name: true}, {name: true}, {name: false}
 * 
 * 7.随机生成一个布尔值，值为value的概率是min/(min + max)，值为!value的概率是max/(min + max): 'name|min-max': value
 * 数据示例: {name: false}, {name: false}, {name: false}
 * 
 * 8.从对象object中随机选取count个属性: 'name|count': object
 * 
 * 9.从对象object中随机选取min到max个属性: 'name|min-max': object
 * 
 * 10.从数组array中随机选取1个元素，作为最终值: 'name|1': array
 * 
 * 11.从数组array中顺序选取1个元素，作为最终值: 'name|+1': array
 * 
 * 12.通过重复数组array生成一个新数组，重复次数大于等于min，小于等于max: 'name|min-max': array
 * 
 * 13.通过重复数组array生成一个新数组，重复次数为count: 'name|count': array
 * 
 * 14.执行函数function，取其返回值作为最终的属性值，函数的上下文为属性'name'所在的对象: 'name': function
 * 
 * 15.根据正则表达式regexp反向生成可以匹配它的字符串，用于生成自定义格式的字符串: 'name': regexp
 * 数据示例: {regexp: "zQ8"}, {regexp: "fN3"}, {regexp: "cR5"}
 * 
 * 16.数据占位符，占位符引用的是Mock.Random中的方法: "@cname", "@name", 
 * 
 * 17.let Random = Mock.Random; Random.ip()的功能等于@ip
 * 
 * 
 */

import Mock from 'mockjs'

const mockData1 = {
    'name|0-1': "mockjs"
}

const mockData2 = {
    'name|2': "mockjs"
}

const mockData3 = {
    'name|+1': 10
}

const mockData4 = {
    'name|0-100': 0
}

const mockData5 = {
    'name|1-100.1-3': 1
}

const mockData6 = {
    'name|1': true
}

const mockData7 = {
    'name|0-10': true
}

const mockData15 = {
    'regexp': /[a-z][A-Z][0-9]/
}

const mockData16 = {
    'cname': '@cname',
}

let Random = Mock.Random;

const mockData17 = {
    "ip": Random.ip(),
    "url": Random.url(),
    "province": Random.province(),
    "city": Random.city(),
    "city2": Random.city(true),
    "csentence": Random.csentence(),
    "date": Random.date('yyyy-MM-dd'),
    "time": Random.time()
}


Mock.mock('/testapi', 'post', mockData1)
Mock.mock('/testapi', 'post', mockData2)
Mock.mock('/testapi', 'post', mockData3)
Mock.mock('/testapi', 'post', mockData4)
Mock.mock('/testapi', 'post', mockData5)
Mock.mock('/testapi', 'post', mockData6)
Mock.mock('/testapi', 'post', mockData7)
Mock.mock('/testapi', 'post', mockData15)
Mock.mock('/testapi', 'post', mockData16)
Mock.mock('/testapi', 'post', mockData17)

export default Mock;