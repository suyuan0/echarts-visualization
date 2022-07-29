<template>
  <div class='com-container'>
    <div ref='rank_ref' class='com-chart'></div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'rankPage',
  data() {
    return {
      chartInstance: null,
      allData: null,
      // 区域缩放起点值
      startValue: 0,
      // 区域缩放终点值
      endValue: 9,
      // 定时器
      timer: null
    }
  },
  created() {
    // 在组件创建完成之后 进行回调函数注册
    this.$socket.registerCallBack('rankData', this.getData)
  },
  computed: {
    ...mapState(['theme'])
  },
  mounted() {
    this.initChart()
    // this.getData()
    // 告诉服务器 我需要消息
    this.$socket.send({
      action: 'getData',
      socketType: 'rankData',
      chartName: 'rank',
      value: ''
    })
    window.addEventListener('resize', this.resizeChart)
    this.resizeChart()
  },
  destroyed() {
    window.removeEventListener('resize', this.resizeChart)
    clearInterval(this.timer)
    // 在组件销毁之前 进行回调函数注销
    this.$socket.unRegisterCallBack('trend')
  },
  methods: {
    // 初始化图表
    initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.rank_ref, this.theme)
      const initOption = {
        title: {
          text: '▎🐳地区销售排行',
          left: 20,
          top: 20
        },
        grid: {
          top: '40%',
          left: '5%',
          right: '5%',
          bottom: '5%',
          containLabel: true // 包含刻度标签的网格
        },
        tooltip: {
          show: true
        },
        xAxis: {
          type: 'category'
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            type: 'bar'
          }
        ]
      }
      this.chartInstance.setOption(initOption)
      // 监听鼠标移入
      this.chartInstance.on('mouseover', (params) => {
        clearInterval(this.timer)
      })
      // 监听鼠标移出
      this.chartInstance.on('mouseout', (params) => {
        this.startInterval()
      })
    },
    // 获取数据
    async getData(res) {
      // const { data } = await this.$http.get('/rank')
      this.allData = res
      this.allData.sort((a, b) => b.value - a.value)
      this.updateChart()
      this.startInterval()
    },
    // 更新图表
    updateChart() {
      const colorArr = [
        ['#0ba82c', '#4ff778'],
        ['#2e72bf', '#23e5e5'],
        ['#5052ee', '#ab6ee5']
      ]
      // 处理数据
      // 省份数据
      const provinceArr = this.allData.map(item => item.name)
      // 销售额数据
      const valueArr = this.allData.map(item => item.value)
      const dataOption = {
        xAxis: {
          data: provinceArr
        },
        dataZoom: {
          show: false,
          startValue: this.startValue,
          endValue: this.endValue
        },
        series: [
          {
            data: valueArr,
            itemStyle: {
              color: ({ value }) => {
                let targetColorArr = null
                if (value > 300) {
                  targetColorArr = colorArr[0]
                } else if (value > 200) {
                  targetColorArr = colorArr[1]
                } else {
                  targetColorArr = colorArr[2]
                }
                return new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  {
                    offset: 0,
                    color: targetColorArr[0]
                  },
                  {
                    offset: 1,
                    color: targetColorArr[1]
                  }
                ])
              }
            }
          }
        ]
      }
      this.chartInstance.setOption(dataOption)
    },
    // 重置图表大小
    resizeChart() {
      // 标题文字大小
      const titleFontSize = this.$refs.rank_ref.offsetWidth / 100 * 3.6
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize
          }
        },
        series: [
          {
            barWidth: titleFontSize,
            itemStyle: {
              barBorderRadius: [titleFontSize / 2, titleFontSize / 2, 0, 0]
            }
          }
        ]
      }
      this.chartInstance.setOption(adapterOption)
      this.chartInstance.resize()
    },
    // 区域缩放起点值改变
    startInterval() {
      if (this.timer) {
        clearInterval(this.timer)
      }
      this.timer = setInterval(() => {
        this.startValue++
        this.endValue++
        if (this.endValue > this.allData.length - 1) {
          this.startValue = 0
          this.endValue = 9
        }
        this.updateChart()
      }, 2000)
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

<style scoped>

</style>
