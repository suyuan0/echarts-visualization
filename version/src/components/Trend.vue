<template>
  <div class='com-container'>
    <div :style='comStyle' class='title'>
      <span>{{ '▎🐸' + showTitle }}</span>
      <span :style='comStyle' class='iconfont title-icon' @click='showChoice = !showChoice'>&#xe6eb;</span>
      <div v-show='showChoice' :style='marginStyle' class='select-con'>
        <div v-for='item in selectTypes' :key='item.key' class='select-item' @click='handleSelect(item.key)'>
          {{ '🐸' + item.text }}
        </div>
      </div>
    </div>
    <div ref='trend_ref' class='com-chart'></div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getThemeValue } from '@/utils/theme_utils'

export default {
  name: 'c-Trend',
  data() {
    return {
      chartInstance: null,
      allData: null,
      showChoice: false, // 是否显示选择框
      choiceType: 'map', // 选择框选择的类型,
      titleFontSize: 0
    }
  },
  created() {
    // 在组件创建完成之后 进行回调函数注册
    this.$socket.registerCallBack('trendData', this.getData)
  },
  mounted() {
    this.initChart()
    // this.getData()
    // 告诉服务器 我需要消息
    this.$socket.send({
      action: 'getData',
      socketType: 'trendData',
      chartName: 'trend',
      value: ''
    })
    window.addEventListener('resize', this.resizeChart)
    this.resizeChart()
  },
  destroyed() {
    window.removeEventListener('resize', this.resizeChart)
    // 在组件销毁之前 进行回调函数注销
    this.$socket.unRegisterCallBack('trend')
  },
  computed: {
    selectTypes() {
      return this.allData?.type.filter(item => item.key !== this.choiceType) || []
    },
    showTitle() {
      if (!this.allData) return ''
      return this.allData[this.choiceType].title
    },
    // 设置标题样式
    comStyle() {
      return {
        fontSize: this.titleFontSize + 'px',
        color: getThemeValue(this.theme).titleColor
      }
    },
    marginStyle() {
      return {
        marginLeft: this.titleFontSize - 20 + 'px'
      }
    },
    ...mapState(['theme'])
  },
  methods: {
    // 初始化图表
    initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.trend_ref, this.theme)
      const initOption = {
        grid: {
          left: '3%',
          right: '4%',
          top: '35%',
          bottom: '1%',
          containLabel: true
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          left: 20,
          top: '15%',
          icon: 'circle'
        },
        xAxis: {
          type: 'category',
          boundaryGap: false
        },
        yAxis: {
          type: 'value'
        }
      }
      this.chartInstance.setOption(initOption)
    },
    // 获取数据
    getData(res) {
      // console.log(ret, 'res')
      // const { data: res } = await this.$http.get('/trend')
      this.allData = res
      this.updateChart()
    },
    // 更新图表
    updateChart() {
      // 半透明颜色值
      const colorArr1 = [
        'rgba(11,168,44,0.5)',
        'rgba(44,110,255,0.5)',
        'rgba(22,242,217,0.5)',
        'rgba(254,33,30,0.5)',
        'rgba(250,105,0,0.5)'
      ]
      // 全透明
      const colorArr2 = [
        'rgba(11,168,44,0)',
        'rgba(44,110,255,0)',
        'rgba(22,242,217,0)',
        'rgba(254,33,30,0)',
        'rgba(250,105,0,0)'
      ]
      // 处理数据
      // 类目轴数据
      const timeArr = this.allData.common.month
      // 数值轴数据
      const valueArr = this.allData[this.choiceType].data
      const seriesArr = valueArr.map((item, index) => {
        return {
          type: 'line',
          data: item.data,
          stack: this.choiceType,
          name: item.name,
          areaStyle: {
            color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: colorArr1[index]
              },
              {
                offset: 1,
                color: colorArr2[index]
              }
            ])
          }
        }
      })
      // 图例数据
      const legendArr = valueArr.map(item => item.name)
      const dataOption = {
        xAxis: {
          data: timeArr
        },
        legend: {
          data: legendArr
        },
        series: seriesArr
      }
      this.chartInstance.setOption(dataOption)
    },
    // 重置图表大小
    resizeChart() {
      this.titleFontSize = this.$refs.trend_ref.offsetWidth / 100 * 3.6
      const adapterOption = {
        legend: {
          itemWidth: this.titleFontSize,
          itemHeight: this.titleFontSize,
          itemGap: this.titleFontSize,
          textStyle: {
            fontSize: this.titleFontSize / 2
          }
        }
      }
      this.chartInstance.setOption(adapterOption)
      this.chartInstance.resize()
    },
    // 处理选择框选择的类型
    handleSelect(type) {
      this.choiceType = type
      this.updateChart()
      // 更新选择框的显示状态
      this.showChoice = false
    }
  },
  watch: {
    theme() {
      this.chartInstance.dispose()
      this.initChart()
      this.resizeChart()
      this.updateChart()
    }
  }
}
</script>

<style lang='scss' scoped>
.title {
  position: absolute;
  left: 20px;
  top: 20px;
  z-index: 10;
  color: #fff;
  transition: all 0.5s;

  .title-icon {
    margin-left: 10px;
    cursor: pointer;
  }

  .select-con {
    //background: #222733;

    .select-item {
      cursor: pointer;
      margin-left: 10px;

      &:hover {
        transition: .5s;
        color: lightpink;
      }
    }
  }
}
</style>
