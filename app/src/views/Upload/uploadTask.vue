<template>
  <div style="width:100%;height:100%;" ref="main" id="main">
    <el-form label-width="100px" ref="queryform" style="padding: 10px 0;box-sizing:border-box;">
      <el-row>
        <el-col :span="4">
          <el-form-item label="任务状态">
            <el-select v-model="listKeywords.status" style="width:100%;">
              <el-option label="待领取" value="0"></el-option>
              <el-option label="待处理" value="1"></el-option>
              <el-option label="待质检" value="2"></el-option>
              <el-option label="被驳回" value="3"></el-option>
              <el-option label="已完成" value="4"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="10" :offset="1">
          <el-form-item label="文件接收时间">
            <el-date-picker
              v-model="listKeywords.datevalue"
              type="daterange"
              align="right"
              unlink-panels
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :picker-options="pickerOptions"
              clearable
            ></el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="6" :offset="1">
          <el-button type="primary" @click="GetAllTasks">查询</el-button>
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
      <el-table-column type="index" label="序号" width="80" :index="indexMethod"></el-table-column>
      <el-table-column prop="filename" label="文件名"></el-table-column>
      <!-- <el-table-column prop="ticketID" label="ticketID"></el-table-column> -->
      <el-table-column prop="uploadtime" label="文件接收时间"></el-table-column>
      <el-table-column prop="gettasktime" label="派发/领取时间"></el-table-column>
      <!-- <el-table-column prop="realname" label="录单人员姓名"></el-table-column>
            <el-table-column prop="submittime" label="录单提交时间"></el-table-column>
            <el-table-column prop="realname2" label="质检人员姓名"></el-table-column>
      <el-table-column prop="submittime2" label="质检提交时间"></el-table-column>-->
      <el-table-column prop="pushtime" label="推送数据时间"></el-table-column>
      <el-table-column label="任务状态" :formatter="StatusFormatter"></el-table-column>
      <el-table-column label="图片预览" width="150">
        <template slot-scope="scope">
          <el-image :src="scope.row.filepath" :preview-src-list="[scope.row.filepath]"></el-image>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
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
        @pagination="GetAllTasks(arguments)"
        ref="pagination"
      />
    </template>
  </div>
</template>

<script>
import Pagination from '../../components/Pagination'
export default {
  name: 'AllTask',
  components: { Pagination },
  data() {
    return {
      style_table: '',
      tableData: [],
      listQuery: {
        total: 0,
        currentPage: 0, //与后台定义好的分页参数
        pageSize: 50
      },
      headClass() {
        return 'text-align: center;background:#eef1f6;'
      },
      rowClass() {
        return 'text-align: center;'
      },
      dialogVisible: false,
      QualityUsers: [],
      userid: '',
      fileid: 0,
      listKeywords: {
        ticketID: '',
        userid: '',
        realname: '',
        userid2: '',
        realname2: '',
        status: '',
        datevalue: ''
      },
      pickerOptions: {
        shortcuts: [
          {
            text: '最近一周',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            }
          }
        ]
      },
      role: "",
      caseId: ""
    }
  },
  created() {
    this.listKeywords.datevalue = [new Date(), new Date()]
  },
  mounted() {
    this.$nextTick(() => {
      let h = this.$refs.main.offsetHeight
      let h_pagination = this.$refs.pagination.$el.offsetHeight
      let h_queryform = this.$refs.queryform.$el.offsetHeight
      let h_main = h - h_pagination - h_queryform
      this.style_table = 'height:' + h_main + 'px;'
    })
    let role = JSON.parse(
      this.uncompileStr(sessionStorage.getItem("UserInfo"))
    ).role.toString();
    this.role = role;let caseId = JSON.parse(
      this.uncompileStr(sessionStorage.getItem("UserInfo"))
    ).caseId.toString();
    this.caseId = caseId;
    this.GetAllTasks()
  },
  methods: {
    async GetAllTasks() {
      const loading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      try {
        let uploadtime_start = ''
        let uploadtime_end = ''
        try {
          if (this.listKeywords.datevalue.length == 2) {
            uploadtime_start = this.formatDate(
              this.listKeywords.datevalue[0],
              'yyyy-MM-dd 00:00:00'
            )
            uploadtime_end = this.formatDate(
              this.listKeywords.datevalue[1],
              'yyyy-MM-dd 23:59:59'
            )
          }
        } catch (err) {
          console.log('err:', err)
        }
        let params = {
          currentPage: this.listQuery.currentPage,
          pageSize: this.listQuery.pageSize,
          status: this.listKeywords.status,
          uploadtime_start: uploadtime_start,
          uploadtime_end: uploadtime_end,
          // role: this.role,
          caseId: this.caseId
        }
        let res = await window.axios.post('/api/GetUploadTasks', params)
        loading.close()
        if (res.code == 200) {
          this.tableData = res.data.topics
          this.listQuery.total = res.data.total
        } else {
          this.$message({
            message: res.msg,
            type: 'warning'
          })
        }
      } catch (error) {
        loading.close()
        this.$message({
          message: error,
          type: 'warning'
        })
      }
    },
    indexMethod(index) {
      return this.listQuery.currentPage * this.listQuery.pageSize + index + 1
    },
    async ReceiveTasks() {
      try {
        let params = {
          userid: JSON.parse(
            this.uncompileStr(sessionStorage.getItem('UserInfo'))
          ).id,
          realname: JSON.parse(
            this.uncompileStr(sessionStorage.getItem('UserInfo'))
          ).realname
        }
        const loading = this.$loading({
          lock: true,
          text: 'Loading',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        })
        let res = await window.axios.post('/api/ReceiveTasks', params)
        loading.close()
        if (res.code == 200) {
          this.GetTasks()
        } else {
          this.$message({
            message: res.msg,
            type: 'warning'
          })
        }
      } catch (error) {
        this.$message({
          message: error,
          type: 'warning'
        })
      }
    },
    Details(fileid) {
      this.$store.commit('SetFileid', fileid)
      this.$router.push('/uploadTaskDetail')
    },
    StatusFormatter(row, column) {
      var status = row.status
      var userid = row.userid
      var userid2 = row.userid2
      var currentUserid = JSON.parse(
        this.uncompileStr(sessionStorage.getItem('UserInfo'))
      ).id
      var str = ''
      if (userid == currentUserid) {
        if (status == 1) {
          str = '待处理'
        } else if (status == 2) {
          str = '待质检'
        } else if (status == 3) {
          str = '被驳回'
        } else if (status == 4) {
          str = '已完成'
        }
      } else if (userid2 == currentUserid) {
        if (status == 2) {
          str = '待处理'
        }
      } else {
        if (status == 0) {
          str = '待领取'
        } else if (status == 1) {
          str = '待处理'
        } else if (status == 2) {
          str = '待质检'
        } else if (status == 3) {
          str = '被驳回'
        } else if (status == 4) {
          str = '已完成'
        }
      }
      if (!str) {
        str = '状态异常'
      }
      return str
    },
    formatDate(date, fmt) {
      var o = {
        'M+': date.getMonth() + 1,
        'd+': date.getDate(),
        'h+': date.getHours(),
        'm+': date.getMinutes(),
        's+': date.getSeconds(),
        'q+': Math.floor((date.getMonth() + 3) / 3),
        S: date.getMilliseconds() //毫秒
      }
      if (/(y+)/.test(fmt))
        fmt = fmt.replace(
          RegExp.$1,
          (date.getFullYear() + '').substr(4 - RegExp.$1.length)
        )
      for (var k in o)
        if (new RegExp('(' + k + ')').test(fmt))
          fmt = fmt.replace(
            RegExp.$1,
            RegExp.$1.length == 1
              ? o[k]
              : ('00' + o[k]).substr(('' + o[k]).length)
          )
      return fmt
    }
  }
}
</script>
<style scoped>
.table {
  width: 100%;
}
#main >>> .customWidth {
  width: 400px;
}
</style>
