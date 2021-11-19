import React from 'react'

import SearchHeader from '../../components/SearchHeader'

import { Flex, Toast } from 'antd-mobile'

import styles from './index.module.css'

import Filer from './components/Filter'

import { API } from '../../utils/api.js'

import {
  List,
  WindowScroller,
  AutoSizer,
  InfiniteLoader,
} from 'react-virtualized'

import HouseItem from '../../components/HouseItem'

import { BASE_URL } from '../../utils/url'

import Sticky from '../../components/Sticky'

import NoHouse from '../../components/NoHouse'

import { getCurrentCity } from '../../utils/index'

// 注意：在组件外部的代码只会在项目加载时执行一次(包括刷新页面),在切换路由时，不会重新执行
// 组件内部的componentDidMount()会在组件展示时执行，进入页面一次，执行一次

// 获取当前定位城市信息
// const { label, value } = JSON.parse(localStorage.getItem('y_city'))

export default class News extends React.Component {
  state = {
    list: [],
    count: 0,
    // 判断数据是否加载完成
    isLoading: false,
  }

  // 初始化label和value
  label = ''
  value = ''

  // 先初始化filters，防止componentDidMount()方法调用时。filter是的值是undefined
  filters = {}

  //  设置searchHouseList方法获取房屋列表数据
  async searchHeaderList() {
    this.setState({
      isLoading: true,
    })
    Toast.loading('数据加载中...', 0, null, false)
    const res = await API.get('/houses', {
      params: {
        cityId: this.value,
        ...this.filters,
        start: 1,
        end: 20,
      },
    })
    // console.log(this.filters)

    const { list, count } = res.data.body

    // 关闭loading
    Toast.hide()

    if (count !== 0) {
      // 提示房源数量
      // 解决了没有房源还继续提示数量
      // Toast.info(`共找到${count}套房源`, 1, null, false)
    }

    //更新状态
    this.setState({
      list: list,
      count: count,
      isLoading: false,
    })
  }

  // 获取Filter组件中的筛选条件数据
  onFilter = (filters) => {
    // 优化：当点击了确定按钮返回页面顶部
    window.scrollTo(0, 0)

    this.filters = filters
    // 调用获取房屋数据方法
    this.searchHeaderList()
  }

  // List组件渲染每一行的方法：
  renderHouseList = ({
    key, //唯一值
    index, // 索引号
    style,
  }) => {
    // 根据索引来获取当前这一行的房屋数据
    const { list } = this.state
    const house = list[index]

    // 判断house是否存在，防止报错
    if (!house) {
      return (
        <div key={key} style={style}>
          <p className={styles.loading}></p>
        </div>
      )
    }
    return (
      <HouseItem
        onClick={() => {
          this.props.history.push(`/detail/${house.houseCode}`)
        }}
        key={key}
        style={style}
        src={BASE_URL + house.houseImg}
        title={house.title}
        desc={house.desc}
        tags={house.tags}
        price={house.price}
      ></HouseItem>
    )
  }

  async componentDidMount() {
    // 获取当前城市信息
    const { label, value } = await getCurrentCity()
    this.label = label
    this.value = value
    // console.log(label, value)

    // 调用获取房屋数据方法

    this.searchHeaderList()
  }

  // 注意：我们不能在组件销毁后设置state，防止出现内存泄漏的情况
  // 控制台会出现这个error：Can't perform a React state update on an unmounted component. This is a no-op, but it indicates a memory leak in your application.
  //关于react中切换路由时报以上错误，实际的原因是因为在组件挂载（mounted）之后进行了异步操作，比如ajax请求或者设置了定时器等，而你在callback中进行了setState操作。
  // 当你切换路由时，组件已经被卸载（unmounted）了，此时异步操作中callback还在执行，因此setState没有得到值。
  // 解决方法：在componentWillUnmount组件销毁的钩子函数中之前异步操作的thissetState设置的操作清空即可

  componentWillUnmount = () => {
    this.setState = () => {
      return
    }
    Toast.hide()
  }

  // 判断列表中的每一行是否加载完成
  isRowLoaded = ({ index }) => {
    return !!this.state.list[index]
  }

  // 用来获取更多房屋列表数据
  // 注意：该方法的返回值是一个 Promise 对象，并且这个对象应该在数据加载完成时，来调用 resolve 让Promise对象的状态变为已完成。
  loadMoreRows = async ({ startIndex, stopIndex }) => {
    const { data } = await API.get('/houses', {
      params: {
        cityId: this.value,
        ...this.filters,
        start: startIndex,
        end: stopIndex,
      },
    })
    this.setState({
      list: [...this.state.list, ...data.body.list],
    })
    // return new Promise((resolve) => {
    //   API.get('/houses', {
    //     params: {
    //       cityId: this.value,
    //       ...this.filters,
    //       start: startIndex,
    //       end: stopIndex,
    //     },
    //   }).then((res) => {
    //     // console.log('loadMoreRows：', res)
    //     this.setState({
    //       list: [...this.state.list, ...res.data.body.list],
    //     })

    //     // 数据加载完成时，调用 resolve 即可
    //     resolve()
    //   })
    // })
  }

  renderList() {
    const { count, isLoading } = this.state
    // 优化：在数据加载完成后，在进行count的判断

    if (count === 0 && !isLoading) {
      return <NoHouse>没有找到房源，请你换个搜索条件吧~</NoHouse>
    } else {
      return (
        <InfiniteLoader
          isRowLoaded={this.isRowLoaded}
          loadMoreRows={this.loadMoreRows}
          rowCount={count}
        >
          {({ onRowsRendered, registerChild }) => (
            <WindowScroller>
              {({ height, isScrolling, scrollTop }) => (
                <AutoSizer>
                  {({ width }) => (
                    <List
                      onRowsRendered={onRowsRendered}
                      ref={registerChild}
                      autoHeight //设置高度为WindowScroller 最终渲染的高度
                      width={width} //视口的宽度
                      height={height} //视口的高度
                      rowHeight={120} //每一行高度
                      rowCount={count} //列表数据每一行数量
                      rowRenderer={this.renderHouseList} //渲染列表项中的每一行
                      isScrolling={isScrolling}
                      scrollTop={scrollTop}
                    />
                  )}
                </AutoSizer>
              )}
            </WindowScroller>
          )}
        </InfiniteLoader>
      )
    }
  }
  render() {
    return (
      <div className={styles.rooot}>
        <Flex className={styles.header}>
          <i
            className="iconfont icon-back"
            onClick={() => {
              this.props.history.go(-1)
            }}
          ></i>
          <SearchHeader
            cityName={this.label}
            className={styles.searchHeader}
          ></SearchHeader>
        </Flex>

        {/* 条件筛选栏 */}
        <Sticky height={40}>
          <Filer onFilter={this.onFilter}></Filer>
        </Sticky>

        {/* 房屋列表 */}
        <div className={styles.houseItems}>
          {/* 房屋列表内容 */}
          {this.renderList()}
        </div>
      </div>
    )
  }
}
