import React from 'react'
import './Navbar.css'
import navlogo from '../../assets/nav-logo.svg'
import navProfile from '../../assets/nav-profile.svg'

export const Navbar = () => {
  return (
    <div className='navbar'>
      <div>
      <h1>SHOPIFY</h1>
      <h4>ADMIN PANEL</h4>
      </div>
       
        {/* <img src={navlogo} alt="" className="nav-logo" /> */}
        <img src={navProfile} alt="" className="nav-profile" />
    </div>
  )
}
