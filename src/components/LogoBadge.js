import React from 'react'

import './LogoBadge.css'
import logo from '../assets/logo.svg'

const Logo = ({ status }) => {
  return (
    <div className={`LogoBadge LogoBadge-${status}`}>
      <img src={logo} alt="" className="LogoBadge-logo"></img>
      <span className={`LogoBadge-title`}>Àlacarte</span>
    </div>
  )
}

export default Logo
