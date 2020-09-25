<template>
  <div style="width:100%;height:100%;" ref="main" id="main">
    <el-form label-width="100px" ref="queryform" style="padding: 10px 0;box-sizing:border-box;">
      <el-row>
        <el-col :span="6">
          <el-form-item label="省份">
            <el-select v-model="listKeywords.province" style="width:100%;">
              <el-option
                v-for="item in provincelist"
                :key="item.code"
                :label="item.name"
                :value="item.code"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="9" :offset="1">
          <el-form-item label="报案时间">
            <el-date-picker
              type="daterange"
              v-model="listKeywords.datevalue"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
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
        <el-table-column prop="name" label="省份"></el-table-column>
        <el-table-column prop="count1" label="待领取"></el-table-column>
        <el-table-column prop="count2" label="待处理"></el-table-column>
        <el-table-column prop="count3" label="待质检"></el-table-column>
        <el-table-column prop="count4" label="已完成"></el-table-column>
        <el-table-column prop="fpcount" label="发票数量"></el-table-column>
        <el-table-column prop="qdcount" label="清单数量"></el-table-column>
        <el-table-column prop="qtcount" label="其他"></el-table-column>
        <el-table-column prop="count5" label="退回数量"></el-table-column>
      </el-table>
    </template>
    <template>
      <Pagination
        :total="listQuery.total"
        :page.sync="listQuery.currentPage"
        :limit.sync="listQuery.pageSize"
        @pagination="GetOperationStatistics(arguments)"
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
        province: '',
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
      provincelist: [],
      dir: ''
    }
  },
  created() {
    this.listKeywords.datevalue = [new Date(), new Date()]
    this.GetOperationStatistics()
    this.GetProvince()
    this.GetFileUrl()
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
      this.GetOperationStatistics()
    },
    async GetOperationStatistics() {
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
          province: this.listKeywords.province,
          //   currentPage: this.listQuery.currentPage,
          //   pageSize: this.listQuery.pageSize,
          uploadtime_start: uploadtime_start,
          uploadtime_end: uploadtime_end
        }
        let res = await window.axios.post('/api/GetOperationStatistics', params)
        loading.close()
        if (res.code == 200) {
          console.log(res.data.topics)

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
    async GetProvince() {
      try {
        let params = {}

        let res = await window.axios.post('/api/GetProvince', params)
        if (res.code == 200) {
          this.provincelist = res.data
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
    async GetFileUrl() {
      try {
        let params = {}

        let res = await window.axios.post('/api/GetFileUrl', params)
        if (res.code == 200) {
          this.dir = res.data
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
    resetOption() {
      this.listKeywords.province = ''
      this.listKeywords.datevalue = [new Date(), new Date()]
      this.listQuery.total = 0
      this.listQuery.currentPage = 0
      this.listQuery.pageSize = 50
      this.GetOperationStatistics()
    },
    async exportEvent() {
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
          province: this.listKeywords.province,
          //   currentPage: this.listQuery.currentPage,
          //   pageSize: this.listQuery.pageSize,
          uploadtime_start: uploadtime_start,
          uploadtime_end: uploadtime_end
        }
        let res = await window.axios.post('/api/exportOperationStatistics', params)
        loading.close()
        if (res.code == 200) {
          this.$message.success("导出成功");
          var filename = res.data.filename;
          var href = this.dir + "export_excel/" + filename;
          window.open(href);
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
  text-align: center;
}
</style>
