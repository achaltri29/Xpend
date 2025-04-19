"use client"

import { useState, useEffect, useRef } from "react"
import Sidebar from "../components/Sidebar"
import PageHeader from "../components/PageHeader"
import Button from "../components/Button"
import ConfirmDialog from "../components/ConfirmDialog"
import { api } from "../services/api"
import { useAuth } from "../contexts/AuthContext"
import { useToast } from "../contexts/ToastContext"
import { useAnimation } from "../contexts/AnimationContext"
import "../styles/Settings.css"

const Settings = () => {
  const { currentUser, updateProfile } = useAuth()
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [preferencesData, setPreferencesData] = useState({
    currency: "USD",
    emailNotifications: true,
    smsNotifications: false,
    budgetAlerts: true,
  })
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()
  const { registerAnimation } = useAnimation()
  const pageRef = useRef(null)

  // Register page animation
  useEffect(() => {
    registerAnimation("settingsPage", pageRef.current, {
      opacity: [0, 1],
      duration: 800,
      easing: "easeOutQuad",
    })
  }, [registerAnimation])

  // Load user data
  useEffect(() => {
    if (currentUser) {
      setProfileData({
        name: currentUser.name || "",
        email: currentUser.email || "",
        password: "",
        confirmPassword: "",
      })

      if (currentUser.settings) {
        setPreferencesData({
          currency: currentUser.settings.currency || "USD",
          emailNotifications: currentUser.settings.notifications?.email ?? true,
          smsNotifications: currentUser.settings.notifications?.sms ?? false,
          budgetAlerts: currentUser.settings.notifications?.budgetAlerts ?? true,
        })
      }

      setLoading(false)
    }
  }, [currentUser])

  // Handle profile form change
  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle preferences form change
  const handlePreferencesChange = (e) => {
    const { name, value, type, checked } = e.target
    setPreferencesData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  // Handle profile form submit
  const handleProfileSubmit = async (e) => {
    e.preventDefault()

    // Validate passwords match if provided
    if (profileData.password && profileData.password !== profileData.confirmPassword) {
      showToast("Passwords do not match", "error")
      return
    }

    try {
      // Prepare data for update
      const userData = {
        name: profileData.name,
        email: profileData.email,
      }

      if (profileData.password) {
        userData.password = profileData.password
      }

      // Update profile
      const result = await updateProfile(userData)

      if (result.success) {
        showToast("Profile updated successfully", "success")

        // Clear password fields
        setProfileData((prev) => ({
          ...prev,
          password: "",
          confirmPassword: "",
        }))
      } else {
        showToast(result.message || "Failed to update profile", "error")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      showToast("Failed to update profile", "error")
    }
  }

  // Handle preferences form submit
  const handlePreferencesSubmit = async (e) => {
    e.preventDefault()

    try {
      // Prepare settings data
      const settings = {
        currency: preferencesData.currency,
        notifications: {
          email: preferencesData.emailNotifications,
          sms: preferencesData.smsNotifications,
          budgetAlerts: preferencesData.budgetAlerts,
        },
      }

      // Update settings
      await api.user.updateSettings(settings)

      showToast("Preferences updated successfully", "success")
    } catch (error) {
      console.error("Error updating preferences:", error)
      showToast("Failed to update preferences", "error")
    }
  }

  // Handle export all data
  const handleExportAllData = async () => {
    try {
      // Get all transactions and budgets
      const transactions = await api.transactions.getAll()
      const budgets = await api.budgets.getAll()

      // Create data object
      const data = {
        user: currentUser,
        transactions,
        budgets,
      }

      // Convert to JSON
      const jsonContent = JSON.stringify(data, null, 2)

      // Create a blob and download
      const blob = new Blob([jsonContent], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "xpend-all-data.json"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      showToast("All data exported successfully", "success")
    } catch (error) {
      console.error("Error exporting data:", error)
      showToast("Failed to export data", "error")
    }
  }

  // Handle delete account
  const handleDeleteAccount = () => {
    // In a real app, you would call an API to delete the account
    showToast("Account deleted successfully", "success")
    setIsDeleteDialogOpen(false)
  }

  return (
    <div className="settings-container" ref={pageRef} data-animation-id="settingsPage">
      <Sidebar />
      <div className="settings-content">
        <PageHeader title="Settings" />

        <div className="settings-sections">
          <div className="settings-section">
            <h3>Profile Settings</h3>
            <form onSubmit={handleProfileSubmit} className="settings-form">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={profileData.name}
                  onChange={handleProfileChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">New Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={profileData.password}
                  onChange={handleProfileChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={profileData.confirmPassword}
                  onChange={handleProfileChange}
                />
              </div>

              <Button type="submit" variant="primary">
                Save Profile
              </Button>
            </form>
          </div>

          <div className="settings-section">
            <h3>Preferences</h3>
            <form onSubmit={handlePreferencesSubmit} className="settings-form">
              <div className="form-group">
                <label htmlFor="currency">Currency</label>
                <select
                  id="currency"
                  name="currency"
                  value={preferencesData.currency}
                  onChange={handlePreferencesChange}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                </select>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="emailNotifications"
                    checked={preferencesData.emailNotifications}
                    onChange={handlePreferencesChange}
                  />
                  Email Notifications
                </label>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="smsNotifications"
                    checked={preferencesData.smsNotifications}
                    onChange={handlePreferencesChange}
                  />
                  SMS Notifications
                </label>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="budgetAlerts"
                    checked={preferencesData.budgetAlerts}
                    onChange={handlePreferencesChange}
                  />
                  Budget Alerts
                </label>
              </div>

              <Button type="submit" variant="primary">
                Save Preferences
              </Button>
            </form>
          </div>

          <div className="settings-section">
            <h3>Data Management</h3>
            <div className="data-management">
              <div className="data-action">
                <p>Export a copy of all your data</p>
                <Button variant="secondary" onClick={handleExportAllData}>
                  Export All Data
                </Button>
              </div>

              <div className="data-action">
                <p>Permanently delete your account and all your data</p>
                <Button variant="danger" onClick={() => setIsDeleteDialogOpen(true)}>
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </div>

        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDeleteAccount}
          title="Confirm Account Deletion"
          message="Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost."
          confirmText="Delete Account"
          variant="danger"
        />
      </div>
    </div>
  )
}

export default Settings
