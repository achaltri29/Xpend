"use client"

import React, { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useTheme } from "../contexts/ThemeContext"
import { useAnimation } from "../contexts/AnimationContext"
import anime from "animejs"
import "../styles/Sidebar.css"

// Icons
import {
  FaHome,
  FaWallet,
  FaChartLine,
  FaFileExport,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaMoon,
  FaSun,
} from "react-icons/fa"

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768)
  const { logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const { registerAnimation, playAnimation } = useAnimation()
  const sidebarRef = React.useRef(null)
  const menuItemsRef = React.useRef([])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsOpen(window.innerWidth > 768)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Register animations
  useEffect(() => {
    registerAnimation("sidebar", sidebarRef.current, {
      translateX: ["-100%", "0%"],
      opacity: [0, 1],
      duration: 500,
      easing: "easeOutQuad",
    })

    menuItemsRef.current.forEach((item, index) => {
      registerAnimation(`menuItem-${index}`, item, {
        translateY: [20, 0],
        opacity: [0, 1],
        duration: 500,
        delay: 100 + index * 50,
        easing: "easeOutQuad",
      })
    })
  }, [registerAnimation])

  // Animate sidebar on open/close
  useEffect(() => {
    if (sidebarRef.current) {
      if (isOpen) {
        anime({
          targets: sidebarRef.current,
          translateX: ["-100%", "0%"],
          opacity: [0, 1],
          duration: 300,
          easing: "easeOutQuad",
        })
      } else {
        anime({
          targets: sidebarRef.current,
          translateX: ["0%", "-100%"],
          opacity: [1, 0],
          duration: 300,
          easing: "easeInQuad",
        })
      }
    }
  }, [isOpen])

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  // Handle logout
  const handleLogout = () => {
    logout()
  }

  // Check if a route is active
  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? "open" : ""}`} ref={sidebarRef}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-x">X</span>
            <span className="logo-pend">pend</span>
          </div>
        </div>

        <ul className="sidebar-menu">
          <li className={isActive("/") ? "active" : ""} ref={(el) => (menuItemsRef.current[0] = el)}>
            <Link to="/">
              <FaHome />
              <span>Dashboard</span>
            </Link>
          </li>
          <li className={isActive("/transactions") ? "active" : ""} ref={(el) => (menuItemsRef.current[1] = el)}>
            <Link to="/transactions">
              <FaWallet />
              <span>Transactions</span>
            </Link>
          </li>
          <li className={isActive("/budgeting") ? "active" : ""} ref={(el) => (menuItemsRef.current[2] = el)}>
            <Link to="/budgeting">
              <FaChartLine />
              <span>Budgeting</span>
            </Link>
          </li>
          <li className={isActive("/export-import") ? "active" : ""} ref={(el) => (menuItemsRef.current[3] = el)}>
            <Link to="/export-import">
              <FaFileExport />
              <span>Export/Import</span>
            </Link>
          </li>
          <li className={isActive("/settings") ? "active" : ""} ref={(el) => (menuItemsRef.current[4] = el)}>
            <Link to="/settings">
              <FaCog />
              <span>Settings</span>
            </Link>
          </li>
        </ul>

        <div className="sidebar-footer">
          <button className="theme-toggle-btn" onClick={toggleTheme}>
            {theme === "dark" ? <FaSun /> : <FaMoon />}
            <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  )
}

export default Sidebar
