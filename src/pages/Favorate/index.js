import React from 'react'

// 导入复用组件表头
import NavHeader from '../../components/NavHeader'
import HouseItem from '../../components/HouseItem'

import { API, BASE_URL } from '../../utils'

export default class Favorate extends React.Component {
  state = {
    list: [],
  }

  // 获取收藏信息
  async componentDidMount() {
    const res = await API.get('/user/favorites')
    const { body } = res.data
    // console.log(body)
    this.setState({
      list: body,
    })
  }

  render() {
    return (
      <div>
        <NavHeader>已收藏列表</NavHeader>
        {this.state.list.map((item, index) => {
          const house = this.state.list[index]
          return (
            <HouseItem
              key={item.houseCode}
              src={BASE_URL + item.houseImg}
              title={item.title}
              desc={item.desc}
              price={item.price}
              tags={item.tags}
              onClick={() => {
                this.props.history.push(`/detail/${house.houseCode}`)
              }}
            ></HouseItem>
          )
        })}
      </div>
    )
  }
}
