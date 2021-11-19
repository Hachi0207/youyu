import React from 'react'
import { Flex, WingBlank, WhiteSpace, Toast } from 'antd-mobile'

import { Link } from 'react-router-dom'

import NavHeader from '../../components/NavHeader'

import styles from './index.module.css'

// 导入withFormik
import { withFormik, Form, Field, ErrorMessage } from 'formik'

// 导入Yup
import * as Yup from 'yup'

// 导入 API
import { API } from '../../utils'

// 验证规则：
const REG_UNAME = /^[a-zA-Z_\d]{5,8}$/
const REG_PWD = /^[a-zA-Z_\d]{3,12}$/

class Registe extends React.Component {
  state = {
    repassword: '',
  }
  divComponent = React.createRef()

  timerId = null

  //两次密码校验方法：
  // 1、因为第二次输入密码是不用对密码的格式进行校验，只需要判断两次密码是否相同即可
  // 2、所以第二次密码框是不用在用formik进行校验的，直接使用受控组件方式对其进行状态绑定
  // 3、在二次密码校验框中，给input表单绑定change事件，捕获变化，但不需要每次改变都要捕获，所以使用延时器对获取结果进行一个防抖处理
  // 4、因为使用withFormik高阶组件，所以在Registe组件内能够通过props.values获取到withFormik创建的password状态
  // 5、最后进行判断即可，用createRef方法创建ref绑定到div上，通过dom的方式改变里面的内容作为提示即可
  handlechange = (e) => {
    // 清除上一次的定时器
    clearTimeout(this.timerId)
    this.setState({
      repassword: e.target.value,
    })

    this.timerId = setTimeout(() => {
      if (this.state.repassword.trim() !== this.props.values.password) {
        this.divComponent.current.innerHTML = '两次密码不相同，请重新输入！'
      } else {
        this.divComponent.current.innerHTML = ''
      }
    }, 700)
  }

  render() {
    return (
      <div className={styles.root}>
        {/* 顶部导航 */}
        <NavHeader className={styles.navHeader}>注册</NavHeader>
        <WhiteSpace size="xl" />
        <WingBlank>
          <Form>
            <div className={styles.formItem}>
              <label className={styles.label}>用户名</label>
              <Field
                className={styles.input}
                name="username"
                placeholder="请输入账号"
                autoComplete="off"
              />
            </div>
            <ErrorMessage
              className={styles.error}
              name="username"
              component="div"
            />

            <div className={styles.formItem}>
              <label className={styles.label}>密码</label>
              <Field
                className={styles.input}
                name="password"
                type="password"
                placeholder="请输入密码"
                autoComplete="off"
              />
            </div>
            <ErrorMessage
              className={styles.error}
              name="password"
              component="div"
            />
            <div className={styles.formItem}>
              <label className={styles.label}>确认密码</label>
              <input
                className={styles.input}
                type="password"
                value={this.state.repassword}
                placeholder="请再次输入密码确认"
                onChange={this.handlechange}
              />
            </div>
            <div className={styles.error} ref={this.divComponent}></div>
            <div className={styles.formSubmit}>
              <button className={styles.submit} type="submit">
                注册
              </button>
            </div>
          </Form>
          <Flex className={styles.backHome} justify="between">
            <Link to="/home">点我回首页</Link>
            <Link to="/login">已有账号，去登录</Link>
          </Flex>
        </WingBlank>
      </div>
    )
  }
}

// 使用 withFormik 高阶组件包装 Login 组件，为 Login 组件提供属性和方法
Registe = withFormik({
  // 提供状态：
  mapPropsToValues: () => ({ username: '', password: '' }),

  // 添加表单校验规则
  validationSchema: Yup.object().shape({
    username: Yup.string()
      .required('账号不能为空！')
      .matches(REG_UNAME, '长度为5到8位，只能出现数字、字母、下划线'),
    password: Yup.string()
      .required('密码不能为空！')
      .matches(REG_PWD, '长度为5到12位，只能出现数字、字母、下划线'),
  }),

  // 表单的提交事件
  handleSubmit: async (values, { props }) => {
    // 获取账号和密码
    const { username, password } = values

    // console.log('表单提交了', username, password)
    // 发送请求
    const res = await API.post('/user/registered', {
      username,
      password,
    })

    const { status, description } = res.data

    if (status === 200) {
      // console.log(props)
      // 注册成功
      Toast.info(
        '注册成功',
        1,
        () => {
          props.history.replace('/login')
        },
        false
      )
    } else {
      // 注册失败
      Toast.info(description, 2, null, false)
    }
  },
})(Registe)

export default Registe
