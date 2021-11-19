import React from 'react'
// import './index.scss'
import styles from './index.module.css'

// 导入顶部导航栏组件
import '../../components/NavHeader'
import NavHeader from '../../components/NavHeader'

// import axios from 'axios'
import { API } from '../../utils/api'

// 导入渲染房源数据组件
import HouseItem from '../../components/HouseItem'

// 导入loading效果组件
import { Toast } from 'antd-mobile'

// 导入BASE_URL
import { BASE_URL } from '../../utils/url'

const BMapGL = window.BMapGL

// 覆盖物样式
const labelStyle = {
  cursor: 'pointer',
  border: '0px solid rgb(255, 0, 0)',
  padding: '0px',
  whiteSpace: 'nowrap',
  fontSize: '12px',
  color: 'rgb(255, 255, 255)',
  textAlign: 'center',
}

export default class Map extends React.Component {
  state = {
    housesList: [],
    isShowList: false,
  }

  componentDidMount() {
    this.initMap()
  }

  // 初始化地图
  initMap() {
    // 获取当前定位城市
    const { label, value } = JSON.parse(localStorage.getItem('y_city'))

    //注意：在react脚手架中全局对象需要使用window来访问，否则，会ESlint报错
    var map = new BMapGL.Map('container')

    // 作用：能够在其他方法中通过this来获取到地图对象
    this.map = map
    //设置中心点坐标
    // var point = new window.BMapGL.Point(116.04, 39.915)

    // 利用地址解析器获取当前城市坐标
    const myGeo = new BMapGL.Geocoder()
    // 将地址解析结果显示在地图上，并调整地图视野
    myGeo.getPoint(
      label,
      async (point) => {
        if (point) {
          map.centerAndZoom(point, 11)
          // 添加控件
          // 比例尺
          map.addControl(new BMapGL.ScaleControl())
          // 缩放
          map.addControl(new BMapGL.ZoomControl())

          // //地图先加载完成再发送请求获取数据
          // const { data } = await axios.get(
          //   `http://localhost:8080/area/map?id=${value}`
          // )
          // // 遍历数据创建覆盖物
          // data.body.forEach((item) => {
          //   const {
          //     coord: { longitude, latitude },
          //     label: areaName,
          //     count,
          //     value,
          //   } = item

          //   const areaPoint = new BMapGL.Point(longitude, latitude)

          //   const opts = {
          //     position: areaPoint,
          //     offset: new BMapGL.Size(-35, -35),
          //   }
          //   // 创建文本覆盖物
          //   const label = new BMapGL.Label('', opts)

          //   // 给label对象添加唯一标识
          //   label.id = value
          //   //  设置房源覆盖物内容
          //   label.setContent(
          //     `<div class='${styles.bubble}'>
          //      <p class="${styles.name}">${areaName}</p>
          //      <p>${count}套</p>
          //      </div>`
          //   )
          //   // 设置覆盖物样式
          //   label.setStyle(labelStyle)
          //   // 添加点击事件
          //   label.addEventListener('click', () => {
          //     console.log('唯一标识', label.id)
          //     // 放大地图
          //     map.centerAndZoom(areaPoint, 13)
          //     // 清除覆盖物
          //     setTimeout(() => {
          //       map.clearOverlays()
          //     }, 0)
          //   })
          //   //添加覆盖物到地图中
          //   map.addOverlay(label)
          // })

          // 调用renderOverlays方法获取渲染覆盖物数据
          this.renderOverlays(value)
        }
      },
      label
    )

    // 给地图绑定移动事件
    map.addEventListener('movestart', () => {
      if (this.state.isShowList) {
        this.setState({
          isShowList: false,
        })
      }
    })
  }

  // 渲染覆盖物入口
  async renderOverlays(id) {
    try {
      // 开启loading效果，优化用户体验
      Toast.loading('数据加载中...', 0, null, false)

      const res = await API.get(`/area/map?id=${id}`)
      // 数据加载完成再手动关闭loading效果
      Toast.hide()
      const data = res.data.body
      // 调用getTypeAndZoom方法获取类型和级别
      const { nextZoom, type } = this.getTypeAndZoom()

      data.forEach((item) => {
        // 创建覆盖物
        this.createOverlays(item, nextZoom, type)
      })
    } catch (e) {
      // 数据加载失败也要关闭loading效果
      Toast.hide()
      alert('数据加载出错请稍后再试')
    }
  }

  // 计算覆盖物类型和下一级的缩放级别
  getTypeAndZoom() {
    // 调用getZoom方法获取当前地图的缩放级别
    const zoom = this.map.getZoom()
    let nextZoom, type
    // console.log(zoom)
    if (zoom >= 10 && zoom < 12) {
      // 区
      nextZoom = 13
      type = 'circle'
    } else if (zoom >= 13 && zoom < 14) {
      // 镇
      nextZoom = 15
      type = 'circle'
    } else if (zoom >= 14 && zoom < 16) {
      type = 'rect'
    }
    // 最后将结果返回出去
    return {
      nextZoom,
      type,
    }
  }

  // 创建覆盖物方法
  createOverlays(data, zoom, type) {
    const {
      coord: { longitude, latitude },
      label: areaName,
      count,
      value, //标识
    } = data

    // 拿到区域坐标
    const areaPoint = new BMapGL.Point(longitude, latitude)

    if (type === 'circle') {
      // 区或者镇
      this.createCircle(areaPoint, areaName, count, value, zoom)
    } else {
      //小区
      this.createRect(areaPoint, areaName, count, value)
    }
  }

  // 渲染区或镇覆盖物
  createCircle(point, name, count, id, zoom) {
    // 创建文本覆盖物
    const label = new BMapGL.Label('', {
      position: point,
      offset: new BMapGL.Size(-35, -35),
    })

    // 给label对象添加唯一标识
    label.id = id
    //  设置房源覆盖物内容
    label.setContent(
      `<div class='${styles.bubble}'>
               <p class="${styles.name}">${name}</p>
               <p>${count}套</p>
               </div>`
    )
    // 设置覆盖物样式
    label.setStyle(labelStyle)
    // 添加点击事件
    label.addEventListener('click', () => {
      // 调用renderOverlays方法，获取该区域下的房源数据
      this.renderOverlays(id)
      // 放大地图
      this.map.centerAndZoom(point, zoom)
      // 清除覆盖物
      setTimeout(() => {
        this.map.clearOverlays()
      }, 0)
    })
    //添加覆盖物到地图中
    this.map.addOverlay(label)
  }

  // 渲染小区覆盖物
  createRect(point, name, count, id) {
    // 创建文本覆盖物
    const label = new BMapGL.Label('', {
      position: point,
      offset: new BMapGL.Size(-50, -28),
    })

    // 给label对象添加唯一标识
    label.id = id
    //  设置房源覆盖物内容
    label.setContent(
      `<div class='${styles.rect}'>
               <p class="${styles.housename}">${name}</p>
               <p class="${styles.housenum}">${count}套</p>
               <i class="${styles.arrow}"></i>
       </div>`
    )
    // 设置覆盖物样式
    label.setStyle(labelStyle)
    // 添加点击事件
    label.addEventListener('click', (e) => {
      this.getHouseList(id)

      // 获取当前点击项  移动到地图中心位置
      // console.log(e)
      // const target = e.domEvent.changedTouches[0]
      this.map.panBy(
        window.innerWidth / 2 - e.clientX,
        (window.innerHeight - 330) / 2 - e.clientY
      )
    })
    //添加覆盖物到地图中
    this.map.addOverlay(label)
  }

  // 获取小区房源数据
  async getHouseList(id) {
    try {
      // 开启loading效果，优化用户体验
      Toast.loading('数据加载中...', 0, null, false)

      const { data } = await API.get(`/houses?cityId=${id}`)

      // 数据加载完成再手动关闭loading效果
      Toast.hide()
      // console.log(data)
      this.setState({
        housesList: data.body.list,
        isShowList: true,
      })
    } catch (e) {
      Toast.hide()
    }
  }

  // 封装渲染房源数据方法
  renderHousesList() {
    return this.state.housesList.map((item) => (
      <HouseItem
        onClick={() => this.props.history.push(`/detail/${item.houseCode}`)}
        key={item.houseCode}
        src={BASE_URL + item.houseImg}
        title={item.title}
        desc={item.desc}
        tags={item.tags}
        price={item.price}
      />
    ))

    // return this.state.housesList.map((item) => (
    //   <div className={styles.house} key={item.houseCode}>
    //     <div className={styles.imgWrap}>
    //       <img
    //         className={styles.img}
    //         src={'http://localhost:8080' + item.houseImg}
    //         alt=""
    //       />
    //     </div>
    //     <div className={styles.content}>
    //       <h3 className={styles.title}>{item.title}</h3>
    //       <div className={styles.desc}>{item.desc}</div>
    //       <div>
    //         {/* ['近地铁', '随时看房'] */}
    //         {item.tags.map((tag, index) => {
    //           const tagClass = 'tag' + (index + 1)
    //           return (
    //             <span
    //               className={[styles.tag, styles[tagClass]].join(' ')}
    //               key={tag}
    //             >
    //               {tag}
    //             </span>
    //           )
    //         })}
    //       </div>
    //       <div className={styles.price}>
    //         <span className={styles.priceNum}>{item.price}</span> 元/月
    //       </div>
    //     </div>
    //   </div>
    // ))
  }

  render() {
    return (
      <div className={styles.map}>
        {/* 顶部导航栏 */}
        <NavHeader>地图找房</NavHeader>
        {/* 地图容器 */}
        <div id="container" className={styles.container}></div>
        {/* 房源列表数据 */}
        <div
          className={[
            styles.houseList,
            this.state.isShowList ? styles.show : '',
          ].join(' ')}
        >
          <div className={styles.titleWrap}>
            <h1 className={styles.listTitle}>房屋列表</h1>
          </div>
          <div className={styles.houseItems}>
            {/* 房屋结构 */}
            {this.renderHousesList()}
          </div>
        </div>
      </div>
    )
  }
}
