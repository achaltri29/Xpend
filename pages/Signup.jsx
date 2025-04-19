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

const Signup = () => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { signup } = useAuth()
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
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)

    try {
      const result = await signup(name, email, password)

      if (result.success) {
        showToast("Account created successfully", "success")
        navigate("/login")
      } else {
        setError(result.message || "Registration failed")
      }
    } catch (error) {
      console.error("Signup error:", error)
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
          <h2>Create an account</h2>
          <p>Enter your information to create an account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>

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
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" variant="primary" className="auth-button" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </Button>

          <p className="auth-footer">
            Already have an account?{" "}
            <Link to="/login" className="auth-link">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Signup
