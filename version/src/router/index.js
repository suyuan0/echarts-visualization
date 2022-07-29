import Vue from 'vue'
import VueRouter from 'vue-router'
import SellerPage from '@/views/SellerPage'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/screen'
  },
  {
    path: '/screen',
    name: 'screen',
    component: () => import('@/views/ScreenPage')
  },
  {
    path: '/SellerPage',
    name: 'SellerPage',
    component: SellerPage
  },
  {
    path: '/trendPage',
    name: 'trendPage',
    component: () => import('@/views/TrendPage')
  },
  {
    path: '/mapPage',
    name: 'map',
    component: () => import('@/views/MapPage')
  },
  {
    path: '/rankPage',
    name: 'rankPage',
    component: () => import('@/views/RankPage')
  },
  {
    path: '/hotPage',
    name: 'hotPage',
    component: () => import('@/views/HotPage')
  },
  {
    path: '/stockPage',
    name: 'stockPage',
    component: () => import('@/views/StockPage')
  }
]

const router = new VueRouter({
  routes
})

export default router
