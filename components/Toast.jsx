"use client"

import React, { useEffect } from 'react'
import { useToast } from '../contexts/ToastContext'
import { FaTimes, FaCheck, FaInfo, FaExclamationTriangle } from "react-icons/fa"
import anime from "animejs"
import "../styles/Toast.css"

const Toast = ({ message, type = "info", duration = 3000 }) => {
  const { hideToast } = useToast()
  const toastRef = React.useRef(null)

  useEffect(() => {
    // Animate toast entry
    anime({
      targets: toastRef.current,
      translateX: [50, 0],
      opacity: [0, 1],
      duration: 300,
      easing: "easeOutQuad",
    })

    // Auto close after 3 seconds
    const timer = setTimeout(hideToast, duration)

    return () => clearTimeout(timer)
  }, [duration, hideToast])

  const handleClose = () => {
    // Animate toast exit
    anime({
      targets: toastRef.current,
      translateX: [0, 50],
      opacity: [1, 0],
      duration: 300,
      easing: "easeInQuad",
      complete: hideToast,
    })
  }

  const getIcon = () => {
    switch (type) {
      case "success":
        return <FaCheck />
      case "error":
        return <FaExclamationTriangle />
      case "warning":
        return <FaExclamationTriangle />
      case "info":
      default:
        return <FaInfo />
    }
  }

  return (
    <div className={`toast toast-${type}`} ref={toastRef}>
      <div className="toast-icon">{getIcon()}</div>
      <div className="toast-message">{message}</div>
      <button className="toast-close" onClick={handleClose}>
        <FaTimes />
      </button>
    </div>
  )
}

export default Toast
