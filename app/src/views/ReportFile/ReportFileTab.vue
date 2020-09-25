<template>
  <div style="width:100%;height:100%;" ref="main" id="main">
    <el-tabs v-model="activeName" @tab-click="handleClick" ref="tab">
      <el-tab-pane label="运营统计" name="first">
          <OperationStatistics ref="OperationStatistics"></OperationStatistics>
      </el-tab-pane>
      <el-tab-pane label="人员任务" name="second">
        <TaskStatistics ref="TaskStatistics"></TaskStatistics>
      </el-tab-pane>
      <el-tab-pane label="加班任务" name="third">
        <OvertimeStatistics ref="OvertimeStatistics"></OvertimeStatistics>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import OperationStatistics from './OperationStatistics.vue';
import TaskStatistics from './TaskStatistics.vue';
import OvertimeStatistics from './OvertimeStatistics.vue';
export default {
  name: "TicketTab",
  components: {
    OperationStatistics,
    TaskStatistics,
    OvertimeStatistics
  },
  data() {
    return {
      activeName: "first"
    };
  },
  created: function() {
  },
  mounted: function() {
    this.$nextTick(() => {
      let h = this.$refs.main.offsetHeight
      // let h_tab = this.$refs.tab.$el.offsetHeight
      h = h - 40
      this.$store.commit('setHeight', h)
    //   let h_pagination = this.$refs.pagination.$el.offsetHeight
    })
  },
  methods: {
    handleClick(tab, event) {
      // console.log(tab, event);
    }
  }
};
</script>

<style scoped>
</style>
