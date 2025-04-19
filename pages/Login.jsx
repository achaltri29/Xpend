"use client"

import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import Logo from "../components/Logo"
import Button from "../components/Button"
import { useAuth } from "../contexts/AuthContext"
import { useTheme } from "../contexts/ThemeContext"
import { useToast } from "../contexts/ToastContext"
import { FaMoon, FaSun } from "react-icons/fa"
import anime from "animejs"
import "../styles/Auth.css"
import "../styles/Login.css"

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { login } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { showToast } = useToast()
  const navigate = useNavigate()

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

    // Validate inputs
    if (!email || !password) {
      setError("Please enter both email and password")
      return
    }

    setLoading(true)

    try {
      const result = await login(email, password)

      if (result.success) {
        showToast("Login successful", "success")
        navigate("/dashboard")
      } else {
        setError(result.message || "Login failed")
      }
    } catch (error) {
      console.error("Login error:", error)
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
          <h2>Login to Xpend</h2>
          <p>Enter your email and password to login</p>
        </div>

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

          <div className="form-group">
            <div className="password-header">
              <label htmlFor="password">Password</label>
              <Link to="/forgot-password" className="forgot-password">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" variant="primary" className="auth-button" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>

          <p className="auth-footer">
            Don't have an account?{" "}
            <Link to="/signup" className="auth-link">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Login
