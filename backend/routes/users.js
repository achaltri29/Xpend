const express = require("express")
const router = express.Router()
const auth = require("../middleware/auth")
const User = require("../models/User")
const bcrypt = require("bcryptjs")

// @route   GET /api/user/profile
// @desc    Get user profile
// @access  Private
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json(user)
  } catch (error) {
    console.error(error.message)
    res.status(500).json({ message: "Server Error" })
  }
})

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private
router.put("/profile", auth, async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Build user object
    const userFields = {}
    if (name) userFields.name = name
    if (email) userFields.email = email

    // Update user
    let user = await User.findById(req.user.id)

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Update password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10)
      userFields.password = await bcrypt.hash(password, salt)
    }

    user = await User.findByIdAndUpdate(req.user.id, { $set: userFields }, { new: true }).select("-password")

    res.json(user)
  } catch (error) {
    console.error(error.message)
    res.status(500).json({ message: "Server Error" })
  }
})

// @route   PUT /api/user/settings
// @desc    Update user settings
// @access  Private
router.put("/settings", auth, async (req, res) => {
  try {
    const { currency, notifications } = req.body

    // Build settings object
    const settingsFields = {}
    if (currency) settingsFields["settings.currency"] = currency
    if (notifications) {
      if (notifications.email !== undefined) settingsFields["settings.notifications.email"] = notifications.email
      if (notifications.sms !== undefined) settingsFields["settings.notifications.sms"] = notifications.sms
      if (notifications.budgetAlerts !== undefined)
        settingsFields["settings.notifications.budgetAlerts"] = notifications.budgetAlerts
    }

    // Update user
    const user = await User.findByIdAndUpdate(req.user.id, { $set: settingsFields }, { new: true }).select("-password")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json(user.settings)
  } catch (error) {
    console.error(error.message)
    res.status(500).json({ message: "Server Error" })
  }
})

module.exports = router
