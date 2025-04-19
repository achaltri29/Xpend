"use client"

import React, { useState } from "react"
import { Link } from "react-router-dom"
import Logo from "../components/Logo"
import Button from "../components/Button"
import { useAuth } from "../contexts/AuthContext"
import { useTheme } from "../contexts/ThemeContext"
import { FaMoon, FaSun } from "react-icons/fa"
import anime from "animejs"
import "../styles/Auth.css"

const ForgotPassword = () => {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const { resetPassword } = useAuth()
  const { theme, toggleTheme } = useTheme()

  // Animate elements on mount
  React.useEffect(() => {
    anime({
      targets: ".auth-card",
      translateY: [20, 0],
      opacity: [0, 1],
      duration: 800,
      easing: "easeOutQuad",
    })

    anime({
      targets: ".form-group",
      translateY: [20, 0],
      opacity: [0, 1],
      delay: anime.stagger(100, { start: 300 }),
      duration: 800,
      easing: "easeOutQuad",
    })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Clear previous error
    setError("")

    // Validate input
    if (!email) {
      setError("Please enter your email")
      return
    }

    setLoading(true)

    try {
      const result = await resetPassword(email)

      if (result.success) {
        setSubmitted(true)
      } else {
        setError(result.message || "Password reset failed")
      }
    } catch (error) {
      console.error("Reset password error:", error)
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <button className="theme-toggle-button" onClick={toggleTheme}>
        {theme === "dark" ? <FaSun /> : <FaMoon />}
      </button>

      <div className="auth-card">
        <div className="auth-header">
          <Logo size="large" />
          <h2>Reset Your Password</h2>
          <p>Enter your email to receive a password reset link</p>
        </div>

        {submitted ? (
          <div className="success-message">
            <p>
              We've sent a password reset link to <strong>{email}</strong>.
            </p>
            <p>Please check your email and follow the instructions to reset your password.</p>
            <Link to="/login" className="auth-button-link">
              <Button variant="primary" className="auth-button">
                Back to Login
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
              />
            </div>

            <Button type="submit" variant="primary" className="auth-button" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>

            <p className="auth-footer">
              Remember your password?{" "}
              <Link to="/login" className="auth-link">
                Login
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}

export default ForgotPassword
