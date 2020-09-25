<template>
    <el-header class="header">
        <el-image class="logo" :src="src" @click="BackHome"></el-image>
        <el-dropdown class="userinfo">
            <span class="el-dropdown-link">
                {{realname}}
                <i class="el-icon-arrow-down el-icon--right"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
                <el-dropdown-item @click.native="ShowChangePwd">修改密码</el-dropdown-item>
                <el-dropdown-item @click.native="SignOut">退出登录</el-dropdown-item>
            </el-dropdown-menu>
        </el-dropdown>
        <el-dialog
            title="修改密码"
            :visible.sync="dialogFormVisible"
            center
            :close-on-click-modal="false"
            :close-on-press-escape="false"
            customClass="customWidth"
            @close="BeforeClose"
        >
            <el-form :model="listForm">
                <el-form-item label="原密码">
                    <el-input v-model.trim="listForm.oldPwd" show-password clearable></el-input>
                </el-form-item>
                <el-form-item label="新密码">
                    <el-input v-model.trim="listForm.newPwd" show-password clearable></el-input>
                </el-form-item>
                <el-form-item label="确认密码">
                    <el-input v-model.trim="listForm.confirmPwd" show-password clearable></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="Before_ChangePwd">确 定</el-button>
            </div>
        </el-dialog>
    </el-header>
</template>

<script>
import md5 from "js-md5";
import EncryptionSalt from "../plugins/encryption";
export default {
    name: "Header",
    components: {},
    data() {
        return {
            src: require("../assets/logo.png"),
            realname: "",
            dialogFormVisible: false,
            listForm: {
                oldPwd: "",
                newPwd: "",
                confirmPwd: "",
            },
        };
    },
    created() {
        this.realname = JSON.parse(
            this.uncompileStr(sessionStorage.getItem("UserInfo"))
        ).realname;
    },
    methods: {
        SignOut() {
            sessionStorage.setItem("JwtToken", "");
            sessionStorage.setItem("UserInfo", "");
            location.reload();
        },
        BackHome() {
            this.$router.push("/");
        },
        ShowChangePwd() {
            this.dialogFormVisible = true;
        },
        BeforeClose() {
            Object.assign(this.$data.listForm, this.$options.data().listForm);
        },
        Before_ChangePwd() {
            if (!this.listForm.oldPwd) {
                this.$message({
                    message: "请输入原密码",
                    type: "warning",
                });
                return false;
            }
            if (!this.listForm.newPwd) {
                this.$message({
                    message: "请输入新密码",
                    type: "warning",
                });
                return false;
            }
            if (this.listForm.confirmPwd != this.listForm.newPwd) {
                this.$message({
                    message: "请确认新密码",
                    type: "warning",
                });
                return false;
            }
            this.$confirm("此操作将修改密码, 是否继续?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            })
                .then(() => {
                    this.ChangePwd();
                })
                .catch(() => {});
        },
        async ChangePwd() {
            const loading = this.$loading({
                lock: true,
                text: "Loading",
                spinner: "el-icon-loading",
                background: "rgba(0, 0, 0, 0.7)",
            });
            try {
                let params = {
                    oldPwd: md5(this.listForm.oldPwd + EncryptionSalt.salt),
                    newPwd: md5(this.listForm.newPwd + EncryptionSalt.salt),
                    userid: JSON.parse(
                        this.uncompileStr(sessionStorage.getItem("UserInfo"))
                    ).id,
                };

                let res = await window.axios.post("/api/ChangePwd", params);
                loading.close();
                if (res.code == 200) {
                    this.dialogFormVisible = false;
                    sessionStorage.clear();
                    location.reload();
                    this.$message({
                        message: "修改密码成功",
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
<style scoped>
.header {
    width: 100%;
    background: #ecf8ff;
    height: 80px !important;
}
.logo {
    float: left;
    width: 80px;
    height: 80px;
    cursor: pointer;
}
.userinfo {
    cursor: default;
    float: right;
    margin-top: 25px;
}
.el-dropdown-link {
    font-size: 16px;
}
.header >>> .customWidth {
    width: 400px;
}
</style>
