"use client"

import { useEffect, useRef } from "react"
import anime from "animejs"
import "../styles/ProgressBar.css"

const ProgressBar = ({
  value = 0,
  max = 100,
  label,
  showPercentage = true,
  variant = "primary",
  height = 20,
  animated = true,
}) => {
  const progressRef = useRef(null)
  const percentage = Math.min(Math.max(0, (value / max) * 100), 100)

  // Determine color based on percentage
  const getVariant = () => {
    if (variant !== "auto") return variant

    if (percentage > 75) return "danger"
    if (percentage > 50) return "warning"
    return "success"
  }

  useEffect(() => {
    if (animated && progressRef.current) {
      anime({
        targets: progressRef.current,
        width: `${percentage}%`,
        duration: 1000,
        easing: "easeInOutQuad",
      })
    }
  }, [percentage, animated])

  return (
    <div className="progress-container">
      {label && (
        <div className="progress-label">
          <span>{label}</span>
          {showPercentage && <span>{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className="progress-track" style={{ height: `${height}px` }}>
        <div
          ref={progressRef}
          className={`progress-bar progress-${getVariant()}`}
          style={{
            width: animated ? "0%" : `${percentage}%`,
            height: "100%",
          }}
        ></div>
      </div>
    </div>
  )
}

export default ProgressBar
