"use client"

import { useRef, useEffect } from "react"
import { useAnimation } from "../contexts/AnimationContext"
import "../styles/Card.css"

const Card = ({ title, children, variant, className, animationDelay = 0 }) => {
  const cardRef = useRef(null)
  const { registerAnimation } = useAnimation()

  useEffect(() => {
    registerAnimation(`card-${title}`, cardRef.current, {
      translateY: [20, 0],
      opacity: [0, 1],
      duration: 600,
      delay: animationDelay,
      easing: "easeOutQuad",
    })
  }, [registerAnimation, title, animationDelay])

  return (
    <div
      className={`card ${variant ? `card-${variant}` : ""} ${className || ""}`}
      ref={cardRef}
      data-animation-id={`card-${title}`}
    >
      {title && <h3 className="card-title">{title}</h3>}
      <div className="card-content">{children}</div>
    </div>
  )
}

export default Card
