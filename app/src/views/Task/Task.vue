<template>
    <div style="width:100%;height:100%;" ref="main" id="main">
        <el-form label-width="50px" ref="queryform" style="padding: 10px 0;box-sizing:border-box;">
            <!-- <el-row>
                <el-col :span="6">
                    <el-form-item label="姓名">
                        <el-input size="medium" class="el-input-small"></el-input>
                    </el-form-item>
                </el-col>
            </el-row>-->
            <el-row>
                <el-col :span="2">
                    <el-button type="success" round @click="GetTasksOne">当前任务</el-button>
                </el-col>
                <el-col :span="2" :offset="1">
                    <el-button type="danger" round @click="GetTasksTwo">驳回审核</el-button>
                </el-col>
                <el-col :span="2" :offset="1">
                    <el-button type="primary" round @click="GetTasksThree">质检审核</el-button>
                </el-col>
                <el-col :span="2" :offset="12">
                    <el-badge :value="remainTasks">
                        <el-button type="primary" round @click="ReceiveTasks">领取任务</el-button>
                    </el-badge>
                </el-col>
            </el-row>
        </el-form>
        <el-table
            :data="tableData"
            stripe
            height="100px"
            border
            align="center"
            :cell-style="rowClass"
            :header-cell-style="headClass"
            class="table"
            :style="style_table"
        >
            <el-table-column type="index" label="序号" width="100" :index="indexMethod"></el-table-column>
            <el-table-column prop="filename" label="文件名"></el-table-column>
            <el-table-column prop="ticketID" label="ticketID"></el-table-column>
            <el-table-column prop="uploadtime" label="文件接收时间"></el-table-column>
            <el-table-column prop="gettasktime" label="派发/领取时间"></el-table-column>
            <el-table-column prop="realname" label="录单人员姓名"></el-table-column>
            <el-table-column prop="submittime" label="录单提交时间"></el-table-column>
            <el-table-column prop="realname2" label="质检人员姓名"></el-table-column>
            <el-table-column prop="submittime2" label="质检提交时间"></el-table-column>
            <el-table-column prop="pushtime" label="推送数据时间"></el-table-column>
            <el-table-column label="任务状态" :formatter="StatusFormatter"></el-table-column>
            <el-table-column label="操作">
                <template slot-scope="scope">
                    <el-button type="primary" @click="Details(scope.row.id)">详情</el-button>
                </template>
            </el-table-column>
        </el-table>
        <template>
            <Pagination
                :total="listQuery.total"
                :page.sync="listQuery.currentPage"
                :limit.sync="listQuery.pageSize"
                @pagination="GetTasksOne(arguments)"
                ref="pagination"
            />
        </template>
    </div>
</template>

<script>
import Pagination from "../../components/Pagination";
export default {
    name: "Task",
    components: { Pagination },
    data() {
        return {
            style_table: "",
            tableData: [],
            listQuery: {
                total: 0,
                currentPage: 0, //与后台定义好的分页参数
                pageSize: 50,
            },
            headClass() {
                return "text-align: center;background:#eef1f6;";
            },
            rowClass() {
                return "text-align: center;";
            },
            remainTasks: "",
        };
    },
    created() {
        this.GetTasksOne();
        this.GetRemainTasks();
    },
    mounted() {
        this.$nextTick(() => {
            let h = this.$refs.main.offsetHeight;
            let h_pagination = this.$refs.pagination.$el.offsetHeight;
            let h_queryform = this.$refs.queryform.$el.offsetHeight;
            let h_main = h - h_pagination - h_queryform;
            this.style_table = "height:" + h_main + "px;";
        });
    },
    methods: {
        async GetTasks() {
            const loading = this.$loading({
                lock: true,
                text: "Loading",
                spinner: "el-icon-loading",
                background: "rgba(0, 0, 0, 0.7)",
            });
            try {
                let params = {
                    currentPage: this.listQuery.currentPage,
                    pageSize: this.listQuery.pageSize,
                    userid: JSON.parse(
                        this.uncompileStr(sessionStorage.getItem("UserInfo"))
                    ).id,
                };

                let res = await window.axios.post("/api/GetTasks", params);
                loading.close();
                if (res.code == 200) {
                    this.tableData = res.data.topics;
                    this.listQuery.total = res.data.total;
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
        indexMethod(index) {
            return (
                this.listQuery.currentPage * this.listQuery.pageSize + index + 1
            );
        },
        async ReceiveTasks() {
            const loading = this.$loading({
                lock: true,
                text: "Loading",
                spinner: "el-icon-loading",
                background: "rgba(0, 0, 0, 0.7)",
            });
            try {
                let params = {
                    userid: JSON.parse(
                        this.uncompileStr(sessionStorage.getItem("UserInfo"))
                    ).id,
                    realname: JSON.parse(
                        this.uncompileStr(sessionStorage.getItem("UserInfo"))
                    ).realname,
                };

                let res = await window.axios.post("/api/ReceiveTasks", params);
                loading.close();
                if (res.code == 200) {
                    this.$message({
                        message: "领取成功",
                        type: "success",
                    });
                    this.GetTasksOne();
                    this.GetRemainTasks();
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
        Details(fileid) {
            this.$store.commit("SetFileid", fileid);
            this.$router.push("/TaskDetail");
        },
        StatusFormatter(row, column) {
            var status = row.status;
            var userid = row.userid;
            var userid2 = row.userid2;
            var currentUserid = JSON.parse(
                this.uncompileStr(sessionStorage.getItem("UserInfo"))
            ).id;
            var str = "";
            if (userid == currentUserid) {
                if (status == 1) {
                    str = "待处理";
                } else if (status == 2) {
                    str = "待质检";
                } else if (status == 3) {
                    str = "被驳回";
                } else if (status == 4) {
                    str = "已完成";
                }
            } else if (userid2 == currentUserid) {
                if (status == 2) {
                    str = "待处理";
                }
            } else {
                if (status == 1) {
                    str = "待领取";
                } else if (status == 1) {
                    str = "待处理";
                } else if (status == 2) {
                    str = "待质检";
                } else if (status == 3) {
                    str = "被驳回";
                } else if (status == 4) {
                    str = "已完成";
                }
            }
            if (!str) {
                str = "状态异常";
            }
            return str;
        },
        async GetTasksOne() {
            const loading = this.$loading({
                lock: true,
                text: "Loading",
                spinner: "el-icon-loading",
                background: "rgba(0, 0, 0, 0.7)",
            });
            try {
                let params = {
                    currentPage: this.listQuery.currentPage,
                    pageSize: this.listQuery.pageSize,
                    userid: JSON.parse(
                        this.uncompileStr(sessionStorage.getItem("UserInfo"))
                    ).id,
                };
                let res = await window.axios.post("/api/GetTasksOne", params);
                loading.close();
                if (res.code == 200) {
                    this.tableData = res.data.topics;
                    this.listQuery.total = res.data.total;
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
        async GetTasksTwo() {
            const loading = this.$loading({
                lock: true,
                text: "Loading",
                spinner: "el-icon-loading",
                background: "rgba(0, 0, 0, 0.7)",
            });
            try {
                let params = {
                    currentPage: this.listQuery.currentPage,
                    pageSize: this.listQuery.pageSize,
                    userid: JSON.parse(
                        this.uncompileStr(sessionStorage.getItem("UserInfo"))
                    ).id,
                };
                let res = await window.axios.post("/api/GetTasksTwo", params);
                loading.close();
                if (res.code == 200) {
                    this.tableData = res.data.topics;
                    this.listQuery.total = res.data.total;
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
        async GetTasksThree() {
            const loading = this.$loading({
                lock: true,
                text: "Loading",
                spinner: "el-icon-loading",
                background: "rgba(0, 0, 0, 0.7)",
            });
            try {
                let params = {
                    currentPage: this.listQuery.currentPage,
                    pageSize: this.listQuery.pageSize,
                    userid: JSON.parse(
                        this.uncompileStr(sessionStorage.getItem("UserInfo"))
                    ).id,
                };

                let res = await window.axios.post("/api/GetTasksThree", params);
                loading.close();
                if (res.code == 200) {
                    this.tableData = res.data.topics;
                    this.listQuery.total = res.data.total;
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
        async GetRemainTasks() {
            const loading = this.$loading({
                lock: true,
                text: "Loading",
                spinner: "el-icon-loading",
                background: "rgba(0, 0, 0, 0.7)",
            });
            try {
                let params = {};
                let res = await window.axios.post(
                    "/api/GetRemainTasks",
                    params
                );
                loading.close();
                if (res.code == 200) {
                    this.remainTasks = res.data;
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
<style lang="scss" scoped>
.table {
    width: 100%;
}
</style>
