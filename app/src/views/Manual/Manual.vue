<template>
    <div style="width:100%;height:100%;" ref="main" id="main">
        <div ref="queryform">
            <el-form
                label-width="100px"
                style="padding: 10px 0;box-sizing:border-box;"
                :inline="true"
            >
                <el-form-item label="ticketID">
                    <el-input v-model="ListKeyword.ticketID"></el-input>
                </el-form-item>
                <el-form-item label="报案号">
                    <el-input v-model="ListKeyword.reportno"></el-input>
                </el-form-item>
                <el-form-item label="图片名称">
                    <el-input v-model="ListKeyword.filename"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="GetManualTask">查询</el-button>
                </el-form-item>
            </el-form>
        </div>
        <el-row ref="form" :style="style_form">
            <el-col :span="12" style="height:100%;">
                <iframe
                    id="show-iframe"
                    frameborder="0"
                    width="100%"
                    height="100%"
                    src="/#/Pic"
                    v-if="src"
                ></iframe>
            </el-col>
            <el-col :span="12" style="padding:20px;">
                <el-input type="textarea" :rows="20" v-model="content"></el-input>
                <div>
                    <el-input type="textarea" :rows="5" v-model="reinputremark" placeholder="补录原因" style="margin:20px 0;"></el-input>
                    <el-button type="primary" @click="Before_SuppleTask">补录</el-button>
                    <el-button type="primary" @click="Before_PushAgain">重推</el-button>
                </div>
            </el-col>
        </el-row>
    </div>
</template>

<script>
export default {
    name: "Manual",
    data() {
        return {
            src: "",
            style_form: "",
            ListKeyword: {
                ticketID: "",
                reportno: "",
                filename: "",
            },
            taskinfo: {},
            content: "",
            fileid: 0,
            reinputremark: "",
        };
    },
    created() {},
    mounted() {
        this.$store.commit("SetFilepath", "");
        this.$nextTick(() => {
            let h = this.$refs.main.offsetHeight;
            let h_queryform = this.$refs.queryform.offsetHeight;
            let h_main = h - 40 - h_queryform;
            this.style_form =
                "height:" + h_main + "px;overflow-y:auto;overflow-x:hidden;";
        });
    },
    methods: {
        async GetManualTask() {
            const loading = this.$loading({
                lock: true,
                text: "Loading",
                spinner: "el-icon-loading",
                background: "rgba(0, 0, 0, 0.7)",
            });
            try {
                let params = this.ListKeyword;

                let res = await window.axios.post("/api/GetManualTask", params);
                loading.close();
                if (res.code == 200) {
                    let data = res.data;
                    this.src = data.filepath;
                    this.fileid = data.id;
                    this.content = JSON.stringify(
                        JSON.parse(data.content),
                        null,
                        4
                    );
                    this.$store.commit("SetFilepath", this.src);
                } else {
                    this.$message({
                        message: res.msg,
                        type: "warning",
                    });
                }
            } catch (error) {
                loading.close();
                this.$message({
                    message: error,
                    type: "warning",
                });
            }
        },
        Before_SuppleTask() {
            this.$confirm("此操作将补录任务, 是否继续?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            })
                .then(() => {
                    this.SuppleTask();
                })
                .catch(() => {});
        },
        async SuppleTask() {
            const loading = this.$loading({
                lock: true,
                text: "Loading",
                spinner: "el-icon-loading",
                background: "rgba(0, 0, 0, 0.7)",
            });
            try {
                let params = {
                    fileid: this.fileid,
                    reinputremark: this.reinputremark,
                };

                let res = await window.axios.post("/api/SuppleTask", params);
                loading.close();
                if (res.code == 200) {
                    this.$message({
                        message: "补录成功",
                        type: "success",
                    });
                } else {
                    this.$message({
                        message: res.msg,
                        type: "warning",
                    });
                }
            } catch (error) {
                loading.close();
                this.$message({
                    message: error,
                    type: "warning",
                });
            }
        },
        Before_PushAgain() {
            this.$confirm("此操作将重推任务, 是否继续?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            })
                .then(() => {
                    this.PushAgain();
                })
                .catch(() => {});
        },
        async PushAgain() {
            const loading = this.$loading({
                lock: true,
                text: "Loading",
                spinner: "el-icon-loading",
                background: "rgba(0, 0, 0, 0.7)",
            });
            try {
                let params = {
                    ticketID: this.ListKeyword.ticketID,
                    content: JSON.stringify(JSON.parse(this.content)),
                    fileid: this.fileid,
                };

                let res = await window.axios.post("/api/PushAgain", params);
                loading.close();
                if (res.code == 200) {
                    this.$message({
                        message: "重推成功",
                        type: "success",
                    });
                } else {
                    this.$message({
                        message: res.msg,
                        type: "warning",
                    });
                }
            } catch (error) {
                loading.close();
                this.$message({
                    message: error,
                    type: "warning",
                });
            }
        },
    },
};
</script>
<style lang="scss">
.el-image-viewer__wrapper {
    position: absolute;
}
</style>
