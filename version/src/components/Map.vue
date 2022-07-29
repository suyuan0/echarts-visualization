<template>
  <div class='com-container' @dblclick='revertMap'>
    <div ref='map_ref' class='com-chart'></div>
  </div>
</template>

<script>
import axios from 'axios'
import { getProvinceMapInfo } from '@/utils/map_utils'
import { mapState } from 'vuex'

export default {
  name: 'c-Map',
  data() {
    return {
      chartInstance: null,
      allData: null,
      mapData: {} // 省份地图数据
    }
  },
  computed: {
    ...mapState(['theme'])
  },
  created() {
    // 在组件创建完成之后 进行回调函数注册
    this.$socket.registerCallBack('mapData', this.getData)
  },
  mounted() {
    this.initChart()
    // this.getData()
    // 告诉服务器 我需要消息
    this.$socket.send({
      action: 'getData',
      socketType: 'mapData',
      chartName: 'map',
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
    async initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.map_ref, this.theme)
      // 获取总过地图的适量数据
      const { data } = await axios.get('http://localhost:7000/static/map/china.json')
      this.$echarts.registerMap('china', data)
      const initOption = {
        title: {
          text: '▎👻商家分布',
          left: 20,
          top: 20
        },
        geo: {
          type: 'map',
          map: 'china',
          top: '5%',
          bottom: '5%',
          itemStyle: {
            areaColor: '#2e72bf',
            borderColor: '#333'
          }
        },
        legend: {
          left: '5%',
          bottom: '5%',
          orient: 'vertical'
        }
      }
      // 点击事件监听
      this.chartInstance.on('click', async ({ name }) => {
        // 将中文名称转换为英文名称
        const { path, key } = getProvinceMapInfo(name)
        // 判断是否是省份
        if (!key) return
        // 判断是否已经加载过数据
        if (!this.mapData[key]) {
          const { data: provinceData } = await axios.get(`http://localhost:7000${path}`)
          this.mapData[key] = provinceData
          // 省份数据英文
          this.$echarts.registerMap(key, provinceData)
        }
        const changeOption = {
          geo: {
            map: key
          }
        }
        this.chartInstance.setOption(changeOption)
      })
      this.chartInstance.setOption(initOption)
    },
    // 获取数据
    async getData(res) {
      // const { data } = await this.$http.get('/map')
      this.allData = res
      this.allData.forEach(item => {
        if (item.name === '砖石用户' && item.name) {
          item.name = '钻石用户'
        }
      })
      this.updateChart()
    },
    // 更新图表
    updateChart() {
      // 处理数据
      const legendArr = this.allData.map(item => item.name)
      const seriesArr = this.allData.map(item => {
        // return的这个对象就代表的是一个类别下的所有散点图的数据
        // 如果想在地图中显示散点的数据，所以我们需要给散点的图表增加一个配置，coordinateSystem: 'geo'
        return {
          type: 'effectScatter',
          name: item.name,
          data: item.children,
          coordinateSystem: 'geo',
          rippleEffect: {
            brushType: 'stroke',
            scale: 5
          }
        }
      })
      const dataOption = {
        legend: {
          data: legendArr
        },
        series: seriesArr
      }
      this.chartInstance.setOption(dataOption)
    },
    // 重置图表大小
    resizeChart() {
      const titleFontSize = this.$refs.map_ref.offsetWidth / 100 * 3.6
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize
          }
        },
        legend: {
          itemWidth: titleFontSize / 2,
          itemHeight: titleFontSize / 2,
          itemGap: titleFontSize / 2,
          textStyle: {
            fontSize: titleFontSize / 2
          }
        }
      }
      this.chartInstance.setOption(adapterOption)
      this.chartInstance.resize()
    },
    // 反转地图
    revertMap() {
      const revertOption = {
        geo: {
          map: 'china'
        }
      }
      this.chartInstance.setOption(revertOption)
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
