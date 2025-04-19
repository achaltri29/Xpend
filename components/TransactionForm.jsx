"use client"

import { useState, useEffect } from "react"
import Button from "./Button"
import Modal from "./Modal"
import { FaPlus } from "react-icons/fa"
import "../styles/TransactionForm.css"

const TransactionForm = ({
  onSubmit,
  defaultValues = {
    date: new Date().toISOString().split("T")[0],
    amount: "",
    description: "",
    category: "",
    paymentMethod: "",
  },
  buttonText = "+ Add Transaction",
  isEdit = false,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState(defaultValues)
  const [errors, setErrors] = useState({})

  // Update form data when defaultValues change (for editing)
  useEffect(() => {
    if (isEdit) {
      setFormData(defaultValues)
    }
  }, [defaultValues, isEdit])

  const handleOpen = () => {
    setIsOpen(true)
  }

  const handleClose = () => {
    setIsOpen(false)
    if (!isEdit) {
      setFormData(defaultValues)
    }
    setErrors({})
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    }

    if (!formData.amount) {
      newErrors.amount = "Amount is required"
    } else if (isNaN(Number(formData.amount))) {
      newErrors.amount = "Amount must be a number"
    }

    if (!formData.category) {
      newErrors.category = "Category is required"
    }

    if (!formData.date) {
      newErrors.date = "Date is required"
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = "Payment method is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (validateForm()) {
      // Determine if it's an expense or income
      const finalAmount =
        formData.category === "Income" ? Math.abs(Number(formData.amount)) : -Math.abs(Number(formData.amount))

      const submittedData = {
        ...formData,
        amount: finalAmount,
      }

      onSubmit(submittedData)
      handleClose()
    }
  }

  return (
    <>
      <Button variant="primary" onClick={handleOpen} icon={<FaPlus />}>
        {buttonText}
      </Button>

      <Modal isOpen={isOpen} onClose={handleClose} title={isEdit ? "Edit Transaction" : "Add Transaction"}>
        <form onSubmit={handleSubmit} className="transaction-form">
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Groceries, Rent, etc."
            />
            {errors.description && <div className="error-message">{errors.description}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="amount">Amount</label>
            <input
              type="text"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="100.00"
            />
            {errors.amount && <div className="error-message">{errors.amount}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select id="category" name="category" value={formData.category} onChange={handleChange}>
              <option value="">Select a category</option>
              <option value="Food">Food</option>
              <option value="Housing">Housing</option>
              <option value="Transportation">Transportation</option>
              <option value="Utilities">Utilities</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Income">Income</option>
              <option value="Other">Other</option>
            </select>
            {errors.category && <div className="error-message">{errors.category}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input type="date" id="date" name="date" value={formData.date} onChange={handleChange} />
            {errors.date && <div className="error-message">{errors.date}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="paymentMethod">Payment Method</label>
            <select id="paymentMethod" name="paymentMethod" value={formData.paymentMethod} onChange={handleChange}>
              <option value="">Select a payment method</option>
              <option value="Cash">Cash</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Other">Other</option>
            </select>
            {errors.paymentMethod && <div className="error-message">{errors.paymentMethod}</div>}
          </div>

          <div className="form-actions">
            <Button variant="secondary" type="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {isEdit ? "Update Transaction" : "Save Transaction"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}

export default TransactionForm
