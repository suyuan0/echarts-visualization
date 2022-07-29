<template>
  <div class='com-container'>
    <div ref='hot_ref' class='com-chart'></div>
    <span :style='comStyle' class='iconfont arr-left' @click='toLeft'>&#xe6eb;</span>
    <span :style='comStyle' class='iconfont arr-right' @click='toRight'>&#xe6ee;</span>
    <span :style='comStyle' class='cat-name'>{{ catName }}</span>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getThemeValue } from '@/utils/theme_utils'

export default {
  name: 'c-Hot',
  data() {
    return {
      chartInstance: null,
      allData: null,
      // 数据索引
      dataIndex: 0,
      titleFontSize: 0
    }
  },
  computed: {
    catName() {
      if (!this.allData) return ''
      return this.allData[this.dataIndex]?.name
    },
    comStyle() {
      return {
        fontSize: this.titleFontSize + 'px',
        color: getThemeValue(this.theme).titleColor
      }
    },
    ...mapState(['theme'])
  },
  created() {
    // 在组件创建完成之后 进行回调函数注册
    this.$socket.registerCallBack('hotData', this.getData)
  },
  mounted() {
    this.initChart()
    // this.getData()
    // 告诉服务器 我需要消息
    this.$socket.send({
      action: 'getData',
      socketType: 'hotData',
      chartName: 'hot',
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
  methods: {
    // 初始化图表
    initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.hot_ref, this.theme)
      const initOption = {
        title: {
          text: '▎🐲热销商品的占比',
          left: 20,
          top: 20
        },
        legend: {
          top: '15%',
          icon: 'circle'
        },
        tooltip: {
          show: true,
          formatter: (arg) => {
            const thirdCategory = arg.data.children
            // 计算三级分类的占比
            let total = 0
            thirdCategory.forEach(item => {
              total += item.value
            })
            let retStr = ''
            thirdCategory.forEach(item => {
              retStr += `${item.name}: ${(item.value / total * 100).toFixed(2)}%<br>`
            })
            return retStr
          }
        },
        series: [
          {
            type: 'pie',
            label: {
              show: false
            },
            emphasis: {
              label: {
                show: true
              },
              labelLine: {
                show: false
              }
            }
          }
        ]
      }
      this.chartInstance.setOption(initOption)
    },
    // 获取数据
    async getData(res) {
      // const { data } = await this.$http.get('/hotproduct')
      // console.log(data)
      this.allData = res
      this.updateChart()
    },
    // 更新图表
    updateChart() {
      // 处理数据
      const legendData = this.allData[this.dataIndex].children.map(item => item.name)
      const seriesData = this.allData[this.dataIndex].children.map(item => {
        return {
          name: item.name,
          value: item.value,
          children: item.children
        }
      })
      const dataOption = {
        legend: {
          data: legendData
        },
        series: [
          {
            data: seriesData
          }
        ]
      }
      this.chartInstance.setOption(dataOption)
    },
    // 重置图表大小
    resizeChart() {
      this.titleFontSize = this.$refs.hot_ref.offsetWidth / 100 * 3.6
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: this.titleFontSize
          }
        },
        legend: {
          itemWidth: this.titleFontSize,
          itemHeight: this.titleFontSize,
          textStyle: {
            fontSize: this.titleFontSize / 2
          }
        },
        series: [
          {
            radius: this.titleFontSize * 4.5,
            center: ['50%', '50%']
          }
        ]
      }
      this.chartInstance.setOption(adapterOption)
      this.chartInstance.resize()
    },
    // 向左翻页
    toLeft() {
      this.dataIndex--
      if (this.dataIndex < 0) {
        this.dataIndex = this.allData.length - 1
      }
      this.updateChart()
    },
    // 向右翻页
    toRight() {
      this.dataIndex++
      if (this.dataIndex > this.allData.length - 1) {
        this.dataIndex = 0
      }
      this.updateChart()
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
.arr-left, .arr-right {
  position: absolute;
  top: 50%;
  transform: translateY(-50%) rotate(90deg);
  cursor: pointer;
  color: #fff;
  transition: 0.5s;

  &:hover {
    color: #bd2c00;
  }
}

.arr-left {
  left: 10%;
}

.arr-right {
  right: 10%;
}

.cat-name {
  position: absolute;
  left: 80%;
  bottom: 20px;
  color: #fff;
}
</style>
