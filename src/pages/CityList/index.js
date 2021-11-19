import React from 'react'
import { Toast } from 'antd-mobile'
import './index.scss'
import axios from 'axios'

//导入封装好的获取定位城市信息的函数
import { getCurrentCity } from '../../utils'

//导入react-virtualized的list组件
import { List, AutoSizer } from 'react-virtualized'
import NavHeader from '../../components/NavHeader'

import '../../components/NavHeader'
/* 
  接口返回数据的格式：
  {label: '北京', value: 'AREA|88cff55c-aaa4-e2e0', pinyin: 'beijing', short: 'bj'}
  
  渲染城市列表所需的数据格式：
  { a:[{},{}], b:[{},...,{}], ...}

  渲染右侧索引的数据格式：
  ['a','b']
  */

//数据格式化方法
const fromatCityData = (list) => {
  const cityList = {}

  //处理数据格式
  //1.遍历list数组
  list.forEach((item) => {
    //2.获取每一个城市的首字母，substr方法是截取字符串（索引号，截取个数）
    const first = item.short.substr(0, 1)
    //3.判断cityList中是否有该分类
    if (cityList[first]) {
      //4.如果有，就直接往该分类中push数据
      cityList[first].push(item)
    } else {
      //5.如果没有，就先创建一个数组，然后，把当前城市信息添加到数组中
      cityList[first] = [item]
    }
  })

  //获取索引数据  sort()默认是升序
  const cityIndex = Object.keys(cityList).sort()

  return {
    cityList,
    cityIndex,
  }
}

// 封装处理字母索引的方法
const formatCityIndex = (letter) => {
  switch (letter) {
    case '#':
      return '当前定位'
    case 'hot':
      return '热门城市'
    default:
      return letter.toUpperCase()
  }
}

// 索引（A、B等）的高度
const TITLE_HEIGHT = 36
// 每个城市名称的高度
const NAME_HEIGHT = 50

const HOUSE_CITY = ['北京', '上海', '广州', '深圳']

export default class CityList extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      cityList: {},
      cityIndex: [],
      //设置高亮的索引号
      activeIndex: 0,
    }
    // 创建ref的对象
    this.cityListComponent = React.createRef()
  }

  async componentDidMount() {
    await this.getCityList()

    //调用measureAllRows，提前计算list中每一行的高度，实现scrollToRow的精确跳转
    // 注意：调用这个方法的时候，需要保证list组件中已经有数据了!如果list组件中的数据为空，就会导致这个方法调用报错
    // 解决：只要保证这个方法是在获取到列表数据之后调用即可
    // console.log(this.cityListComponent.current.measureAllRows())
    this.cityListComponent.current.measureAllRows()
    // console.log(this.cityListComponent.current)
  }
  //获取城市列表数据方法
  async getCityList() {
    const { data } = await axios.get('http://localhost:8080/area/city?level=1')
    const { cityList, cityIndex } = fromatCityData(data.body)

    // 添加热门城市信息
    const hotRes = await axios.get('http://localhost:8080/area/hot')
    cityList['hot'] = hotRes.data.body
    // unshift方法数组前面添加一个元素
    cityIndex.unshift('hot')

    // 获取当前定位城市
    const curCity = await getCurrentCity()
    // 添加定位城市信息
    cityList['#'] = [curCity]
    cityIndex.unshift('#')

    this.setState({
      cityList,
      cityIndex,
    })
  }

  // List组件渲染每一行的方法：
  rowRenderer = ({
    key, //唯一值
    index, // 索引号
    isScrolling, // 当前项是否正在滚动中
    isVisible, // 当前项在 List 中是可见的
    style, // 注意：重点属性，一定要给每一个行数据添加该样式！作用：指定每一行的位置
  }) => {
    // 获取每一行的字母索引
    const { cityIndex, cityList } = this.state
    const letter = cityIndex[index]

    // 获取指定字母索引下的城市列表数据
    // console.log(cityList[letter])

    return (
      <div key={key} style={style} className="city">
        <div className="title">{formatCityIndex(letter)}</div>
        {cityList[letter].map((item) => (
          <div
            className="name"
            key={item.value}
            onClick={() => this.changeCity(item)}
          >
            {item.label}
          </div>
        ))}
      </div>
    )
  }

  // 动态计算列表每一行高度
  getRowHeight = ({ index }) => {
    const { cityIndex, cityList } = this.state
    return TITLE_HEIGHT + cityList[cityIndex[index]].length * NAME_HEIGHT
  }

  //渲染右侧索引列表方法
  renderCityIndex() {
    const { cityIndex, activeIndex } = this.state
    return cityIndex.map((item, index) => (
      <li
        className="city-index-item"
        key={item}
        onClick={() => {
          this.cityListComponent.current.scrollToRow(index)
        }}
      >
        <span className={activeIndex === index ? 'index-active' : ''}>
          {item === 'hot' ? '热' : item.toUpperCase()}
        </span>
      </li>
    ))
  }

  changeCity({ label, value }) {
    if (HOUSE_CITY.indexOf(label) > -1) {
      localStorage.setItem('y_city', JSON.stringify({ label, value }))
      this.props.history.go(-1)
    } else {
      Toast.info('该城市暂无房源信息', 2, null, false)
    }
  }

  // 获取List组件中渲染行的信息
  onRowsRendered = ({ startIndex }) => {
    // console.log('startIndex：', startIndex)
    if (this.state.activeIndex !== startIndex) {
      this.setState({
        activeIndex: startIndex,
      })
    }
  }

  render() {
    return (
      <div className="citylist">
        <NavHeader>城市选择</NavHeader>
        {/* 城市列表 */}
        <AutoSizer>
          {({ width, height }) => (
            <List
              ref={this.cityListComponent}
              width={width}
              height={height}
              rowHeight={this.getRowHeight}
              rowCount={this.state.cityIndex.length}
              rowRenderer={this.rowRenderer}
              onRowsRendered={this.onRowsRendered}
              scrollToAlignment="start"
            />
          )}
        </AutoSizer>

        {/* 右侧索引列表 */}
        <ul className="city-index">{this.renderCityIndex()}</ul>
      </div>
    )
  }
}
