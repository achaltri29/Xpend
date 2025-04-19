"use client"

import { createContext, useState, useContext } from "react"
import Toast from "../components/Toast"

const ToastContext = createContext()

export const useToast = () => useContext(ToastContext)

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  // Add a new toast
  const showToast = (message, type = "info", duration = 3000) => {
    const id = Date.now()

    setToasts((prevToasts) => [...prevToasts, { id, message, type, duration }])

    // Remove toast after duration
    setTimeout(() => {
      removeToast(id)
    }, duration)

    return id
  }

  // Remove a toast by id
  const removeToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}
