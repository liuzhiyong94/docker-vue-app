<template>
    <div style="width:100%;height:100%;" ref="main" id="main">
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
            <el-table-column prop="city" label="城市"></el-table-column>
            <el-table-column prop="zip" label="邮编"></el-table-column>
            <el-table-column prop="csentence" label="备注"></el-table-column>
        </el-table>
        <template>
            <Pagination
                :total="listQuery.total"
                :page.sync="listQuery.currentPage"
                :limit.sync="listQuery.pageSize"
                @pagination="GetLocation(arguments)"
                ref="pagination"
            />
        </template>
    </div>
</template>

<script>
require("../../mock/GetLocation.js");
import Pagination from "../../components/Pagination";
export default {
    name: "Location",
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
        };
    },
    created() {
        this.GetLocation();
    },
    mounted() {
        this.$nextTick(() => {
            let h = this.$refs.main.offsetHeight;
            let h_pagination = this.$refs.pagination.$el.offsetHeight;
            let h_main = h - h_pagination;
            this.style_table = "height:" + h_main + "px;";
        });
    },
    methods: {
        async GetLocation() {
            try {
                let params = {
                    currentPage: this.listQuery.currentPage,
                    pageSize: this.listQuery.pageSize,
                };
                const loading = this.$loading({
                    lock: true,
                    text: "Loading",
                    spinner: "el-icon-loading",
                    background: "rgba(0, 0, 0, 0.7)",
                });
                let res = await window.axios.post(
                    "/api/Wechat/GetLocation",
                    params
                );
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
    },
};
</script>
<style lang="scss">
.table {
    width: 100%;
}
</style>
