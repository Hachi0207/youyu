import axios from 'axios'

//封装获取当前定位城市信息的函数
export const getCurrentCity = () => {
  //判断localstorage中是否有定位城市信息
  const localCity = JSON.parse(localStorage.getItem('y_city'))
  if (!localCity) {
    //如果没有，就使用获取定位城市的代码来获取，并且存储到本地存储中，然后返回该城市数据
    return new Promise((resolve, reject) => {
      var curCity = new window.BMapGL.LocalCity()
      curCity.get(async (res) => {
        try {
          const { data } = await axios.get(
            `http://localhost:8080/area/info?name=${res.name}`
          )
          //存储到本地存储当中
          localStorage.setItem('y_city', JSON.stringify(data.body))
          resolve(data.body)
        } catch (e) {
          reject(e)
        }
      })
    })
  }
  //如果有，直接返回本地存储中的城市数据
  //  为了统一函数返回值，返回promise对象最好
  return Promise.resolve(localCity)
}

export { API } from './api'
export { BASE_URL } from './url'
export { isAuth, getToken, setToken, removeToken } from './auth'
export { getCity, setCity } from './city'
