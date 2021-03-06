import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Rythz from '../views/Rythz.vue'
import History from '../views/History.vue'
import SetProduct from '../views/SetProduct.vue'
import SetCategory from '../views/SetCategory.vue'
import SetUser from '../views/SetUser.vue'
import store from '../store/index'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Rythz',
    component: Rythz,
    meta: { requiresVisitor: true }
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/history',
    name: 'History',
    component: History,
    meta: { requiresAuth: true }
  },
  {
    path: '/setproduct',
    name: 'SetProduct',
    component: SetProduct,
    meta: { requiresAuth: true }
  },
  {
    path: '/setcategory',
    name: 'SetCategory',
    component: SetCategory,
    meta: { requiresAuth: true }
  },
  {
    path: '/setuser',
    name: 'SetUser',
    component: SetUser,
    meta: { requiresAuth: true }
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

// Pengkondisian untuk meta require
router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // this route requires auth, check if logged in
    // if not, redirect to login page.
    if (!store.getters.isLogin) {
      next({
        path: '/'
      })
    } else {
      next()
    }
  } else if (to.matched.some(record => record.meta.requiresVisitor)) {
    if (store.getters.isLogin) {
      next(localStorage.removeItem('token'), { path: '/' })
    } else {
      next()
    }
  } else {
    next() // make sure to always call next()!
  }
})

export default router
