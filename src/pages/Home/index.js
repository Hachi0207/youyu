import React, { lazy } from 'react'
import { Route } from 'react-router'
import { TabBar } from 'antd-mobile'

import './index.css'

import Index from '../Index'
// import HouseList from '../HouseList'
// import News from '../News'
// import Profile from '../Profile'
const HouseList = lazy(() => import('../HouseList'))
const News = lazy(() => import('../News'))
const Profile = lazy(() => import('../Profile'))

const tabItems = [
  { title: '首页', icon: 'icon-ind', path: '/home' },
  { title: '找房', icon: 'icon-findHouse', path: '/home/list' },
  { title: '资讯', icon: 'icon-infom', path: '/home/news' },
  { title: '我的', icon: 'icon-my', path: '/home/profile' },
]

export default class Home extends React.Component {
  state = {
    selectedTab: this.props.location.pathname,
  }

  componentDidUpdate(prevProps) {
    if (prevProps.location.pathname !== this.props.location.pathname) {
      //说明此时路由发生了切换
      this.setState({
        selectedTab: this.props.location.pathname,
      })
    }
  }

  renderTabBarItem() {
    return tabItems.map((item) => (
      <TabBar.Item
        icon={<i className={`iconfont ${item.icon}`} />}
        selectedIcon={<i className={`iconfont ${item.icon}`} />}
        title={item.title}
        key={item.title}
        selected={this.state.selectedTab === item.path}
        onPress={() => {
          this.setState({
            selectedTab: item.path,
          })

          this.props.history.push(item.path)
        }}
      ></TabBar.Item>
    ))
  }

  render() {
    return (
      <div className="home">
        <Route path="/home/news" component={News}></Route>
        <Route path="/home/list" component={HouseList}></Route>
        <Route exact path="/home" component={Index}></Route>
        <Route path="/home/profile" component={Profile}></Route>
        {/* TabBar */}
        <TabBar tintColor="#21b97a" noRenderContent="true" barTintColor="white">
          {this.renderTabBarItem()}
        </TabBar>
      </div>
    )
  }
}
