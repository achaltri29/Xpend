"use client"

import { createContext, useState, useContext, useEffect } from "react"
import { api } from "../services/api"

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  // Check if user is logged in on initial load
  useEffect(() => {
    const token = localStorage.getItem("token")

    if (token) {
      // Set token in API headers
      api.setToken(token)

      // Get user data
      api.user
        .getProfile()
        .then((userData) => {
          setCurrentUser(userData)
          setIsAuthenticated(true)
        })
        .catch(() => {
          // Token might be invalid or expired
          localStorage.removeItem("token")
          api.removeToken()
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  // Login function
  const login = async (email, password) => {
    try {
      const response = await api.auth.login(email, password)

      // Save token to localStorage
      localStorage.setItem("token", response.token)

      // Set token in API headers
      api.setToken(response.token)

      // Get user data
      const userData = await api.user.getProfile()
      setCurrentUser(userData)
      setIsAuthenticated(true)

      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.message || "Login failed. Please check your credentials.",
      }
    }
  }

  // Signup function
  const signup = async (name, email, password) => {
    try {
      await api.auth.register(name, email, password)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.message || "Registration failed. Please try again.",
      }
    }
  }

  // Logout function
  const logout = () => {
    localStorage.removeItem("token")
    api.removeToken()
    setCurrentUser(null)
    setIsAuthenticated(false)
  }

  // Reset password function
  const resetPassword = async (email) => {
    try {
      await api.auth.resetPassword(email)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.message || "Password reset failed. Please try again.",
      }
    }
  }

  // Update profile function
  const updateProfile = async (userData) => {
    try {
      const updatedUser = await api.user.updateProfile(userData)
      setCurrentUser(updatedUser)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.message || "Failed to update profile. Please try again.",
      }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        loading,
        login,
        signup,
        logout,
        resetPassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
