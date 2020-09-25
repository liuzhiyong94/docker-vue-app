<template>
    <el-image :src="src" fit="contain" :preview-src-list="srcList" style="width:100%;height:100%;"></el-image>
</template>

<script>
export default {
    name: "Pic",
    data() {
        return {
            src: "",
            srcList: [],
        };
    },
    created() {
        this.src = this.$store.state.filepath;
        this.srcList = [this.$store.state.filepath];
    },
    mounted() {},
    methods: {},
};
</script>
<style lang="scss">
</style>
