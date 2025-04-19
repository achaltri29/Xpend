"use client"
import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider } from "./contexts/ThemeContext"
import { AuthProvider, useAuth } from "./contexts/AuthContext"
import { ToastProvider } from "./contexts/ToastContext"
import { AnimationProvider } from "./contexts/AnimationContext"

// Pages
import Dashboard from "./pages/Dashboard"
import Transactions from "./pages/Transactions"
import Budgeting from "./pages/Budgeting"
import ExportImport from "./pages/ExportImport"
import Settings from "./pages/Settings"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import ForgotPassword from "./pages/ForgotPassword"

// Styles
import "./styles/App.css"

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/" />
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <AnimationProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Protected Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/transactions"
                element={
                  <ProtectedRoute>
                    <Transactions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/budgeting"
                element={
                  <ProtectedRoute>
                    <Budgeting />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/export-import"
                element={
                  <ProtectedRoute>
                    <ExportImport />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />

              {/* Redirect any unknown routes to Dashboard */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </AnimationProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
