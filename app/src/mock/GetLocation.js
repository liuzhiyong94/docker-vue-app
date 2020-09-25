import Mock from 'mockjs'

Mock.mock('/api/Wechat/GetLocation', 'post', options => {
    let currentPage = JSON.parse(options.body).currentPage;
    let pageSize = JSON.parse(options.body).pageSize;
    let total = 1000;
    let result = [];
    for (var i = 0; i < total; i++) {
        result.push(
            Mock.mock({
                "id|+1": i + 1,
                "city": "@city(true)",
                "zip": "@zip",
                "csentence": "@csentence",
            })
        )
    }
    result = result.splice(currentPage * pageSize, pageSize);
    let data = {
        "code": 200,
        "msg": "",
        "data": { "total": total, "topics": result }
    }
    return data;
})

export default Mock;