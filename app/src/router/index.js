import Vue from 'vue'
import VueRouter from 'vue-router'
import Util from "../plugins/util"

Vue.use(VueRouter)

// 解决ElementUI导航栏中的vue-router在3.0版本以上重复点菜单报错问题
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/pic',
    name: 'Task',
    component: () => import('../views/Pic/Pic.vue'),
    meta: {
      title: "图片",
      roles: ["*"]
    }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/Login.vue'),
    meta: {
      title: "登录",
      roles: ["*"]
    }
  },
  {
    path: '/home',
    name: 'home',
    component: () => import('../views/Home.vue'),
    meta: {
      title: "首页",
      roles: ["*"]
    },
    children: [
      {
        path: '/',
        name: 'Welcome',
        component: () => import('../views/Welcome.vue'),
        meta: {
          title: "欢迎",
          roles: ["*"]
        }
      },
      {
        path: '/task',
        name: 'Task',
        component: () => import('../views/Task/Task.vue'),
        meta: {
          title: "任务管理",
          roles: ["2"]
        }
      },
      {
        path: '/taskdetail',
        name: 'TaskDetail',
        component: () => import('../views/Task/TaskDetail.vue'),
        meta: {
          title: "任务管理详情",
          roles: ["2"]
        }
      },
      {
        path: '/alltask',
        name: 'AllTask',
        component: () => import('../views/AllTask/AllTask.vue'),
        meta: {
          title: "全部任务",
          roles: ["1"],
          keepAlive: true
        }
      },
      {
        path: '/alltaskdetail',
        name: 'AllTaskDetail',
        component: () => import('../views/AllTask/AllTaskDetail.vue'),
        meta: {
          title: "任务管理详情",
          roles: ["1"]
        }
      },
      {
        path: '/user',
        name: 'User',
        component: () => import('../views/User/User.vue'),
        meta: {
          title: "人员管理",
          roles: ["1"]
        }
      },
      {
        path: '/manual',
        name: 'Manual',
        component: () => import('../views/Manual/Manual.vue'),
        meta: {
          title: "人工处理",
          roles: ["1"]
        }
      },
      {
        path: '/upload',
        name: 'upload',
        component: () => import('../views/Upload/upload.vue'),
        meta: {
          title: "图片上传",
          roles: ["3", "4"]
        }
      },
      {
        path: '/uploadtask',
        name: 'uploadTask',
        component: () => import('../views/Upload/uploadTask.vue'),
        meta: {
          title: "图片上传列表",
          roles: ["3", "4"]
        }
      },
      {
        path: '/uploadtaskdetail',
        name: 'uploadTaskDetail',
        component: () => import('../views/Upload/uploadTaskDetail.vue'),
        meta: {
          title: "图片上传列表详情页",
          roles: ["3", "4"]
        }
      },
      {
        path: '/ReportFileTab',
        name: 'ReportFileTab',
        component: () => import('../views/ReportFile/ReportFileTab.vue'),
        meta: {
          title: "报表统计",
          roles: ["1"]
        }
      },
      {
        path: '/TaskStatistics',
        name: 'TaskStatistics',
        component: () => import('../views/ReportFile/TaskStatistics.vue'),
        meta: {
          title: "人员任务",
          roles: ["1"]
        }
      },
      {
        path: '/OvertimeStatistics',
        name: 'OvertimeStatistics',
        component: () => import('../views/ReportFile/OvertimeStatistics.vue'),
        meta: {
          title: "加班任务",
          roles: ["1"]
        }
      },
      {
        path: '/OperationStatistics',
        name: 'OperationStatistics',
        component: () => import('../views/ReportFile/OperationStatistics.vue'),
        meta: {
          title: "运营统计",
          roles: ["1"]
        }
      },
      {
        path: '/404',
        name: '404',
        component: () => import('../views/404.vue'),
        meta: {
          title: "404",
          roles: ["*"]
        }
      },
      {
        path: '*',
        name: '404',
        component: () => import('../views/404.vue'),
        meta: {
          title: "404",
          roles: ["*"]
        }
      }
    ]
  },
  {
    path: '*',
    redirect: '/404'
  }
]

const router = new VueRouter({
  // mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title;
  }




  const JwtToken = sessionStorage.getItem('JwtToken');
  if (!JwtToken && to.path !== '/login') {
    next('/login');
  }
  else if (to.path == '/404') {
    next();
  }
  else {
    // 权限管理
    if (to.meta.roles.indexOf("*") >= 0) {
      next();
    }
    else if (to.meta.roles.indexOf(JSON.parse(
      Util.uncompileStr(sessionStorage.getItem("UserInfo"))
    ).role + "") >= 0) {

      next();
    }
    else {
      next("/404");
    }
    // next();
  }
})

export default router
