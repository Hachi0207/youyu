import React, { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom'

import Home from './pages/Home'
// import CityList from './pages/CityList'
// import Map from './pages/Map'
// import HouseDetail from './pages/HouseDetail'
// import Login from './pages/Login'
// import Registe from './pages/Registe'

// // 导入封装好的权限路由
import AuthRoute from './components/AuthRoute'

// // 房源发布模块
// import Rent from './pages/Rent'
// import RentAdd from './pages/Rent/Add'
// import RentSearch from './pages/Rent/Search'
// import Favorate from './pages/Favorate'

// 使用动态组件的方式导入组件
const CityList = lazy(() => import('./pages/CityList'))
const Map = lazy(() => import('./pages/Map'))
const HouseDetail = lazy(() => import('./pages/HouseDetail'))
const Login = lazy(() => import('./pages/Login'))
const Registe = lazy(() => import('./pages/Registe'))
const Rent = lazy(() => import('./pages/Rent'))
const RentAdd = lazy(() => import('./pages/Rent/Add'))
const RentSearch = lazy(() => import('./pages/Rent/Search'))
const Favorate = lazy(() => import('./pages/Favorate'))

function App() {
  return (
    <Router>
      <Suspense fallback={<div className="route-loading">loading...</div>}>
        <div className="App">
          {/* 配置路由 */}
          <Route path="/home" component={Home}></Route>

          <Route path="/citylist" component={CityList}></Route>
          <Route path="/map" component={Map}></Route>
          {/* 默认路由匹配时，跳转到 /home 实现路由重定向到首页 */}
          <Route exact path="/" render={() => <Redirect to="/home" />}></Route>
          {/* 房源详情路由规则 */}
          <Route path="/detail/:id" component={HouseDetail}></Route>
          {/* 登录页面路由规则 */}
          <Route path="/login" component={Login}></Route>
          {/* 注册页面路由规则 */}
          <Route path="/registe" component={Registe}></Route>
          {/* 登录后房源发布路由 */}
          <AuthRoute exact path="/rent" component={Rent} />
          <AuthRoute path="/rent/add" component={RentAdd} />
          <AuthRoute path="/rent/search" component={RentSearch} />
          {/* 收藏也页面路由 */}
          <AuthRoute path="/favorate" component={Favorate} />
        </div>
      </Suspense>
    </Router>
  )
}

export default App
