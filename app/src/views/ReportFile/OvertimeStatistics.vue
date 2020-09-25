<template>
  <div style="width:100%;height:100%;" ref="main" id="main">
    <el-form label-width="100px" ref="queryform" style="padding: 10px 0;box-sizing:border-box;">
      <el-row>
        <el-col :span="6">
          <el-form-item label="姓名">
            <el-select v-model="listKeywords.userid" style="width:100%;" filterable>
              <el-option
                v-for="item in userlist"
                :key="item.id"
                :label="item.realname"
                :value="item.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="9" :offset="1">
          <el-form-item label="报案时间">
            <el-date-picker
              v-model="listKeywords.datevalue"
              type="date"
              align="center"
              placeholder="选择日期"
              :picker-options="pickerOptions"
            ></el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="6" :offset="1">
          <el-button type="primary" @click="searchEvent">搜索</el-button>
          <el-button type="primary" @click="resetOption">重置</el-button>
          <el-button type="primary" @click="exportEvent">导出</el-button>
        </el-col>
      </el-row>
    </el-form>
    <template>
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
        show-summary
        :summary-method="getSummaries"
      >
        <el-table-column type="index" label="序号" width="80" :index="indexMethod"></el-table-column>
        <el-table-column prop="realname" label="姓名"></el-table-column>
        <el-table-column prop="count1" label="录入任务"></el-table-column>
        <el-table-column prop="rowscount1" label="录入任务行数"></el-table-column>
        <el-table-column prop="count2" label="质检任务"></el-table-column>
        <el-table-column prop="rowscount2" label="质检任务行数"></el-table-column>
      </el-table>
    </template>
    <template>
      <Pagination
        :total="listQuery.total"
        :page.sync="listQuery.currentPage"
        :limit.sync="listQuery.pageSize"
        @pagination="GetOvertimeStatistics(arguments)"
        ref="pagination"
        style="display:none;"
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
      listKeywords: {
        userid: '',
        datevalue: ''
      },
      pickerOptions: {
        shortcuts: [
          {
            text: '今天',
            onClick(picker) {
              picker.$emit('pick', new Date())
            }
          },
          {
            text: '昨天',
            onClick(picker) {
              const date = new Date()
              date.setTime(date.getTime() - 3600 * 1000 * 24)
              picker.$emit('pick', date)
            }
          },
          {
            text: '一周前',
            onClick(picker) {
              const date = new Date()
              date.setTime(date.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', date)
            }
          }
        ]
      },
      userlist: []
    }
  },
  created() {
    this.listKeywords.datevalue = new Date()
    this.GetOvertimeStatistics()
    this.GetUser()
  },
  mounted() {
    this.$nextTick(() => {
      //   let h = this.$refs.main.offsetHeight
      let h = this.$store.state.h_height
      let h_pagination = this.$refs.pagination.$el.offsetHeight
      let h_queryform = this.$refs.queryform.$el.offsetHeight
      let h_main = h - h_pagination - h_queryform - 40
      this.style_table = 'height:' + h_main + 'px;'
    })
  },
  methods: {
    searchEvent() {
      this.listQuery.total = 0
      this.listQuery.currentPage = 0
      this.GetOvertimeStatistics()
    },
    async GetOvertimeStatistics() {
      const loading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      try {
        let uploadtime_start = ''
        let uploadtime_end = ''
        let pushtime = ''
        try {
          if (this.listKeywords.datevalue) {
            uploadtime_start = this.formatDate(
              this.listKeywords.datevalue,
              'yyyy-MM-dd 00:00:00'
            )
            uploadtime_end = this.formatDate(
              this.listKeywords.datevalue,
              'yyyy-MM-dd 23:59:59'
            )
            pushtime = this.formatDate(
              this.listKeywords.datevalue,
              'yyyy-MM-dd'
            )
          } else {
              this.$message({
                  message: "请选择报案时间",
                  type: 'warning'
              })
              loading.close()
              return false
          }
        } catch (err) {
          console.log('err:', err)
        }
        let params = {
          userid: this.listKeywords.userid,
          //   currentPage: this.listQuery.currentPage,
          //   pageSize: this.listQuery.pageSize,
          uploadtime_start: uploadtime_start,
          uploadtime_end: uploadtime_end,
          pushtime: pushtime
        }
        let res = await window.axios.post('/api/GetOvertimeStatistics', params)
        this.loading = false
        loading.close()
        if (res.code == 200) {
          this.tableData = res.data.topics
          this.listQuery.total = res.data.totalCount
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
    async GetUser() {
      const loading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      try {
        let params = {
          userid: JSON.parse(
            this.uncompileStr(sessionStorage.getItem('UserInfo'))
          ).id
        }
        let res = await window.axios.post('/api/GetAllUser', params)
        loading.close()
        if (res.code == 200) {
          this.userlist = res.data
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
    resetOption() {
      this.listKeywords.userid = ''
      this.listKeywords.datevalue = new Date()
      this.listQuery.total = 0
      this.listQuery.currentPage = 0
      this.listQuery.pageSize = 50
      this.GetOvertimeStatistics()
    },
    exportEvent() {},
    getSummaries(param) {
      const { columns, data } = param
      const sums = []
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '合计'
          return
        }
        const values = data.map(item => Number(item[column.property]))
        if (!values.every(value => isNaN(value))) {
          sums[index] = values.reduce((prev, curr) => {
            const value = Number(curr)
            if (!isNaN(value)) {
              return prev + curr
            } else {
              return prev
            }
          }, 0)
          //   sums[index]
        } else {
          sums[index] = ''
        }
      })

      return sums
    },
    indexMethod(index) {
      return this.listQuery.currentPage * this.listQuery.pageSize + index + 1
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
