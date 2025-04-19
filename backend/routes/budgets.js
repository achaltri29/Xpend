const express = require("express")
const router = express.Router()
const auth = require("../middleware/auth")
const Budget = require("../models/Budget")
const Transaction = require("../models/Transaction")

// @route   GET /api/budgets
// @desc    Get all budgets with spent amounts
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    // Get all budgets for the user
    const budgets = await Budget.find({ user: req.user.id })

    // Get all transactions for the user
    const transactions = await Transaction.find({ user: req.user.id })

    // Calculate spent amount for each budget
    const budgetsWithSpent = budgets.map((budget) => {
      // Filter transactions by category and sum the amounts (only expenses)
      const spent = transactions
        .filter((t) => t.category.toLowerCase() === budget.category.toLowerCase() && t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)

      return {
        id: budget._id,
        category: budget.category,
        allocated: budget.allocated,
        spent,
      }
    })

    res.json(budgetsWithSpent)
  } catch (error) {
    console.error(error.message)
    res.status(500).json({ message: "Server Error" })
  }
})

// @route   POST /api/budgets
// @desc    Add budget
// @access  Private
router.post("/", auth, async (req, res) => {
  try {
    const { category, allocated } = req.body

    // Check if budget for this category already exists
    const existingBudget = await Budget.findOne({
      user: req.user.id,
      category,
    })

    if (existingBudget) {
      return res.status(400).json({ message: "Budget for this category already exists" })
    }

    const newBudget = new Budget({
      user: req.user.id,
      category,
      allocated,
    })

    const budget = await newBudget.save()

    // Calculate spent amount
    const transactions = await Transaction.find({
      user: req.user.id,
      category: { $regex: new RegExp(category, "i") },
      amount: { $lt: 0 },
    })

    const spent = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)

    res.json({
      id: budget._id,
      category: budget.category,
      allocated: budget.allocated,
      spent,
    })
  } catch (error) {
    console.error(error.message)
    res.status(500).json({ message: "Server Error" })
  }
})

// @route   PUT /api/budgets/:id
// @desc    Update budget
// @access  Private
router.put("/:id", auth, async (req, res) => {
  try {
    const { category, allocated } = req.body

    // Build budget object
    const budgetFields = {}
    if (category) budgetFields.category = category
    if (allocated !== undefined) budgetFields.allocated = allocated

    // Find budget
    let budget = await Budget.findById(req.params.id)

    if (!budget) {
      return res.status(404).json({ message: "Budget not found" })
    }

    // Make sure user owns budget
    if (budget.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" })
    }

    // Update
    budget = await Budget.findByIdAndUpdate(req.params.id, { $set: budgetFields }, { new: true })

    // Calculate spent amount
    const transactions = await Transaction.find({
      user: req.user.id,
      category: { $regex: new RegExp(budget.category, "i") },
      amount: { $lt: 0 },
    })

    const spent = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)

    res.json({
      id: budget._id,
      category: budget.category,
      allocated: budget.allocated,
      spent,
    })
  } catch (error) {
    console.error(error.message)
    res.status(500).json({ message: "Server Error" })
  }
})

// @route   DELETE /api/budgets/:id
// @desc    Delete budget
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    // Find budget
    const budget = await Budget.findById(req.params.id)

    if (!budget) {
      return res.status(404).json({ message: "Budget not found" })
    }

    // Make sure user owns budget
    if (budget.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" })
    }

    await Budget.findByIdAndRemove(req.params.id)

    res.json({ success: true })
  } catch (error) {
    console.error(error.message)
    res.status(500).json({ message: "Server Error" })
  }
})

module.exports = router
