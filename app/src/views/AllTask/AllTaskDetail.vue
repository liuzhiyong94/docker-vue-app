<template>
    <div style="width:100%;height:100%;" ref="main" id="main">
        <el-row style="height:100%;">
            <el-col :span="12" style="height:100%;">
                <!-- <el-image
                    :src="datas.filepath"
                    fit="contain"
                    :preview-src-list="srcList"
                    style="position:relative;height:100%;"
                ></el-image>-->
                <iframe id="show-iframe" frameborder="0" width="100%" height="100%" src="/#/Pic"></iframe>
            </el-col>
            <el-col :span="12" style="padding:20px;">
                <el-form
                    ref="form"
                    :model="form"
                    label-width="220px"
                    :style="style_form"
                    :disabled="true"
                >
                    <el-divider content-position="left">基础信息</el-divider>
                    <el-row>
                        <!-- <el-col>
                            <el-form-item label="倒计时">
                                <p style="color:red;bold:red;font-size:20px;">{{countdown}}</p>
                            </el-form-item>
                        </el-col>-->
                        <el-col :span="12">
                            <el-form-item label="图像名称">
                                <el-input v-model="form.img_name" readonly></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="图像标题">
                                <el-input v-model.trim="titlename"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="姓名">
                                <el-input v-model.trim="form.name"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="性别">
                                <el-select v-model="form.sex" style="width:100%;" clearable>
                                    <el-option label="男" value="男"></el-option>
                                    <el-option label="女" value="女"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="发票类型" :required="true">
                                <el-select v-model="form.bill_type" style="width:100%;" clearable>
                                    <el-option label="门诊" value="1"></el-option>
                                    <el-option label="住院" value="2"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="医保类型">
                                <el-input v-model.trim="form.medical_type"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="发票编号">
                                <el-input v-model.trim="form.invoice_no"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="合计">
                                <el-input v-model.trim="form.total_fee" type="number"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="医疗机构名称">
                                <el-input v-model.trim="form.hospital_name"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="医院所在地(市级)">
                                <el-input v-model.trim="form.zone"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="医疗机构编码">
                                <el-input v-model.trim="form.medical_institution_code"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="科室">
                                <el-input v-model.trim="form.division"></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-divider content-position="left" v-if="form.bill_type==1">门诊信息</el-divider>
                    <el-row v-show="form.bill_type==1">
                        <el-col :span="12">
                            <el-form-item label="医疗机构类型(限门诊使用)">
                                <el-input v-model.trim="form.h_types_omi"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="就诊日(限门诊使用)">
                                <el-date-picker
                                    type="date"
                                    v-model="form.sick_date"
                                    style="width: 100%;"
                                    :editable="false"
                                    format="yyyy 年 MM 月 dd 日"
                                    value-format="yyyy-MM-dd"
                                ></el-date-picker>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-divider content-position="left" v-if="form.bill_type==2">住院信息</el-divider>
                    <el-row v-show="form.bill_type==2">
                        <el-col :span="12">
                            <el-form-item label="住院号(限住院使用)">
                                <el-input v-model.trim="form.in_h_number"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="病案号(限住院使用)">
                                <el-input v-model.trim="form.medical_record_number"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="病区(限住院使用)">
                                <el-input v-model.trim="form.infect_patch"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="床号(限住院使用)">
                                <el-input v-model.trim="form.bed_number"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="入院日期">
                                <el-date-picker
                                    type="date"
                                    v-model="form.admission_date"
                                    style="width: 100%;"
                                    :editable="false"
                                    format="yyyy 年 MM 月 dd 日"
                                    value-format="yyyy-MM-dd"
                                ></el-date-picker>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="出院日期">
                                <el-date-picker
                                    type="date"
                                    v-model="form.discharge_date"
                                    style="width: 100%;"
                                    :editable="false"
                                    format="yyyy 年 MM 月 dd 日"
                                    value-format="yyyy-MM-dd"
                                ></el-date-picker>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="住院天数">
                                <el-input v-model.trim="form.in_hosp_days" type="number"></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <!-- 项目(费用类别)和金额明细 -->
                    <!-- <div style="padding: 15px 0; border-top: 1px solid #AAAAAA;"> -->
                    <div style="padding: 15px 0;">
                        <div style="text-align: left;">
                            <span
                                style="display: inline-block; width: 50%; font-weight: bold; color: #303133;"
                            >项目(费用类别)和金额明细</span>
                        </div>
                        <div
                            style="margin-top: 10px; text-align: left;"
                            v-if="checkedList1.length>0"
                        >
                            <el-table :data="form.p_group" border style="width: 100%">
                                <el-table-column label="序号" align="center" width="50" type="index"></el-table-column>
                                <el-table-column
                                    v-for="(item, index) in checkedList1"
                                    :key="index"
                                    :prop="item.model"
                                    :label="item.label"
                                    align="center"
                                ></el-table-column>
                            </el-table>
                        </div>
                        <div style="margin-top: 10px; text-align: center;" v-else>暂无数据</div>
                    </div>

                    <!-- 细项明细 -->
                    <!-- <div style="padding: 15px 0; border-top: 1px solid #AAAAAA; border-bottom: 1px solid #AAAAAA;"> -->
                    <div style="padding: 15px 0;">
                        <div style="text-align: left;">
                            <span
                                style="display: inline-block; width: 50%; font-weight: bold; color: #303133;"
                            >细项明细</span>
                        </div>
                        <div
                            style="margin-top: 10px; text-align: left;"
                            v-if="checkedList2.length>0"
                        >
                            <el-table :data="form.p_detail" border style="width: 100%">
                                <el-table-column label="序号" align="center" width="50" type="index"></el-table-column>
                                <el-table-column
                                    v-for="(item, index) in checkedList2"
                                    :key="index"
                                    :prop="item.model"
                                    :label="item.label"
                                    align="center"
                                ></el-table-column>
                            </el-table>
                        </div>
                        <div style="margin-top: 10px; text-align: center;" v-else>暂无数据</div>
                    </div>
                    <el-form-item label="识别失败原因(识别成功不填写)">
                        <el-input v-model="form.fail_reason"></el-input>
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>
    </div>
</template>

<script>
export default {
    name: "TaskDetail",
    data() {
        return {
            datas: {},
            srcList: [],
            form: {
                admission_date: "",
                bed_number: "",
                bill_type: "",
                discharge_date: "",
                division: "",
                fail_reason: "",
                h_types_omi: "",
                hospital_name: "",
                // htypesOmi: "",
                img_name: "",
                // inHospDays: 0,
                in_h_number: "",
                in_hosp_days: "",
                invoice_no: "",
                medical_institution_code: "",
                medical_record_number: "",
                medical_type: "",
                name: "",
                p_detail: [
                    {
                        calss: "",
                        count: "",
                        group_des: "",
                        increase_ratio: "",
                        item_amount: "",
                        item_name: "",
                        medical_insurance: "",
                        outside_medical: "",
                        individual_pay: "",
                        project_code: "",
                        quantity_unit: "",
                        self_pay: "",
                        specifications: "",
                        unit_price: "",
                    },
                ],
                p_group: [
                    {
                        group_amount: "",
                        group_name: "",
                        individual_pay: "",
                        medical_pay: "",
                    },
                ],
                infect_patch: "",
                sex: "",
                sick_date: "",
                total_fee: "",
                zone: "",
            },
            style_form: "",
            activeNames: ["p_group", "p_detail"],
            QualityUsers: [],
            userid2: "",
            remark: "",
            ticketID: "",
            titlename: "",
            curuserid: 0,
            status: 0,
            userid: 0,
            checkedList1: [],
            itemlist1: [
                {
                    value: 1,
                    label: "分类项名称",
                    model: "group_name",
                },
                {
                    value: 2,
                    label: "分类项金额",
                    model: "group_amount",
                },
                {
                    value: 3,
                    label: "本次医疗范围内金额(限住院使用)",
                    model: "medical_pay",
                },
                {
                    value: 4,
                    label: "个人负担(限住院使用)",
                    model: "individual_pay",
                },
            ],
            checkedList2: [],
            itemlist2: [
                {
                    value: 1,
                    label: "项目编码",
                    model: "project_code",
                },
                {
                    value: 2,
                    label: "明细项目名称",
                    model: "item_name",
                },
                {
                    value: 3,
                    label: "明细项目规格",
                    model: "specifications",
                },
                {
                    value: 4,
                    label: "数量单位",
                    model: "quantity_unit",
                },
                {
                    value: 5,
                    label: "明细项目数量",
                    model: "count",
                },
                {
                    value: 6,
                    label: "明细项目单价",
                    model: "unit_price",
                },
                {
                    value: 7,
                    label: "项目金额",
                    model: "item_amount",
                },
                {
                    value: 8,
                    label: "明细项目等级",
                    model: "calss",
                },
                {
                    value: 9,
                    label: "增付比例",
                    model: "increase_ratio",
                },
                {
                    value: 10,
                    label: "自费金额",
                    model: "self_pay",
                },
                {
                    value: 11,
                    label: "项目增付金额",
                    model: "outside_medical",
                },
                {
                    value: 12,
                    label: "医保内金额",
                    model: "medical_insurance",
                },
                {
                    value: 13,
                    label: "个人负担",
                    model: "individual_pay",
                },
                {
                    value: 14,
                    label: "所属分类(关联大项)",
                    model: "group_des",
                },
            ],
        };
    },
    created() {
        this.GetTaskDetail();
        this.curuserid = JSON.parse(
            this.uncompileStr(sessionStorage.getItem("UserInfo"))
        ).id;
    },
    mounted() {
        this.$nextTick(() => {
            let h = this.$refs.main.offsetHeight;
            let h_main = h - 40;
            this.style_form =
                "height:" + h_main + "px;overflow-y:auto;overflow-x:hidden;";
        });
    },
    methods: {
        handleData: function () {
            this.checkedList1 = JSON.parse(this.datas.checkedList1);
            this.checkedList2 = JSON.parse(this.datas.checkedList2);
        },
        async GetTaskDetail() {
            const loading = this.$loading({
                lock: true,
                text: "Loading",
                spinner: "el-icon-loading",
                background: "rgba(0, 0, 0, 0.7)",
            });
            try {
                let params = {
                    fileid: this.$store.state.fileid,
                };
                let res = await window.axios.post("/api/GetTaskDetail", params);
                loading.close();
                if (res.code == 200) {
                    if (res.data.length) {
                        this.datas = res.data[0];
                        this.srcList = [res.data[0].filepath];
                        this.remark = res.data[0].remark;
                        this.ticketID = res.data[0].ticketID;
                        this.status = res.data[0].status;
                        this.userid = res.data[0].userid;
                        this.titlename = res.data[0].titlename
                        if (res.data[0].content) {
                            this.form = JSON.parse(res.data[0].content);
                            this.handleData();
                        } else {
                            this.form.img_name = res.data[0].filename;
                        }
                        if (res.data[0].userid2) {
                            this.userid2 = res.data[0].userid2;
                        }
                        this.$store.commit("SetFilepath", res.data[0].filepath);
                    }
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
