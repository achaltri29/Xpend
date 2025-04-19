"use client"

import { useState, useEffect, useRef } from "react"
import { FaPencilAlt, FaTrash } from "react-icons/fa"
import Sidebar from "../components/Sidebar"
import PageHeader from "../components/PageHeader"
import StatCard from "../components/StatCard"
import BudgetForm from "../components/BudgetForm"
import Button from "../components/Button"
import ConfirmDialog from "../components/ConfirmDialog"
import Chart from "../components/Chart"
import ProgressBar from "../components/ProgressBar"
import { api } from "../services/api"
import { useToast } from "../contexts/ToastContext"
import { useAnimation } from "../contexts/AnimationContext"
import anime from "animejs"
import "../styles/Budgeting.css"

const Budgeting = () => {
  const [budgets, setBudgets] = useState([])
  const [budgetSummary, setBudgetSummary] = useState({
    totalAllocated: 0,
    totalSpent: 0,
    remaining: 0,
  })
  const [pieChartData, setPieChartData] = useState({
    labels: [],
    datasets: [],
  })
  const [selectedBudget, setSelectedBudget] = useState(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()
  const { registerAnimation } = useAnimation()
  const pageRef = useRef(null)

  // Register page animation
  useEffect(() => {
    registerAnimation("budgetingPage", pageRef.current, {
      opacity: [0, 1],
      duration: 800,
      easing: "easeOutQuad",
    })

    // Animate elements on scroll
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            anime({
              targets: entry.target,
              translateY: [20, 0],
              opacity: [0, 1],
              duration: 600,
              easing: "easeOutQuad",
            })
          }
        })
      },
      { threshold: 0.1 },
    )

    document.querySelectorAll(".animate-on-scroll").forEach((el) => {
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [registerAnimation])

  // Load budgets
  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const data = await api.budgets.getAll()
        setBudgets(data)

        // Calculate budget summary
        const totalAllocated = data.reduce((sum, budget) => sum + budget.allocated, 0)
        const totalSpent = data.reduce((sum, budget) => sum + budget.spent, 0)
        const remaining = totalAllocated - totalSpent

        setBudgetSummary({ totalAllocated, totalSpent, remaining })

        // Prepare pie chart data
        preparePieChartData(data)
      } catch (error) {
        console.error("Error fetching budgets:", error)
        showToast("Failed to load budgets", "error")
      } finally {
        setLoading(false)
      }
    }

    fetchBudgets()
  }, [showToast])

  // Prepare data for pie chart
  const preparePieChartData = (budgetsData) => {
    setPieChartData({
      labels: budgetsData.map((budget) => budget.category),
      datasets: [
        {
          data: budgetsData.map((budget) => budget.allocated),
          backgroundColor: ["#2e60aa", "#00aec7", "#f1c40f", "#e74c3c", "#9b59b6", "#1abc9c"],
          borderWidth: 1,
        },
      ],
    })
  }

  // Handle adding a new budget
  const handleAddBudget = async (data) => {
    try {
      const newBudget = await api.budgets.add(data)
      setBudgets((prev) => [...prev, newBudget])

      // Update budget summary
      setBudgetSummary((prev) => ({
        ...prev,
        totalAllocated: prev.totalAllocated + newBudget.allocated,
        remaining: prev.remaining + newBudget.allocated,
      }))

      // Update pie chart
      preparePieChartData([...budgets, newBudget])

      showToast("Budget added successfully", "success")
    } catch (error) {
      console.error("Error adding budget:", error)
      showToast("Failed to add budget", "error")
    }
  }

  // Handle updating a budget
  const handleUpdateBudget = async (data) => {
    if (!selectedBudget) return

    try {
      const updatedBudget = await api.budgets.update(selectedBudget.id, data)

      setBudgets((prev) => prev.map((b) => (b.id === selectedBudget.id ? updatedBudget : b)))

      // Update budget summary
      const allocatedDiff = updatedBudget.allocated - selectedBudget.allocated

      setBudgetSummary((prev) => ({
        ...prev,
        totalAllocated: prev.totalAllocated + allocatedDiff,
        remaining: prev.remaining + allocatedDiff,
      }))

      // Update pie chart
      preparePieChartData(budgets.map((b) => (b.id === selectedBudget.id ? updatedBudget : b)))

      setSelectedBudget(null)
      showToast("Budget updated successfully", "success")
    } catch (error) {
      console.error("Error updating budget:", error)
      showToast("Failed to update budget", "error")
    }
  }

  // Handle deleting a budget
  const handleDeleteBudget = async () => {
    if (!selectedBudget) return

    try {
      await api.budgets.delete(selectedBudget.id)

      setBudgets((prev) => prev.filter((b) => b.id !== selectedBudget.id))

      // Update budget summary
      setBudgetSummary((prev) => ({
        ...prev,
        totalAllocated: prev.totalAllocated - selectedBudget.allocated,
        totalSpent: prev.totalSpent - selectedBudget.spent,
        remaining: prev.remaining - (selectedBudget.allocated - selectedBudget.spent),
      }))

      // Update pie chart
      preparePieChartData(budgets.filter((b) => b.id !== selectedBudget.id))

      showToast("Budget deleted successfully", "success")
    } catch (error) {
      console.error("Error deleting budget:", error)
      showToast("Failed to delete budget", "error")
    } finally {
      setSelectedBudget(null)
      setIsDeleteDialogOpen(false)
    }
  }

  // Handle edit button click
  const handleEdit = (budget) => {
    setSelectedBudget(budget)
  }

  // Handle delete button click
  const handleDelete = (budget) => {
    setSelectedBudget(budget)
    setIsDeleteDialogOpen(true)
  }

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)
  }

  // Prepare default values for edit form
  const getDefaultValues = () => {
    if (!selectedBudget) return {}

    return {
      category: selectedBudget.category,
      allocated: String(selectedBudget.allocated),
    }
  }

  return (
    <div className="budgeting-container" ref={pageRef} data-animation-id="budgetingPage">
      <Sidebar />
      <div className="budgeting-content">
        <PageHeader title="Budgeting">
          <BudgetForm onSubmit={handleAddBudget} />
        </PageHeader>

        <div className="budget-summary">
          <StatCard
            title="Total Budget"
            value={formatCurrency(budgetSummary.totalAllocated)}
            variant="default"
            animationDelay={100}
          />
          <StatCard
            title="Spent"
            value={formatCurrency(budgetSummary.totalSpent)}
            variant="expense"
            animationDelay={200}
          />
          <StatCard
            title="Remaining"
            value={formatCurrency(budgetSummary.remaining)}
            variant="savings"
            animationDelay={300}
          />
        </div>

        <div className="budget-charts">
          <div className="chart-card animate-on-scroll">
            <h3>Budget Allocation</h3>
            <Chart
              type="pie"
              data={pieChartData}
              options={{
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        const value = context.raw
                        const total = context.dataset.data.reduce((a, b) => a + b, 0)
                        const percentage = Math.round((value / total) * 100)
                        return `${formatCurrency(value)} (${percentage}%)`
                      },
                    },
                  },
                },
              }}
            />
          </div>
          <div className="chart-card animate-on-scroll">
            <h3>Budget Usage</h3>
            <div className="progress-bars">
              {budgets.map((budget, index) => {
                const percentage = (budget.spent / budget.allocated) * 100

                return (
                  <div key={budget.id} className="budget-progress">
                    <ProgressBar
                      value={budget.spent}
                      max={budget.allocated}
                      label={`${budget.category}: ${formatCurrency(budget.spent)} / ${formatCurrency(budget.allocated)}`}
                      variant="auto"
                      animated={true}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="budget-details animate-on-scroll">
          <h3>Budget Details</h3>
          <table className="budget-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Allocated</th>
                <th>Spent</th>
                <th>Remaining</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {budgets.map((budget) => {
                const remaining = budget.allocated - budget.spent

                return (
                  <tr key={budget.id}>
                    <td>{budget.category}</td>
                    <td>{formatCurrency(budget.allocated)}</td>
                    <td>{formatCurrency(budget.spent)}</td>
                    <td>{formatCurrency(remaining)}</td>
                    <td>
                      <div className="action-buttons">
                        <Button
                          variant="secondary"
                          size="small"
                          icon={<FaPencilAlt />}
                          onClick={() => handleEdit(budget)}
                        >
                          Edit
                        </Button>
                        <Button variant="danger" size="small" icon={<FaTrash />} onClick={() => handleDelete(budget)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {selectedBudget && (
          <BudgetForm
            onSubmit={handleUpdateBudget}
            defaultValues={getDefaultValues()}
            buttonText="Edit Budget"
            isEdit={true}
          />
        )}

        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDeleteBudget}
          title="Confirm Deletion"
          message="Are you sure you want to delete this budget? This action cannot be undone."
          confirmText="Delete"
          variant="danger"
        />
      </div>
    </div>
  )
}

export default Budgeting
