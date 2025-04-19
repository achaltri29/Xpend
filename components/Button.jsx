"use client"
import "../styles/Button.css"

const Button = ({
  children,
  variant = "primary",
  size = "medium",
  type = "button",
  onClick,
  disabled = false,
  className = "",
  icon = null,
}) => {
  return (
    <button
      type={type}
      className={`btn btn-${variant} btn-${size} ${icon ? "btn-with-icon" : ""} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className="btn-icon">{icon}</span>}
      {children}
    </button>
  )
}

export default Button
