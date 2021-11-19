import React from 'react'

import New from '../../components/News'

import NavHeader from '../../components/NavHeader'

import './index.scss'

export default class News extends React.Component {
  render() {
    return (
      <div>
        <NavHeader icon={true}>最新资讯</NavHeader>
        <div className="news">
          <New></New>
          <New></New>
          <New></New>
          <New></New>
        </div>
      </div>
    )
  }
}
