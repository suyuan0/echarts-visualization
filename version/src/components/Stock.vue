<template>
  <div class='com-container'>
    <div ref='stock_ref' class='com-chart'></div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'c-stock',
  data() {
    return {
      chartInstance: null,
      allData: null,
      // 当前显示的数据
      currentIndex: 0,
      timer: null
    }
  },
  computed: {
    ...mapState(['theme'])
  },
  created() {
    // 在组件创建完成之后 进行回调函数注册
    this.$socket.registerCallBack('stockData', this.getData)
  },
  mounted() {
    this.initChart()
    // this.getData()
    // 告诉服务器 我需要消息
    this.$socket.send({
      action: 'getData',
      socketType: 'stockData',
      chartName: 'stock',
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
      this.chartInstance = this.$echarts.init(this.$refs.stock_ref, this.theme)
      const initOption = {
        title: {
          text: '▎😻库存和销量分析',
          left: 20,
          top: 20
        }
      }
      this.chartInstance.setOption(initOption)
      this.chartInstance.on('mouseover', () => {
        clearInterval(this.timer)
      })
      this.chartInstance.on('mouseout', () => {
        this.startInterval()
      })
    },
    // 获取数据
    async getData(res) {
      // const { data } = await this.$http.get('/stock')
      this.allData = res
      this.updateChart()
      this.startInterval()
    },
    // 更新图表
    updateChart() {
      const centerArr = [
        ['18%', '40%'],
        ['50%', '40%'],
        ['82%', '40%'],
        ['34%', '75%'],
        ['66%', '75%']
      ]
      const colorArr = [
        ['#4FF778', '#0BA82C'],
        ['#E5DD45', '#E8B11C'],
        ['#E8821C', '#E55445'],
        ['#5052EE', '#AB6EE5'],
        ['#23E5E5', '#2E72BF']
      ]
      // 处理数据
      const start = this.currentIndex * 5
      const end = (this.currentIndex + 1) * 5
      const showData = this.allData.slice(start, end)
      const seriesArr = showData.map((item, i) => {
        return {
          type: 'pie',
          center: centerArr[i],
          hoverAnimation: false,
          labelLine: {
            show: false// 隐藏指示线
          },
          label: {
            position: 'center',
            color: colorArr[i][0]
          },
          data: [
            {
              value: item.sales,
              name: `${item.name}\n\n${item.sales}`,
              itemStyle: {
                color: new this.$echarts.graphic.LinearGradient(0, 1, 0, 0, [
                  { offset: 0, color: colorArr[i][0] },
                  { offset: 1, color: colorArr[i][1] }
                ])
              }
            },
            {
              value: item.stock,
              itemStyle: {
                color: '#333843'
              }
            }
          ]
        }
      })
      const dataOption = {
        series: seriesArr
      }
      this.chartInstance.setOption(dataOption)
    },
    // 重置图表大小
    resizeChart() {
      const titleFontSize = this.$refs.stock_ref.offsetWidth / 100 * 3.6
      const innerRadius = titleFontSize * 2.8
      const outerRadius = innerRadius * 1.125
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize
          }
        },
        series: [
          {
            type: 'pie',
            radius: [outerRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 2
            }
          },
          {
            type: 'pie',
            radius: [outerRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 2
            }
          },
          {
            type: 'pie',
            radius: [outerRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 2
            }
          },
          {
            type: 'pie',
            radius: [outerRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 2
            }
          },
          {
            type: 'pie',
            radius: [outerRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 2
            }
          }
        ]
      }
      this.chartInstance.setOption(adapterOption)
      this.chartInstance.resize()
    },
    startInterval() {
      if (this.timer) {
        clearInterval(this.timer)
      }
      this.timer = setInterval(() => {
        this.currentIndex++
        if (this.currentIndex > 1) {
          this.currentIndex = 0
        }
        this.updateChart()
      }, 5000)
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
