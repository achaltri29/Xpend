const express = require("express")
const router = express.Router()
const auth = require("../middleware/auth")
const Transaction = require("../models/Transaction")

// @route   GET /api/transactions
// @desc    Get all transactions
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 })
    res.json(transactions)
  } catch (error) {
    console.error(error.message)
    res.status(500).json({ message: "Server Error" })
  }
})

// @route   GET /api/transactions/recent
// @desc    Get recent transactions
// @access  Private
router.get("/recent", auth, async (req, res) => {
  try {
    const limit = Number.parseInt(req.query.limit) || 5
    const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 }).limit(limit)

    res.json(transactions)
  } catch (error) {
    console.error(error.message)
    res.status(500).json({ message: "Server Error" })
  }
})

// @route   POST /api/transactions
// @desc    Add transaction
// @access  Private
router.post("/", auth, async (req, res) => {
  try {
    const { date, description, category, amount, paymentMethod } = req.body

    const newTransaction = new Transaction({
      user: req.user.id,
      date,
      description,
      category,
      amount,
      paymentMethod,
    })

    const transaction = await newTransaction.save()

    res.json(transaction)
  } catch (error) {
    console.error(error.message)
    res.status(500).json({ message: "Server Error" })
  }
})

// @route   PUT /api/transactions/:id
// @desc    Update transaction
// @access  Private
router.put("/:id", auth, async (req, res) => {
  try {
    const { date, description, category, amount, paymentMethod } = req.body

    // Build transaction object
    const transactionFields = {}
    if (date) transactionFields.date = date
    if (description) transactionFields.description = description
    if (category) transactionFields.category = category
    if (amount !== undefined) transactionFields.amount = amount
    if (paymentMethod) transactionFields.paymentMethod = paymentMethod

    // Find transaction
    let transaction = await Transaction.findById(req.params.id)

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" })
    }

    // Make sure user owns transaction
    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" })
    }

    // Update
    transaction = await Transaction.findByIdAndUpdate(req.params.id, { $set: transactionFields }, { new: true })

    res.json(transaction)
  } catch (error) {
    console.error(error.message)
    res.status(500).json({ message: "Server Error" })
  }
})

// @route   DELETE /api/transactions/:id
// @desc    Delete transaction
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    // Find transaction
    const transaction = await Transaction.findById(req.params.id)

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" })
    }

    // Make sure user owns transaction
    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" })
    }

    await Transaction.findByIdAndRemove(req.params.id)

    res.json({ success: true })
  } catch (error) {
    console.error(error.message)
    res.status(500).json({ message: "Server Error" })
  }
})

module.exports = router
