<template>
  <div class="sidebar">
    <el-menu router :collapse="isCollapse" class="elmenu" :default-active="this.$route.path.substr(1)">
      <template v-for="item in filters">
        <template v-if="item.subs">
          <el-submenu :index="item.index" :key="item.index">
            <template slot="title">
              <i :class="item.icon"></i>
              <span slot="title">{{ item.title }}</span>
            </template>
            <template v-for="subItem in item.subs">
              <el-submenu v-if="subItem.subs" :index="subItem.index" :key="subItem.index">
                <template slot="title">{{ subItem.title }}</template>
              </el-submenu>
              <el-menu-item v-else :index="subItem.index" :key="subItem.index">
                <i :class="subItem.icon"></i>
                {{ subItem.title }}
              </el-menu-item>
            </template>
          </el-submenu>
        </template>
        <template v-else>
          <el-menu-item :index="item.index" :key="item.index">
            <i :class="item.icon"></i>
            <span slot="title">{{ item.title }}</span>
          </el-menu-item>
        </template>
      </template>
      <!-- 折叠面板 -->
      <template>
        <el-menu-item class="collapse" @click="Collapse">
          <i class="el-icon-d-arrow-left" v-show="!isCollapse"></i>
          <i class="el-icon-d-arrow-right" v-show="isCollapse"></i>
          <span>Collapse sidebar</span>
        </el-menu-item>
      </template>
    </el-menu>
  </div>
</template>

<script>
import Util from "../plugins/util";
export default {
  name: "Aside",
  components: {},
  data() {
    return {
      items: [
        // {
        //   index: "user",
        //   icon: "el-icon-s-custom",
        //   title: "人员管理",
        //   roles: ["*"],
        //   subs: [
        //     {
        //       index: "yf",
        //       icon: "el-icon-user",
        //       title: "研发部",
        //       roles: ["1"]
        //     },
        //     {
        //       index: "cp",
        //       icon: "el-icon-user",
        //       title: "产品部",
        //       roles: ["2"]
        //     }
        //   ]
        // },
        // {
        //   index: "location",
        //   icon: "el-icon-location",
        //   title: "位置管理",
        //   roles: ["*"]
        // }
        {
          index: "task",
          icon: "el-icon-s-platform",
          title: "任务管理",
          roles: ["2"]
        },
        {
          index: "alltask",
          icon: "el-icon-s-platform",
          title: "全部任务",
          roles: ["1"]
        },
        {
          index: "manual",
          icon: "el-icon-thumb",
          title: "人工处理",
          roles: ["1"]
        },
        {
          index: "user",
          icon: "el-icon-user-solid",
          title: "人员管理",
          roles: ["1"]
        },
        {
          index: "ReportFileTab",
          icon: "el-icon-s-order",
          title: "报表统计",
          roles: ["1"]
        },
        {
          index: "upload",
          icon: "el-icon-picture",
          title: "图片上传",
          roles: ["3", "4"]
        },
        {
          index: "uploadTask",
          icon: "el-icon-s-fold",
          title: "任务列表",
          roles: ["3", "4"]
        }
      ],
      role: "",
      isCollapse: false,
      sidebarWidth: "240px"
    };
  },
  created() {
    let role = JSON.parse(
      Util.uncompileStr(sessionStorage.getItem("UserInfo"))
    ).role.toString();
    this.role = role;
  },
  mounted() {
    document.querySelector(".sidebar").style.width = this.sidebarWidth;
  },
  methods: {
    filterMenu(arr) {
      return arr
        .filter(item => {
          return (
            item.roles.indexOf("*") >= 0 || item.roles.indexOf(this.role) >= 0
          );
        })
        .map(item => {
          item = Object.assign({}, item);
          if (item.subs) {
            item.subs = this.filterMenu(item.subs);
          }
          return item;
        });
    },
    Collapse() {
      this.isCollapse = !this.isCollapse;
      let el_submenu = document.querySelectorAll(".el-submenu span");
      let el_menu_item = document.querySelectorAll(".el-menu-item span");
      let el_submenu__icon_arrow = document.querySelectorAll(
        ".el-submenu__icon-arrow"
      );
      if (this.isCollapse) {
        for (let i = 0; i < el_submenu.length; i++) {
          el_submenu[i].style.display = "none";
        }
        for (let i = 0; i < el_menu_item.length; i++) {
          el_menu_item[i].style.display = "none";
        }
        for (let i = 0; i < el_submenu__icon_arrow.length; i++) {
          el_submenu__icon_arrow[i].style.display = "none";
        }
        document.querySelector(".sidebar").style.width = 64 + "px";
      } else {
        document.querySelector(".sidebar").style.width = this.sidebarWidth;
      }
    }
  },
  computed: {
    filters() {
      return this.filterMenu(this.items);
    }
  }
};
</script>
<style scoped>
.sidebar {
  /* width: 270px; */
  height: 100%;
  overflow-x: hidden;
  transition: 0.4s;
}
.sidebar >>> .elmenu {
  border: 0 !important;
  height: 100%;
  position: relative;
  overflow-x: hidden;
}
.sidebar >>> .collapse {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
}
.sidebar >>> .el-menu-item {
  text-align: left;
}
.sidebar >>> .el-submenu__title {
  text-align: left;
}
.sidebar >>> .el-menu-item{
  height: 48px;
  line-height: 48px;
}
.sidebar >>> .el-submenu__title{
  height: 48px;
  line-height: 48px;
}
</style>

