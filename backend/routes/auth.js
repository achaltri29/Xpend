const express = require("express")
const router = express.Router()
const jwt = require("jsonwebtoken")
const User = require("../models/User")

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Check if user exists
    let user = await User.findOne({ email })

    if (user) {
      return res.status(400).json({ message: "User already exists" })
    }

    // Create user
    user = new User({
      name,
      email,
      password,
    })

    await user.save()

    res.status(201).json({ success: true })
  } catch (error) {
    console.error(error.message)
    res.status(500).json({ message: "Server Error" })
  }
})

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    // Check for user
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Check password
    const isMatch = await user.matchPassword(password)

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" })

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        settings: user.settings,
      },
    })
  } catch (error) {
    console.error(error.message)
    res.status(500).json({ message: "Server Error" })
  }
})

// @route   POST /api/auth/reset-password
// @desc    Send password reset email
// @access  Public
router.post("/reset-password", async (req, res) => {
  try {
    const { email } = req.body

    // Check if user exists
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // In a real app, you would send an email with a reset link
    // For this demo, we'll just return success
    res.json({ success: true })
  } catch (error) {
    console.error(error.message)
    res.status(500).json({ message: "Server Error" })
  }
})

module.exports = router
