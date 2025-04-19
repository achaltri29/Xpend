"use client"

import { useRef, useEffect } from "react"
import { useAnimation } from "../contexts/AnimationContext"
import "../styles/StatCard.css"

const StatCard = ({ title, value, icon, variant = "default", animationDelay = 0 }) => {
  const cardRef = useRef(null)
  const { registerAnimation } = useAnimation()

  useEffect(() => {
    registerAnimation(`stat-${title}`, cardRef.current, {
      translateY: [20, 0],
      opacity: [0, 1],
      duration: 600,
      delay: animationDelay,
      easing: "easeOutQuad",
    })
  }, [registerAnimation, title, animationDelay])

  return (
    <div
      className={`stat-card ${variant ? `stat-card-${variant}` : ""}`}
      ref={cardRef}
      data-animation-id={`stat-${title}`}
    >
      <div className="stat-card-header">
        <h3 className="stat-card-title">{title}</h3>
        {icon && <div className="stat-card-icon">{icon}</div>}
      </div>
      <div className="stat-card-value">{value}</div>
    </div>
  )
}

export default StatCard
