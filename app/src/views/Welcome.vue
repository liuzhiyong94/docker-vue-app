<template>
  <el-image :src="src" class="img"></el-image>
</template>

<script>
export default {
  name: "Welcome",
  components: {},
  data() {
    return {
      src: require("../assets/welcome.jpg")
    };
  },
  methods: {}
};
</script>
<style lang="scss">
.img {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
