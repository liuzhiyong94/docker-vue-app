<template>
    <div style="width:100%;height:100%;" ref="main" id="main">
        <el-form label-width="50px" ref="queryform" style="padding: 10px 0;box-sizing:border-box;">
            <el-row>
                <el-col :span="2">
                    <el-button type="primary" @click="dialogFormVisible=true">新增</el-button>
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
            <el-table-column prop="realname" label="姓名"></el-table-column>
            <el-table-column prop="username" label="用户名"></el-table-column>
            <el-table-column label="停用/启用">
                <template slot-scope="scope">
                    <el-switch
                        v-model="scope.row.status"
                        active-color="#13ce66"
                        inactive-color="#cccccc"
                        :active-value="1"
                        :inactive-value="0"
                        @change="StartStop($event,scope.row, scope.$index)"
                    ></el-switch>
                    <!-- <p>{{scope.row}}</p> -->
                </template>
            </el-table-column>
            <el-table-column label="质检权限">
                <template slot-scope="scope">
                    <el-switch
                        v-model="scope.row.inspection"
                        active-color="#13ce66"
                        inactive-color="#cccccc"
                        :active-value="1"
                        :inactive-value="0"
                        @change="Inspection($event,scope.row, scope.$index)"
                    ></el-switch>
                    <!-- <p>{{scope.row}}</p> -->
                </template>
            </el-table-column>
            <el-table-column label="操作">
                <template slot-scope="scope">
                    <el-button type="primary" @click="Before_EditUser(scope.row)">编辑</el-button>
                    <el-button type="danger" @click="Before_DeleteUser(scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <template>
            <Pagination
                :total="listQuery.total"
                :page.sync="listQuery.currentPage"
                :limit.sync="listQuery.pageSize"
                @pagination="GetUsers(arguments)"
                ref="pagination"
            />
        </template>
        <el-dialog
            title="新增人员"
            :visible.sync="dialogFormVisible"
            :close-on-click-modal="false"
            :close-on-press-escape="false"
            customClass="customWidth"
            center
            @close="BeforeClose"
        >
            <el-form label-width="60px">
                <el-form-item label="姓名">
                    <el-input
                        size="medium"
                        class="el-input-small"
                        v-model.trim="listForm.realname"
                        clearable
                    ></el-input>
                </el-form-item>
                <el-form-item label="用户名">
                    <el-input
                        size="medium"
                        class="el-input-small"
                        v-model.trim="listForm.username"
                        clearable
                    ></el-input>
                </el-form-item>
                <el-form-item label="密码">
                    <el-input
                        size="medium"
                        class="el-input-small"
                        v-model.trim="listForm.password"
                        show-password
                        clearable
                    ></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="NewUser">确 定</el-button>
            </div>
        </el-dialog>
        <el-dialog
            title="编辑人员"
            :visible.sync="dialogFormVisible2"
            :close-on-click-modal="false"
            :close-on-press-escape="false"
            customClass="customWidth"
            center
            @close="BeforeClose"
        >
            <el-form label-width="60px">
                <el-form-item label="姓名">
                    <el-input
                        size="medium"
                        class="el-input-small"
                        v-model.trim="listForm.realname"
                        clearable
                    ></el-input>
                </el-form-item>
                <el-form-item label="用户名">
                    <el-input
                        size="medium"
                        class="el-input-small"
                        v-model.trim="listForm.username"
                        clearable
                    ></el-input>
                </el-form-item>
                <el-form-item label="密码">
                    <el-input
                        size="medium"
                        class="el-input-small"
                        v-model.trim="listForm.password"
                        show-password
                        clearable
                        placeholder="不修改填空"
                    ></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible2 = false">取 消</el-button>
                <el-button type="primary" @click="EditUser">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import md5 from "js-md5";
import Pagination from "../../components/Pagination";
import EncryptionSalt from "../../plugins/encryption";
export default {
    name: "User",
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
            dialogFormVisible: false,
            dialogFormVisible2: false,
            listForm: {
                realname: "",
                username: "",
                password: "",
                userid: 0,
            },
        };
    },
    created() {
        this.GetUsers();
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
        async GetUsers() {
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
                };

                let res = await window.axios.post("/api/GetUsers", params);
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
        async NewUser() {
            if (!this.listForm.realname) {
                this.$message({
                    message: "请输入姓名",
                    type: "warning",
                });
                return false;
            }
            if (!this.listForm.username) {
                this.$message({
                    message: "请输入用户名",
                    type: "warning",
                });
                return false;
            }
            if (!this.listForm.password) {
                this.$message({
                    message: "请输入密码",
                    type: "warning",
                });
                return false;
            }
            const loading = this.$loading({
                lock: true,
                text: "Loading",
                spinner: "el-icon-loading",
                background: "rgba(0, 0, 0, 0.7)",
            });
            try {
                let params = {
                    realname: this.listForm.realname,
                    username: this.listForm.username,
                    password: md5(this.listForm.password + EncryptionSalt.salt),
                };

                let res = await window.axios.post("/api/NewUser", params);
                loading.close();
                if (res.code == 200) {
                    this.$message({
                        message: "新增成功",
                        type: "success",
                    });
                    this.dialogFormVisible = false;
                    this.GetUsers();
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
        Before_EditUser(info) {
            this.listForm.realname = info.realname;
            this.listForm.username = info.username;
            this.listForm.userid = info.id;
            this.dialogFormVisible2 = true;
        },
        BeforeClose() {
            Object.assign(this.$data.listForm, this.$options.data().listForm);
        },
        async EditUser() {
            if (!this.listForm.realname) {
                this.$message({
                    message: "请输入姓名",
                    type: "warning",
                });
                return false;
            }
            if (!this.listForm.username) {
                this.$message({
                    message: "请输入用户名",
                    type: "warning",
                });
                return false;
            }
            let password = "";
            if (this.listForm.password) {
                password = md5(this.listForm.password + EncryptionSalt.salt);
            }
            const loading = this.$loading({
                lock: true,
                text: "Loading",
                spinner: "el-icon-loading",
                background: "rgba(0, 0, 0, 0.7)",
            });
            try {
                let params = {
                    realname: this.listForm.realname,
                    username: this.listForm.username,
                    userid: this.listForm.userid,
                    password: password,
                };

                let res = await window.axios.post("/api/EditUser", params);
                loading.close();
                if (res.code == 200) {
                    this.$message({
                        message: "编辑成功",
                        type: "success",
                    });
                    this.dialogFormVisible2 = false;
                    this.GetUsers();
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
        Before_DeleteUser(info) {
            this.$confirm("此操作将永久删除该人员, 是否继续?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            })
                .then(() => {
                    this.DeleteUser(info.id);
                })
                .catch(() => {});
        },
        async DeleteUser(userid) {
            const loading = this.$loading({
                lock: true,
                text: "Loading",
                spinner: "el-icon-loading",
                background: "rgba(0, 0, 0, 0.7)",
            });
            try {
                let params = {
                    userid: userid,
                };

                let res = await window.axios.post("/api/DeleteUser", params);
                loading.close();
                if (res.code == 200) {
                    this.$message({
                        message: "删除成功",
                        type: "success",
                    });
                    this.GetUsers();
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
        StartStop(event, row, index) {
            console.log("index:", index);
            var tips = "";
            if (event == 1) {
                tips = "此操作将启用该人员, 是否继续?";
            } else {
                tips = "此操作将停用该人员, 是否继续?";
            }
            this.$confirm(tips, "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            })
                .then(() => {
                    this.SwitchUser(row.id, event, index);
                })
                .catch(() => {
                    if (event == 1) {
                        this.tableData[index].status = 0;
                    } else {
                        this.tableData[index].status = 1;
                    }
                });
        },
        async SwitchUser(userid, status, index) {
            const loading = this.$loading({
                lock: true,
                text: "Loading",
                spinner: "el-icon-loading",
                background: "rgba(0, 0, 0, 0.7)",
            });
            try {
                let params = {
                    userid: userid,
                    status: status,
                };

                let res = await window.axios.post("/api/SwitchUser", params);
                loading.close();
                if (res.code == 200) {
                    this.$message({
                        message: status == 1 ? "启用" : "停用" + "成功",
                        type: "success",
                    });
                    this.GetUsers();
                } else {
                    if (status == 1) {
                        this.tableData[index].status = 0;
                    } else {
                        this.tableData[index].status = 1;
                    }
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
        Inspection(event, row, index) {
            console.log("index:", index);
            var tips = "";
            if (event == 1) {
                tips = "此操作将启用该人员质检权限, 是否继续?";
            } else {
                tips = "此操作将停用该人员质检权限, 是否继续?";
            }
            this.$confirm(tips, "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            })
                .then(() => {
                    this.SwitchInspection(row.id, event, index);
                })
                .catch(() => {
                    if (event == 1) {
                        this.tableData[index].inspection = 0;
                    } else {
                        this.tableData[index].inspection = 1;
                    }
                });
        },
        async SwitchInspection(userid, inspection, index) {
            const loading = this.$loading({
                lock: true,
                text: "Loading",
                spinner: "el-icon-loading",
                background: "rgba(0, 0, 0, 0.7)",
            });
            try {
                let params = {
                    userid: userid,
                    inspection: inspection,
                };

                let res = await window.axios.post(
                    "/api/SwitchInspection",
                    params
                );
                loading.close();
                if (res.code == 200) {
                    console.log("inspection:", inspection);
                    this.$message({
                        message: inspection == 1 ? "启用" : "停用" + "成功",
                        type: "success",
                    });
                    this.GetUsers();
                } else {
                    if (inspection == 1) {
                        this.tableData[index].inspection = 0;
                    } else {
                        this.tableData[index].inspection = 1;
                    }
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
<style scoped>
.table {
    width: 100%;
}
#main >>> .customWidth {
    width: 400px;
}
</style>
