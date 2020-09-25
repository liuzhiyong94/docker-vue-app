<template>
    <div style="margin-top:300px;">
        <el-row>
            <el-col :offset="6" :span="12">
                <el-input v-model.trim="username" autofocus clearable>
                    <template slot="prepend">账 号</template>
                </el-input>
            </el-col>
        </el-row>

        <el-row>
            <el-col :offset="6" :span="12">
                <el-input type="password" v-model.trim="password" clearable show-password>
                    <template slot="prepend">密 码</template>
                </el-input>
            </el-col>
        </el-row>

        <el-row>
            <el-col :offset="6" :span="12">
                <el-button type="primary" size="medium" @click="Login">登录</el-button>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import md5 from "js-md5";
import EncryptionSalt from "../plugins/encryption";
// require("../mock/login.js");
export default {
    name: "Login",
    components: {},
    data() {
        return {
            username: "",
            password: "",
        };
    },
    created() {
        var _this = this;
        document.onkeydown = function (e) {
            let key = window.event.keyCode;
            if (key == 13 && _this.$route.name == "login") {
                _this.Login();
            }
        };
    },
    methods: {
        async Login() {
            let username = this.username.trim();
            let password = this.password.trim();
            const loading = this.$loading({
                lock: true,
                text: "Loading",
                spinner: "el-icon-loading",
                background: "rgba(0, 0, 0, 0.7)",
            });
            try {
                let params = {
                    username: username,
                    password: md5(password + EncryptionSalt.salt),
                };

                let res = await window.axios.post("/api/Login", params);
                loading.close();
                if (res.code == 200) {
                    sessionStorage.setItem("JwtToken", res.data.JwtToken);
                    sessionStorage.setItem(
                        "UserInfo",
                        this.compileStr(JSON.stringify(res.data.userinfo))
                    );
                    this.$message({
                        message: "登录成功",
                        type: "success",
                    });
                    this.$router.push("/home");
                } else {
                    loading.close();
                    this.$message({
                        message: res.msg,
                        type: "warning",
                    });
                }
            } catch (error) {
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
.el-row {
    margin-bottom: 20px;
    &:last-child {
        margin-bottom: 0;
    }
}
</style>
