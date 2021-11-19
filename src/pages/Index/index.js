import React from 'react'
import { Carousel, Flex, Grid, WingBlank } from 'antd-mobile'
import axios from 'axios'

import './index.scss'

// 导入封装好的获取当前定位城市的函数
import { getCurrentCity } from '../../utils'

// 导入搜索导航栏组件
import SearchHeader from '../../components/SearchHeader'

// 导入导航菜单图片
import Nav1 from '../../assets/images/nav-1.png'
import Nav2 from '../../assets/images/nav-2.png'
import Nav3 from '../../assets/images/nav-3.png'
import Nav4 from '../../assets/images/nav-4.png'

import { BASE_URL } from '../../utils/url'

import New from '../../components/News'

// 导航菜单数据
const navs = [
  {
    id: 1,
    img: Nav1,
    title: '整租',
    path: '/home/list',
  },
  {
    id: 2,
    img: Nav2,
    title: '合租',
    path: '/home/list',
  },
  {
    id: 3,
    img: Nav3,
    title: '地图找房',
    path: '/map',
  },
  {
    id: 4,
    img: Nav4,
    title: '去出租',
    path: '/rent/add',
  },
]

export default class News extends React.Component {
  state = {
    swipers: [],
    isSwiperloaded: false,
    groups: [],
    curCityName: '上海',
  }

  //获取轮播图数据方法
  async getSwipers() {
    const { data } = await axios.get('http://localhost:8080/home/swiper')
    this.setState(() => {
      return {
        swipers: data.body,
        isSwiperloaded: true,
      }
    })
  }

  //获取租房小组数据方法
  async getGroups() {
    const { data } = await axios.get('http://localhost:8080/home/groups', {
      params: {
        Carea: 'AREA%7C88cff55c-aaa4-e2e0',
      },
    })

    //更新数据
    this.setState({
      groups: data.body,
    })
  }

  // // 获取最新资讯方法
  // async getNews() {
  //   const { data } = await axios.get('http://localhost:8080/home/news', {
  //     params: {
  //       area: this.state.curCityValue,
  //     },
  //   })
  //   // console.log(data)
  //   this.setState({
  //     news: data.body,
  //   })
  // }

  //渲染轮播图结构
  renderSwipers() {
    return this.state.swipers.map((item) => (
      <a
        key={item.id}
        href="http://www.bilibili.com"
        style={{
          display: 'inline-block',
          width: '100%',
          height: 212,
        }}
      >
        <img
          src={BASE_URL + item.imgSrc}
          alt=""
          style={{ width: '100%', verticalAlign: 'top' }}
        />
      </a>
    ))
  }

  //渲染导航菜单
  renderNavs() {
    return navs.map((item) => (
      <Flex.Item
        key={item.id}
        onClick={() => this.props.history.push(item.path)}
      >
        <img src={item.img} alt="" />
        <h2>{item.title}</h2>
      </Flex.Item>
    ))
  }

  // 渲染最新资讯
  // renderNews() {
  //   return this.state.news.map((item) => (
  //     <div className="news-item" key={item.id}>
  //       <div className="imgwrap">
  //         <img
  //           className="img"
  //           src={`http://localhost:8080${item.imgSrc}`}
  //           alt=""
  //         ></img>
  //       </div>
  //       <Flex className="content" direction="column" justify="between">
  //         <h3 className="title">{item.title}</h3>
  //         <Flex className="info" justify="between">
  //           <span>{item.from}</span>
  //           <span>{item.date}</span>
  //         </Flex>
  //       </Flex>
  //     </div>
  //   ))
  // }

  async componentDidMount() {
    this.getSwipers()
    this.getGroups()

    //通过id获取城市信息
    // var curCity = new window.BMapGL.LocalCity()
    // curCity.get(async (res) => {
    //   const { data } = await axios.get(
    //     `http://localhost:8080/area/info?name=${res.name}`
    //   )
    //   this.setState({
    //     curCityName: data.body.label,
    //   })
    // })
    const curCity = await getCurrentCity()
    this.setState({
      curCityName: curCity.label,
      curCityValue: curCity.value,
    })
    // console.log(this.state.curCityValue)
    // this.getNews()
  }
  render() {
    return (
      <div className="index">
        <div className="swiper">
          {this.state.isSwiperloaded ? (
            <Carousel autoplay infinite autoplayInterval={2500}>
              {this.renderSwipers()}
            </Carousel>
          ) : (
            ''
          )}

          {/* 搜索框 */}
          <SearchHeader cityName={this.state.curCityName} />
        </div>

        {/* 导航菜单 */}
        <Flex className="nav">{this.renderNavs()}</Flex>

        {/* 租房小组 */}
        <div className="group">
          <h3 className="group-title">
            租房小组 <span className="more">更多</span>
          </h3>
          {/* 宫格组件 */}
          <Grid
            data={this.state.groups}
            columnNum={2}
            square={false}
            hasLine={false}
            renderItem={(item) => (
              <Flex className="group-item" justify="around" key={item.id}>
                <div className="desc">
                  <p className="title">{item.title}</p>
                  <span className="info">{item.desc}</span>
                </div>
                <img src={BASE_URL + item.imgSrc} alt="" />
              </Flex>
            )}
          />
        </div>
        {/* 相关资讯 */}
        <div className="news">
          <h3 className="group-title">最新资讯</h3>
          <WingBlank size="md">
            <New></New>
          </WingBlank>
        </div>
      </div>
    )
  }
}
