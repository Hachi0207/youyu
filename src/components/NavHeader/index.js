import React from 'react'

import { NavBar } from 'antd-mobile'

// 添加props校验增强组件的健壮性
import PropTypes from 'prop-types'

// 导入高阶组件以让顶部导航栏能够获取路由信息
import { withRouter } from 'react-router-dom'

// import './index.scss'
import styles from './index.module.css'

function NavHeader({
  children,
  history,
  onLeftClick,
  className,
  rightContent,
  icon,
}) {
  // 默认点击行为
  const defaultHandler = () => history.go(-1)
  return (
    <NavBar
      className={[styles.navBar, className || ''].join(' ')}
      mode="light"
      icon={icon || <i className="iconfont icon-back"></i>}
      onLeftClick={onLeftClick || defaultHandler}
      rightContent={rightContent}
    >
      {children}
    </NavBar>
  )
}

// 添加props校验
NavHeader.propTypes = {
  children: PropTypes.string.isRequired,
  onLeftClick: PropTypes.func,
  className: PropTypes.string,
  rightContent: PropTypes.array,
}

//withRouter(NavHeader)返回的还是一个组件
export default withRouter(NavHeader)
