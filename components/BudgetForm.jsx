"use client"

import { useState, useEffect } from "react"
import Button from "./Button"
import Modal from "./Modal"
import { FaPlus } from "react-icons/fa"
import "../styles/BudgetForm.css"

const BudgetForm = ({
  onSubmit,
  defaultValues = {
    category: "",
    allocated: "",
  },
  buttonText = "+ Add Budget",
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

    if (!formData.category) {
      newErrors.category = "Category is required"
    }

    if (!formData.allocated) {
      newErrors.allocated = "Allocated amount is required"
    } else if (isNaN(Number(formData.allocated))) {
      newErrors.allocated = "Allocated amount must be a number"
    } else if (Number(formData.allocated) <= 0) {
      newErrors.allocated = "Allocated amount must be greater than zero"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (validateForm()) {
      const submittedData = {
        ...formData,
        allocated: Number(formData.allocated),
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

      <Modal isOpen={isOpen} onClose={handleClose} title={isEdit ? "Edit Budget" : "Add Budget"}>
        <form onSubmit={handleSubmit} className="budget-form">
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select id="category" name="category" value={formData.category} onChange={handleChange}>
              <option value="">Select a category</option>
              <option value="Groceries">Groceries</option>
              <option value="Housing">Housing</option>
              <option value="Transportation">Transportation</option>
              <option value="Utilities">Utilities</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Other">Other</option>
            </select>
            {errors.category && <div className="error-message">{errors.category}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="allocated">Allocated Amount</label>
            <input
              type="text"
              id="allocated"
              name="allocated"
              value={formData.allocated}
              onChange={handleChange}
              placeholder="500.00"
            />
            {errors.allocated && <div className="error-message">{errors.allocated}</div>}
          </div>

          <div className="form-actions">
            <Button variant="secondary" type="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {isEdit ? "Update Budget" : "Save Budget"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}

export default BudgetForm
