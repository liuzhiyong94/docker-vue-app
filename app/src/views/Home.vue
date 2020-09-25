<template>
  <div>
    <el-container direction="vertical" :style="style_header">
      <Header id="header"></Header>
      <el-container>
        <Aside :style="style_aside"></Aside>
        <router-view :style="style_main"></router-view>
      </el-container>
      <Footer id="footer"></Footer>
    </el-container>
  </div>
</template>

<script>
import Header from "../components/Header";
import Footer from "../components/Footer";
import Aside from "../components/Aside";
export default {
  name: "Home",
  components: {
    Header,
    Footer,
    Aside
  },
  data() {
    return {
      style_header: "",
      style_aside: "",
      style_main: ""
    };
  },
  created() {},
  mounted() {
    let h = document.documentElement.clientHeight || document.body.clientHeight;
    let header_h = document.getElementById("header").offsetHeight;
    let footer_h = document.getElementById("footer").offsetHeight;
    let aside_h = h - header_h - footer_h;
    this.style_header = "height:" + h + "px";
    this.style_aside = "height:" + aside_h + "px;overflow-y:auto;";
    this.style_main = "height:" + aside_h + "px;overflow-y:auto;";
  },
  methods: {}
};
</script>
<style lang="scss" scoped>
.el-main {
  padding: 0 !important;
}
</style>
