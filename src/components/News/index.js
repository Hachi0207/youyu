import React from 'react'
import { Flex } from 'antd-mobile'
import axios from 'axios'

import './index.scss'

// 导入封装好的获取当前定位城市的函数
import { getCurrentCity } from '../../utils'

export default class News extends React.Component {
  state = {
    curCityValue: '',
    news: [],
  }

  // 获取最新资讯方法
  async getNews() {
    const { data } = await axios.get('http://localhost:8080/home/news', {
      params: {
        area: this.state.curCityValue,
      },
    })
    // console.log(data)
    this.setState({
      news: data.body,
    })
  }

  async componentDidMount() {
    const curCity = await getCurrentCity()
    this.setState({
      curCityValue: curCity.value,
    })

    this.getNews()
  }

  render() {
    return this.state.news.map((item) => (
      <div className="news-item" key={item.id}>
        <div className="imgwrap">
          <img
            className="img"
            src={`http://localhost:8080${item.imgSrc}`}
            alt=""
          ></img>
        </div>
        <Flex className="content" direction="column" justify="between">
          <h3 className="title">{item.title}</h3>
          <Flex className="info" justify="between">
            <span>{item.from}</span>
            <span>{item.date}</span>
          </Flex>
        </Flex>
      </div>
    ))
  }
}
