<template>
    <div style="width:100%;height:100%;" ref="main" id="main">
        <el-row style="height:100%;">
            <el-col :span="8" style="height:100%;">
                <!-- <el-image
                    :src="datas.filepath"
                    fit="contain"
                    :preview-src-list="srcList"
                    style="position:relative;height:100%;"
                ></el-image>-->
                <iframe id="show-iframe" frameborder="0" width="100%" height="100%" src="/#/Pic"></iframe>
            </el-col>
            <div>
                <span
                    v-if="ticketID=='SH2020'"
                    style="color:red;float:left;margin-left:30px;font-size:20px;"
                >上海测试任务</span>
                <span
                    v-if="ticketID=='WH2020'"
                    style="color:red;float:left;margin-left:30px;font-size:20px;"
                >武汉东风商保测试任务</span>
            </div>
            <el-col :span="16" style="padding:20px;position:relative;">
                <el-form ref="form" :model="form" label-width="220px" :style="style_form">
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
                            <el-form-item label="发票类型（一）" :required="true">
                                <el-select v-model="form.bill_type" style="width:100%;" clearable>
                                    <el-option label="门诊" value="1"></el-option>
                                    <el-option label="住院" value="2"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="发票类型（二）" :required="true">
                                <el-select
                                    v-model="form.invoice_type"
                                    style="width:100%;"
                                    clearable
                                >
                                    <el-option label="发票" value="1"></el-option>
                                    <el-option label="清单" value="2"></el-option>
                                    <el-option label="其他" value="3"></el-option>
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
                    <!-- <div style="padding: 15px 0 20px; border-top: 1px solid #AAAAAA;"> -->
                    <div style="padding: 15px 0 20px;">
                        <div style="text-align: left;">
                            <span
                                style="display: inline-block; width: 50%; font-weight: bold; color: #303133;"
                            >项目(费用类别)和金额明细</span>
                            <div
                                style="display: inline-block; width: calc(50% - 15px); text-align: right;"
                            >
                                <el-button
                                    size="mini"
                                    type="primary"
                                    icon="el-icon-edit"
                                    circle
                                    @click="setHeader(1)"
                                    v-if="!setHeader1"
                                ></el-button>
                                <el-button
                                    size="mini"
                                    type="info"
                                    icon="el-icon-close"
                                    circle
                                    @click="closeHeader(1)"
                                    v-if="setHeader1&&checkedList1.length>0"
                                ></el-button>
                                <el-button
                                    size="mini"
                                    type="success"
                                    icon="el-icon-check"
                                    circle
                                    @click="confirmHeader(1)"
                                    v-if="setHeader1"
                                ></el-button>
                                <el-button
                                    size="mini"
                                    type="success"
                                    icon="el-icon-plus"
                                    circle
                                    @click="addData(1)"
                                    v-if="!setHeader1"
                                ></el-button>
                            </div>
                        </div>
                        <div style="margin-top: 5px; text-align: left;" v-if="setHeader1">
                            <el-checkbox
                                :indeterminate="isIndeterminate1"
                                v-model="checkAll1"
                                @change="checkAllChange1"
                            >全选</el-checkbox>
                            <el-checkbox-group v-model="checkList1" @change="checkListChange1">
                                <el-checkbox
                                    v-for="(item, index) in itemlist1"
                                    :key="index"
                                    :label="item"
                                >{{item.label}}</el-checkbox>
                            </el-checkbox-group>
                        </div>
                        <div
                            style="margin-top: 10px; text-align: left;"
                            v-if="checkedList1.length>0"
                        >
                            <el-table :data="datalist1" border style="width: 100%">
                                <el-table-column label="序号" align="center" width="50" type="index"></el-table-column>

                                <el-table-column
                                    v-for="(item, index) in checkedList1"
                                    :key="index"
                                    :label="item.label"
                                    align="center"
                                >
                                    <template slot-scope="scope">
                                        <el-input
                                            v-model="datalist1[scope.$index][item.model]"
                                            @keydown.native="keydown($event, 1, scope.$index, item.model)"
                                        ></el-input>
                                    </template>
                                </el-table-column>

                                <el-table-column label="操作" align="center" width="100">
                                    <template slot-scope="scope">
                                        <el-button
                                            size="mini"
                                            type="warning"
                                            icon="el-icon-delete"
                                            circle
                                            @click="deleteData(scope.$index, scope.row, 1)"
                                        ></el-button>
                                        <el-button
                                            size="mini"
                                            type="success"
                                            icon="el-icon-plus"
                                            circle
                                            @click="addData(1, scope.$index)"
                                        ></el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                            <div
                                style="width: calc(100% - 15px); margin-top: 10px; text-align: right;"
                            >
                                <el-button
                                    size="mini"
                                    type="success"
                                    icon="el-icon-plus"
                                    circle
                                    @click="addData(1)"
                                ></el-button>
                            </div>
                            <!-- <div style="position:fixed;top:400px;right:50px;padding:0px;background:#fff;border-radius:50%;box-shadow:0px 3px 3px #c8c8c8;">
                                <el-button
                                    size="mini"
                                    type="success"
                                    icon="el-icon-plus"
                                    circle
                                    @click="addData(1)"
                                    v-if="!setHeader1"
                                ></el-button>
                            </div>-->
                        </div>
                    </div>

                    <!-- 细项明细 -->
                    <!-- <div style="padding: 15px 0 20px; border-top: 1px solid #AAAAAA; border-bottom: 1px solid #AAAAAA;"> -->
                    <div style="padding: 15px 0 20px;">
                        <div style="text-align: left;">
                            <span
                                style="display: inline-block; width: 50%; font-weight: bold; color: #303133;"
                            >细项明细</span>
                            <div
                                style="display: inline-block; width: calc(50% - 15px); text-align: right;"
                            >
                                <el-button
                                    size="mini"
                                    type="primary"
                                    icon="el-icon-edit"
                                    circle
                                    @click="setHeader(2)"
                                    v-if="!setHeader2"
                                ></el-button>
                                <el-button
                                    size="mini"
                                    type="info"
                                    icon="el-icon-close"
                                    circle
                                    @click="closeHeader(2)"
                                    v-if="setHeader2&&checkedList2.length>0"
                                ></el-button>
                                <el-button
                                    size="mini"
                                    type="success"
                                    icon="el-icon-check"
                                    circle
                                    @click="confirmHeader(2)"
                                    v-if="setHeader2"
                                ></el-button>
                                <el-button
                                    size="mini"
                                    type="success"
                                    icon="el-icon-plus"
                                    circle
                                    @click="addData(2)"
                                    v-if="!setHeader2"
                                ></el-button>
                            </div>
                        </div>
                        <div style="margin-top: 5px; text-align: left;" v-if="setHeader2">
                            <el-checkbox
                                :indeterminate="isIndeterminate2"
                                v-model="checkAll2"
                                @change="checkAllChange2"
                            >全选</el-checkbox>
                            <el-checkbox-group v-model="checkList2" @change="checkListChange2">
                                <el-checkbox
                                    v-for="(item, index) in itemlist2"
                                    :key="index"
                                    :label="item"
                                >{{item.label}}</el-checkbox>
                            </el-checkbox-group>
                        </div>
                        <div
                            style="margin-top: 10px; text-align: left;"
                            v-if="checkedList2.length>0"
                        >
                            <el-table :data="datalist2" border style="width: 100%">
                                <el-table-column label="序号" align="center" width="50" type="index"></el-table-column>

                                <el-table-column
                                    v-for="(item, index) in checkedList2"
                                    :key="index"
                                    :label="item.label"
                                    align="center"
                                >
                                    <!-- :width="item.model!='item_name'?'150':'200'" -->
                                    <template slot-scope="scope">
                                        <el-autocomplete
                                            v-if="item.model=='item_name'"
                                            v-model="datalist2[scope.$index][item.model]"
                                            :fetch-suggestions="querySearchAsync"
                                            @keydown.native="keydown($event, 2, scope.$index, item.model)"
                                        ></el-autocomplete>
                                        <el-autocomplete
                                            v-else-if="item.model=='quantity_unit'"
                                            v-model="datalist2[scope.$index][item.model]"
                                            :fetch-suggestions="QuerySearchDW"
                                            @keydown.native="keydown($event, 2, scope.$index, item.model)"
                                        ></el-autocomplete>
                                        <el-input
                                            v-else
                                            v-model="datalist2[scope.$index][item.model]"
                                            @keydown.native="keydown($event, 2, scope.$index, item.model)"
                                        ></el-input>
                                    </template>
                                    <!-- <el-table-column v-if="item.value==15||item.value==16" label="手动调整" align="center">
                                        <el-table-column
                                            :key="item.value"
                                            :label="item.label"
                                            :prop="item.model"
                                            align="center"
                                        >
                                            <template slot-scope="scope">
                                                <el-input
                                                    v-model="datalist2[scope.$index][item.model]"
                                                    @keydown.native="keydown($event, 2, scope.$index, item.model)"
                                                ></el-input>
                                            </template>
                                        </el-table-column>
                                    </el-table-column> -->
                                </el-table-column>

                                <el-table-column label="操作" align="center" width="100">
                                    <template slot-scope="scope">
                                        <el-button
                                            size="mini"
                                            type="warning"
                                            icon="el-icon-delete"
                                            circle
                                            @click="deleteData(scope.$index, scope.row, 2)"
                                        ></el-button>
                                        <el-button
                                            size="mini"
                                            type="success"
                                            icon="el-icon-plus"
                                            circle
                                            @click="addData(2, scope.$index)"
                                        ></el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                            <div
                                style="width: calc(100% - 15px); margin-top: 10px; text-align: right;"
                            >
                                <el-button
                                    size="mini"
                                    type="success"
                                    icon="el-icon-plus"
                                    circle
                                    @click="addData(2)"
                                ></el-button>
                            </div>
                            <!-- <div style="position:fixed;top:500px;right:50px;padding:0px;background:#fff;border-radius:50%;box-shadow:0px 3px 3px #c8c8c8;">
                                <el-button
                                    size="mini"
                                    type="success"
                                    icon="el-icon-plus"
                                    circle
                                    @click="addData(2)"
                                    v-if="!setHeader2"
                                ></el-button>
                            </div>-->
                        </div>
                    </div>
                    <el-form-item label="识别失败原因(识别成功不填写)">
                        <el-input v-model.trim="form.fail_reason"></el-input>
                    </el-form-item>
                </el-form>
                <div ref="btngroup" style="height:200px;padding-top:30px;box-sizing:border-box;">
                    <div style="margin-bottom:10px;">
                        <el-input type="textarea" :rows="2" placeholder="备注" v-model="remark"></el-input>
                    </div>
                    <el-button
                        @click="TempSave"
                        v-if="(userid == curuserid && status != 2) || userid2 == curuserid"
                    >暂存</el-button>
                    <el-select
                        v-model="userid2"
                        placeholder="请选择质检人员"
                        style="margin:0 10px;"
                        :disabled="userid2!=0&&status!=1"
                        v-if="userid == curuserid && (status==1||status==3)"
                    >
                        <el-option
                            v-for="item in QualityUsers"
                            :key="item.id"
                            :label="item.realname"
                            :value="item.id"
                        ></el-option>
                    </el-select>
                    <el-button
                        type="primary"
                        @click="Before_ToQualityUser"
                        v-if="userid == curuserid && (status==1||status==3)"
                        :disabled="userid2==0"
                    >提交质检</el-button>
                    <!-- <el-button type="warning" @click="Before_Reject" v-if="userid2 == curuserid">驳回</el-button> -->
                    <el-button
                        type="success"
                        @click="Before_PushToCore"
                        v-if="userid2 == curuserid"
                    >推送</el-button>
                    <div style="margin-top:20px;">
                        <el-button
                            type="primary"
                            @click="Before_MachineOCR('Generalmedicalbillclassify_deep')"
                        >机器识别（发票）</el-button>
                        <el-button
                            type="primary"
                            @click="Before_MachineOCR('FuJianMedicalInsurance')"
                        >FuJianMedicalInsurance（清单）</el-button>
                        <el-button
                            type="primary"
                            @click="Before_MachineOCR('FuJianMedicalInsuranceDeep')"
                        >FuJianMedicalInsuranceDeep（清单测试）</el-button>
                    </div>
                </div>
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
                invoice_type: "",
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
                        manual_proportion: "",
                        manual_amount: ""
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
            curuserid: 0,
            status: 0,
            userid: 0,
            drugname: "",
            countdown: "",
            timer: null,
            titlename: "",
            TempSaveTimer: null,
            datalist1: [],
            setHeader1: true,
            checkAll1: false,
            isIndeterminate1: false,
            checkList1: [],
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
            datalist2: [],
            setHeader2: true,
            checkAll2: false,
            isIndeterminate2: false,
            checkList2: [],
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
                // {
                //     value: 15,
                //     label: "手动调整",
                //     model: "manual_adjustment",
                //     children: [
                        {
                            value: 15,
                            label: "手动调整比例（%）",
                            model: "manual_proportion",
                        },
                        {
                            value: 16,
                            label: "手动调整金额",
                            model: "manual_amount",
                        },
                //     ]
                // },
            ],
        };
    },
    created() {
        this.GetTaskDetail();
        this.GetQualityUser();
        this.curuserid = JSON.parse(
            this.uncompileStr(sessionStorage.getItem("UserInfo"))
        ).id;
        var _this = this;
        // this.TempSaveTimer = setInterval(function () {
        //     _this.TempSaveSync();
        // }, 30 * 1000);
    },
    mounted() {
        this.$nextTick(() => {
            let h = this.$refs.main.offsetHeight;
            let h_btngroup = this.$refs.btngroup.offsetHeight;
            let h_main = h - 40 - h_btngroup;
            this.style_form =
                "height:" + h_main + "px;overflow-y:auto;overflow-x:hidden;";
        });
    },
    destroyed() {
        clearInterval(this.timer);
        clearInterval(this.TempSaveTimer);
    },
    methods: {
        async GetTaskDetail() {
            this.timer = null;
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
                        this.titlename = res.data[0].titlename;
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
                        var _this = this;
                        // 倒计时
                        // this.timer = setInterval(function () {
                        //     var time1 = new Date(
                        //         res.data[0].uploadtime
                        //     ).getTime();
                        //     var time2 = new Date().getTime();
                        //     var time30 = 30 * 60 * 1000;
                        //     var diff = time2 - time1;
                        //     if (diff <= time30) {
                        //         var min = parseInt((time30 - diff) / 1000 / 60);
                        //         var sec = parseInt(
                        //             ((time30 - diff) / 1000) % 60
                        //         );
                        //         _this.countdown = min + " : " + sec;
                        //     } else {
                        //         _this.countdown = "已超时";
                        //     }
                        // }, 500);
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
        async TempSave() {
            this.trimData(1);
            this.trimData(2);
            this.form.p_group = this.datalist1;
            this.form.p_detail = this.datalist2;
            if (!this.InputCondition()) {
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
                    fileid: this.$store.state.fileid,
                    content: JSON.stringify(this.form),
                    bill_type: this.form.bill_type,
                    invoice_type: this.form.invoice_type,
                    titlename: this.titlename,
                    checkedList1: JSON.stringify(this.checkedList1),
                    checkedList2: JSON.stringify(this.checkedList2),
                };
                let res = await window.axios.post("/api/TempSave", params);
                loading.close();
                if (res.code == 200) {
                    this.$message({
                        message: "暂存成功",
                        type: "success",
                    });
                    this.GetTaskDetail();
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
        async TempSaveSync() {
            try {
                let params = {
                    fileid: this.$store.state.fileid,
                    content: JSON.stringify(this.form),
                    titlename: this.titlename,
                };
                let res = await window.axios.post("/api/TempSave", params);
                if (res.code == 200) {
                } else {
                }
            } catch (error) {}
        },
        async GetQualityUser() {
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
                };

                let res = await window.axios.post(
                    "/api/GetQualityUser",
                    params
                );
                loading.close();
                if (res.code == 200) {
                    this.QualityUsers = res.data;
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
        AddPGroup() {
            var p_group = this.form.p_group;
            p_group.push({
                group_amount: "",
                group_name: "",
                individual_pay: "",
                medical_pay: "",
            });
            this.form.p_group = p_group;
        },
        AddPDetail() {
            let count = 1;
            try {
                count = parseInt(this.PlusCount);
            } catch (error) {}
            var p_detail = this.form.p_detail;
            for (let i = 0; i <= count; i++) {
                p_detail.push({
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
                    manual_proportion: "",
                    manual_amount: ""
                });
            }
            this.form.p_detail = p_detail;
        },
        DeletePGroup(index) {
            this.$confirm("此操作将永久删除该项, 是否继续?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            })
                .then(() => {
                    var p_group = this.form.p_group;
                    p_group.splice(index, 1);
                    this.form.p_group = p_group;
                    this.$message({
                        type: "success",
                        message: "删除成功!",
                    });
                })
                .catch(() => {});
        },
        DeletePDetail(index) {
            this.$confirm("此操作将永久删除该项, 是否继续?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            })
                .then(() => {
                    var p_detail = this.form.p_detail;
                    p_detail.splice(index, 1);
                    this.form.p_detail = p_detail;
                    this.$message({
                        type: "success",
                        message: "删除成功!",
                    });
                })
                .catch(() => {});
        },
        async ToQualityUser() {
            if (!this.userid2) {
                this.$message({
                    message: "请选择质检人员",
                    type: "warning",
                });
                return false;
            }
            var realname2 = this.QualityUsers.find((item) => {
                return item.id == this.userid2;
            }).realname;
            this.trimData(1);
            this.trimData(2);
            this.form.p_group = this.datalist1;
            this.form.p_detail = this.datalist2;
            const loading = this.$loading({
                lock: true,
                text: "Loading",
                spinner: "el-icon-loading",
                background: "rgba(0, 0, 0, 0.7)",
            });
            try {
                let params = {
                    fileid: this.$store.state.fileid,
                    content: JSON.stringify(this.form),
                    userid2: this.userid2,
                    realname2: realname2,
                    remark: this.remark,
                    checkedList1: JSON.stringify(this.checkedList1),
                    checkedList2: JSON.stringify(this.checkedList2),
                };

                let res = await window.axios.post("/api/ToQualityUser", params);
                loading.close();
                if (res.code == 200) {
                    this.$message({
                        message: "提交质检成功",
                        type: "success",
                    });
                    this.$router.go(-1);
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
        Before_ToQualityUser() {
            this.$confirm("此操作将提交任务至质检人员, 是否继续?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            })
                .then(() => {
                    this.ToQualityUser();
                })
                .catch(() => {});
        },
        async Reject() {
            const loading = this.$loading({
                lock: true,
                text: "Loading",
                spinner: "el-icon-loading",
                background: "rgba(0, 0, 0, 0.7)",
            });
            try {
                let params = {
                    fileid: this.$store.state.fileid,
                    content: JSON.stringify(this.form),
                    remark: this.remark,
                };

                let res = await window.axios.post("/api/Reject", params);
                loading.close();
                if (res.code == 200) {
                    this.$message({
                        message: "驳回成功",
                        type: "success",
                    });
                    this.$router.go(-1);
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
        Before_Reject() {
            this.$confirm("此操作将驳回任务至录单人员, 是否继续?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            })
                .then(() => {
                    this.Reject();
                })
                .catch(() => {});
        },
        Before_PushToCore() {
            this.$confirm("此操作将推送数据至核心系统, 是否继续?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            })
                .then(() => {
                    this.PushToCore();
                })
                .catch(() => {});
        },
        async PushToCore() {
            const loading = this.$loading({
                lock: true,
                text: "Loading",
                spinner: "el-icon-loading",
                background: "rgba(0, 0, 0, 0.7)",
            });
            try {
                var sendback = 0;
                if (this.form.fail_reason) {
                    sendback = 1;
                }
                this.trimData(1);
                this.trimData(2);
                this.form.p_group = this.datalist1;
                this.form.p_detail = this.datalist2;
                let params = {
                    fileid: this.$store.state.fileid,
                    content: JSON.stringify(this.form),
                    remark: this.remark,
                    ticketID: this.ticketID,
                    sendback: sendback,
                    checkedList1: JSON.stringify(this.checkedList1),
                    checkedList2: JSON.stringify(this.checkedList2),
                };
                let res = await window.axios.post("/api/PushToCore", params);
                loading.close();
                if (res.code == 200) {
                    this.$message({
                        message: "推送成功",
                        type: "success",
                    });
                    this.$router.go(-1);
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
        Before_MachineOCR(ocrType) {
            this.$confirm("机器识别将会覆盖原有数据, 是否继续?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            })
                .then(() => {
                    this.MachineOCR(ocrType);
                })
                .catch(() => {});
        },
        async MachineOCR(ocrType) {
            const loading = this.$loading({
                lock: true,
                text: "Loading",
                spinner: "el-icon-loading",
                background: "rgba(0, 0, 0, 0.7)",
            });
            try {
                let params = {
                    ocrType: ocrType,
                    fileid: this.$store.state.fileid,
                };

                let res = await window.axios.post("/api/MachineOCR", params);
                loading.close();
                if (res.code == 200) {
                    if (ocrType == "Generalmedicalbillclassify_deep") {
                        var medical_result = {};
                        try {
                            medical_result = res.data.medical_result;
                        } catch (err) {}
                        // this.form.bill_type = medical_result.type + "";
                        this.form.invoice_no = medical_result.note_no;
                        this.form.name = medical_result.patient_name;
                        this.form.medical_type =
                            medical_result.medical_insurance_type;
                        this.form.total_fee = medical_result.total_cost;
                        this.form.hospital_name = medical_result.hospital_name;
                        this.form.sex =
                            medical_result.patient_gender == 1 ? "男" : "女";
                        this.form.sick_date = medical_result.hospital_dates[0];
                        this.form.admission_date =
                            medical_result.hospital_dates[0];
                        this.form.discharge_date =
                            medical_result.hospital_dates[1];
                        this.form.in_hosp_days = medical_result.hospital_days;
                        let cost_categories = medical_result.cost_categories;
                        let p_group = [];
                        for (let i = 0; i < cost_categories.length; i++) {
                            p_group.push({
                                group_amount: cost_categories[i].cost,
                                group_name: cost_categories[i].name,
                                individual_pay: "",
                                medical_pay: "",
                            });
                        }
                        this.form.p_group = p_group;
                    } else if (ocrType == "FuJianMedicalInsurance") {
                        if (res.data) {
                            this.SetOcrData(res.data);
                        }
                    } else if (ocrType == "FuJianMedicalInsuranceDeep") {
                        if (res.data) {
                            this.SetOcrData(res.data);
                        }
                    }
                    this.resetData();
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
        async querySearchAsync(queryString, cb) {
            let params = {
                drugname: queryString,
            };
            let res = await window.axios.post("/api/GetDruglist", params);
            let list = [];
            if (res.code == 200) {
                list = res.data;
            }
            for (let i = 0; i < list.length; i++) {
                list[i]["value"] = list[i].drug_registration_name;
            }
            cb(list);
        },
        QuerySearchDW(queryString, cb) {
            let res = [
                {
                    value: "次",
                },
                {
                    value: "项",
                },
                {
                    value: "个",
                },
                {
                    value: "片",
                },
                {
                    value: "支",
                },
                {
                    value: "瓶",
                },
                {
                    value: "贴",
                },
                {
                    value: "张",
                },
                {
                    value: "日",
                },
                {
                    value: "组",
                },
                {
                    value: "盒",
                },
                {
                    value: "套",
                },
            ];
            cb(res);
        },
        InputCondition() {
            if (this.form.bill_type != 1 && this.form.bill_type != 2) {
                this.$message({
                    message: "请选择发票类型",
                    type: "warning",
                });
                return false;
            } else if (
                this.form.invoice_type != 1 &&
                this.form.invoice_type != 2 &&
                this.form.invoice_type != 3
            ) {
                this.$message({
                    message: "请选择发票类型",
                    type: "warning",
                });
                return false;
            } else {
                return true;
            }
        },
        setHeader: function (delta) {
            this["checkList" + delta] = this["checkedList" + delta];
            this.checkListChange(this["checkList" + delta], delta);
            this["setHeader" + delta] = true;
        },
        closeHeader: function (delta) {
            if (this["checkedList" + delta].length == 0) {
                this.$message({
                    type: "error",
                    message: "请至少选择一项",
                });
                return true;
            }
            this["setHeader" + delta] = false;
        },
        confirmHeader: function (delta) {
            if (this["checkList" + delta].length == 0) {
                this.$message({
                    type: "error",
                    message: "请至少选择一项",
                });
                return true;
            }
            if(delta == 2) {
                var count1 = 0 
                var count2 = 0
                for(var i = 0; i < this["checkList" + delta].length; i++) {
                    if(this["checkList" + delta][i].value == 15) {
                        count1++
                    } else if(this["checkList" + delta][i].value == 16) {
                        count2++
                    }
                }
                if(count1 != count2) {
                    if(count1 > 0) {
                        this.$message({
                            type: "error",
                            message: "请选择手动调整金额项",
                        });
                    }
                    if(count2 > 0) {
                        this.$message({
                            type: "error",
                            message: "请选择手动调整比例（%）项",
                        });
                    }
                    return true;
                }
            }
            this["checkedList" + delta] = this["checkList" + delta];
            this["setHeader" + delta] = false;
            this.checkData(delta);
        },
        addData: function (delta, index) {
            if (index >= 0) {
                this["datalist" + delta].splice(index, 0, {});
            } else {
                this["datalist" + delta].push({});
                this.checkData(delta);
            }
        },
        deleteData: function (index, row, delta) {
            this.$confirm("此操作将永久删除该项, 是否继续?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            })
                .then(() => {
                    this["datalist" + delta].splice(index, 1);
                })
                .catch(() => {});
        },
        resetData: function () {
            this.datalist1 = this.form.p_group;
            this.datalist2 = this.form.p_detail;
            this.checkedList1 = [];
            this.checkedList2 = [];
            this.setHeader(1);
            this.setHeader(2);
        },
        handleData: function () {
            this.datalist1 = this.form.p_group;
            this.datalist2 = this.form.p_detail;

            this.checkList1 = [];
            var checkedList1 = JSON.parse(this.datas.checkedList1);
            if (checkedList1) {
                for (var i = 0; i < checkedList1.length; i++) {
                    var item1 = this.itemlist1.find(
                        (item) => item.model == checkedList1[i].model
                    );
                    if (item1) {
                        this.checkList1.push(item1);
                    }
                }
                if (this.checkList1.length > 0) {
                    this.confirmHeader(1);
                }
            }

            this.checkList2 = [];
            var checkedList2 = JSON.parse(this.datas.checkedList2);
            if (checkedList2) {
                for (var j = 0; j < checkedList2.length; j++) {
                    var item2 = this.itemlist2.find(
                        (item) => item.model == checkedList2[j].model
                    );
                    if (item2) {
                        this.checkList2.push(item2);
                    }
                }
                if (this.checkList2.length > 0) {
                    this.confirmHeader(2);
                }
            }
        },
        checkData: function (delta) {
            var data = this["datalist" + delta];
            var item = this["itemlist" + delta];
            var checked = this["checkedList" + delta];
            for (var i = 0; i < data.length; i++) {
                // 去除多余字段
                for (var j in data[i]) {
                    var index = checked.findIndex((item) => item.model == j);
                    if (index == -1) {
                        delete data[i][j];
                    }
                }
            }
            for (i = 0; i < data.length; i++) {
                // 补全缺失字段
                for (j = 0; j < item.length; j++) {
                    data[i][item[j].model] = data[i][item[j].model] || "";
                }
            }
            this["datalist" + delta] = JSON.parse(JSON.stringify(data));
        },
        trimData: function (delta) {
            var data = this["datalist" + delta];
            for (var i = 0; i < data.length; i++) {
                for (var j in data[i]) {
                    data[i][j] = (data[i][j] + "").trim();
                }
            }
            this["datalist" + delta] = data;
        },
        checkAllChange1: function (value) {
            this.checkAllChange(value, 1);
        },
        checkAllChange2: function (value) {
            this.checkAllChange(value, 2);
        },
        checkAllChange: function (value, delta) {
            this["checkList" + delta] = value ? this["itemlist" + delta] : [];
            this["isIndeterminate" + delta] = false;
        },
        checkListChange1: function (value) {
            this.checkListChange(value, 1);
        },
        checkListChange2: function (value) {
            this.checkListChange(value, 2);
        },
        checkListChange: function (value, delta) {
            let checkedCount = value.length;
            this["checkAll" + delta] =
                checkedCount === this["itemlist" + delta].length;
            this["isIndeterminate" + delta] =
                checkedCount > 0 &&
                checkedCount < this["itemlist" + delta].length;
        },
        keydown: function (event, delta, index, model) {
            var e = event;
            if (e && e.ctrlKey && e.shiftKey && e.keyCode == 86) {
                e.preventDefault();
                this.paste(1, delta, index, model);
            } else if (e && e.ctrlKey && e.altKey && e.keyCode == 86) {
                e.preventDefault();
                this.paste(0, delta, index, model);
            }
        },
        paste: function (row, delta, index, model) {
            var data = this["datalist" + delta][index][model]
                .replace(/\s+/g, " ")
                .trim()
                .split(" ");
            if (data.length == 1) {
                return true;
            }
            if (row) {
                var itemindex = this["checkedList" + delta].findIndex(
                    (item) => item.model == model
                );
                if (itemindex == -1) {
                    return true;
                }
                for (var i = 0; i < data.length; i++) {
                    if (!this["checkedList" + delta][itemindex + i]) {
                        break;
                    }
                    this["datalist" + delta][index][
                        this["checkedList" + delta][itemindex + i].model
                    ] = data[i];
                }
            } else {
                for (var j = 0; j < data.length; j++) {
                    if (!this["datalist" + delta][index + j]) {
                        this.addData(delta);
                    }
                    this["datalist" + delta][index + j][model] = data[j];
                }
            }
        },
        SetOcrData(ocrdata) {
            try {
                if (ocrdata.bill_type == 1 || ocrdata.bill_type == 2) {
                    this.form.bill_type = ocrdata.bill_type;
                }
                if (ocrdata.invoice_no) {
                    this.form.invoice_no = ocrdata.invoice_no;
                }
                if (ocrdata.zone) {
                    this.form.zone = ocrdata.zone;
                }
                if (ocrdata.name) {
                    this.form.name = ocrdata.name;
                }
                if (ocrdata.medical_type) {
                    this.form.medical_type = ocrdata.medical_type;
                }
                if (ocrdata.total_fee) {
                    this.form.total_fee = ocrdata.total_fee;
                }
                if (ocrdata.hospital_name) {
                    this.form.hospital_name = ocrdata.hospital_name;
                }
                if (ocrdata.h_types_omi) {
                    this.form.h_types_omi = ocrdata.h_types_omi;
                }
                if (ocrdata.sick_date) {
                    this.form.sick_date = ocrdata.sick_date;
                }
                if (ocrdata.admission_date) {
                    this.form.admission_date = ocrdata.admission_date;
                }
                if (ocrdata.discharge_date) {
                    this.form.discharge_date = ocrdata.discharge_date;
                }
                if (ocrdata.in_h_number) {
                    this.form.in_h_number = ocrdata.in_h_number;
                }
                if (ocrdata.infect_patch) {
                    this.form.infect_patch = ocrdata.infect_patch;
                }
                if (ocrdata.division) {
                    this.form.division = ocrdata.division;
                }
                if (ocrdata.bed_number) {
                    this.form.bed_number = ocrdata.bed_number;
                }
                // if (ocrdata.in_hosp_days) {
                //     this.form.in_hosp_days = ocrdata.in_hosp_days;
                // }
                if (ocrdata.medical_record_number) {
                    this.form.medical_record_number =
                        ocrdata.medical_record_number;
                }
                if (ocrdata.medical_institution_code) {
                    this.form.medical_institution_code =
                        ocrdata.medical_institution_code;
                }
                let p_group = [];
                for (let i = 0; i < ocrdata.p_group.length; i++) {
                    let item = ocrdata.p_group[i];
                    p_group.push({
                        group_amount: item.group_amount || "",
                        group_name: item.group_name || "",
                        individual_pay: item.individual_pay || "",
                        medical_pay: item.medical_pay || "",
                    });
                }
                this.form.p_group = p_group;
                let p_detail = [];
                for (let j = 0; j < ocrdata.p_detail.length; j++) {
                    let item = ocrdata.p_detail[j];
                    p_detail.push({
                        calss: item.calss || "",
                        count: item.count || "",
                        group_des: item.group_des || "",
                        increase_ratio: item.increase_ratio || "",
                        item_amount: item.item_amount || "",
                        item_name: item.item_name || "",
                        medical_insurance: item.medical_insurance || "",
                        outside_medical: item.outside_medical || "",
                        individual_pay: item.individual_pay || "",
                        project_code: item.project_code || "",
                        quantity_unit: item.quantity_unit || "",
                        self_pay: item.self_pay || "",
                        specifications: item.specifications || "",
                        unit_price: item.unit_price || "",
                        manual_proportion: item.manual_proportion || "",
                        manual_amount: item.manual_amount || ""
                    });
                }
                this.form.p_detail = p_detail;
            } catch (err) {}
        },
    },
};
</script>

<style lang="scss">
.el-image-viewer__wrapper {
    position: absolute;
}

.my-autocomplete {
    li {
        line-height: normal;
        padding: 7px;

        .name {
            text-overflow: ellipsis;
            overflow: hidden;
        }

        .addr {
            font-size: 12px;
            color: #b4b4b4;
        }

        .highlighted .addr {
            color: #ddd;
        }
    }
}
</style>
