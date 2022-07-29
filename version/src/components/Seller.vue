<!--商家销量统计 横向柱状图-->
<template>
  <div class='com-container'>
    <div ref='seller_ref' class='com-chart'></div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'SellerPage',
  data() {
    return {
      chartInstance: null,
      // 服务器返回的数据
      allData: null,
      // 页码
      currentPage: 1,
      totalPage: 0,
      // 定时器
      timer: null
    }
  },
  computed: {
    ...mapState(['theme'])
  },
  created() {
    // 在组件创建完成之后 进行回调函数注册
    this.$socket.registerCallBack('sellerData', this.getData)
  },
  mounted() {
    this.initChart()
    // this.getData()
    // 告诉服务器 我需要消息
    this.$socket.send({
      action: 'getData',
      socketType: 'sellerData',
      chartName: 'seller',
      value: ''
    })
    window.addEventListener('resize', this.resizeChart)
    this.resizeChart()
  },
  destroyed() {
    clearInterval(this.timer)
    window.removeEventListener('resize', this.resizeChart)
    // 在组件销毁之前 进行回调函数注销
    this.$socket.unRegisterCallBack('trend')
  },
  methods: {
    // 初始化echartsInstance对象
    initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.seller_ref, this.theme)
      // 对图表初始化配置
      const initOption = {
        title: {
          text: '▎🐇商家销量统计',
          left: 20,
          top: 20
        },
        grid: {
          left: '3%',
          right: '6%',
          top: '20%',
          bottom: '3%',
          containLabel: true // 包含刻度标签的网格
        },
        xAxis: {
          type: 'value'
        },
        yAxis: {
          type: 'category'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line',
            z: 0,
            lineStyle: {
              color: '#2D3443'
            }
          }
        },
        series: [
          {
            type: 'bar',
            // 文字展示
            label: {
              show: true,
              position: 'right',
              textStyle: {
                color: '#fff'
              }
            },
            itemStyle: {
              // 柱状图颜色 知名渐变色方向 不同百分比之下的颜色
              color: new this.$echarts.graphic.LinearGradient(0, 0, 1, 0, [
                {
                  // 百分之0
                  offset: 0,
                  color: '#5052EE'
                },
                {
                  // 百分之百
                  offset: 1,
                  color: '#AB6EE5'
                }
              ])
            }
          }
        ]
      }
      this.chartInstance.setOption(initOption)
      // 鼠标移入移出事件
      this.chartInstance.on('mouseover', () => {
        // 鼠标移入时停止定时器
        clearInterval(this.timer)
      })
      this.chartInstance.on('mouseout', () => {
        // 鼠标移出时开始定时器
        this.setInterval()
      })
    },
    // 获取服务器数据
    async getData(res) {
      // const { data: res } = await this.$http.get('seller')
      this.allData = res.sort((a, b) => a.value - b.value)
      this.totalPage = this.allData.length % 5 === 0 ? this.allData.length / 5 : this.allData.length / 5 + 1
      this.updateChart()
      // 启动定时器
      this.setInterval()
    },
    // 更新图表
    updateChart() {
      const start = (this.currentPage - 1) * 5
      const end = this.currentPage * 5
      const showData = this.allData.slice(start, end)
      const option = {
        yAxis: {
          data: showData.map(item => item.name)
        },
        series: [
          {
            data: showData.map(item => item.value)
          }
        ]
      }
      this.chartInstance.setOption(option)
    },
    setInterval() {
      if (this.timer) {
        clearInterval(this.timer)
      }
      this.timer = setInterval(() => {
        this.currentPage++
        if (this.currentPage > this.totalPage) {
          this.currentPage = 1
        }
        this.updateChart()
      }, 3000)
    },
    // 屏幕大小改变时重绘图表
    resizeChart() {
      // 标题文字大小
      const titleFontSize = this.$refs.seller_ref.offsetWidth / 100 * 3.6
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize
          }
        },
        tooltip: {
          axisPointer: {
            lineStyle: {
              width: titleFontSize
            }
          }
        },
        series: {
          barWidth: titleFontSize,
          itemStyle: {
            barBorderRadius: [0, titleFontSize / 2, titleFontSize / 2, 0]
          }
        }
      }
      this.chartInstance.setOption(adapterOption)
      this.chartInstance.resize()
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
.com-container {
  .com-chart {
  }
}
</style>
