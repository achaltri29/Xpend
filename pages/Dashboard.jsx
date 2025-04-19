"use client"

import React from 'react'
import { useState, useEffect, useRef } from "react"
import { FaArrowUp, FaArrowDown, FaDollarSign } from "react-icons/fa"
import Sidebar from "../components/Sidebar"
import PageHeader from "../components/PageHeader"
import StatCard from "../components/StatCard"
import DataTable from "../components/DataTable"
import TransactionForm from "../components/TransactionForm"
import Chart from "../components/Chart"
import { api } from "../services/api"
import { useToast } from "../contexts/ToastContext"
import { useAnimation } from "../contexts/AnimationContext"
import anime from "animejs"
import "../styles/Dashboard.css"
import { useAuth } from '../contexts/AuthContext'

const Dashboard = () => {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [transactions, setTransactions] = useState([])
  const [financialSummary, setFinancialSummary] = useState({
    income: 0,
    expenses: 0,
    savings: 0,
  })
  const [monthlyData, setMonthlyData] = useState({
    labels: [],
    datasets: [],
  })
  const [categoryData, setCategoryData] = useState({
    labels: [],
    datasets: [],
  })
  const pageRef = useRef(null)

  // Register page animation
  useEffect(() => {
    // Animate cards on scroll
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
  }, [])

  // Load transactions and calculate summary
  useEffect(() => {
    const fetchData = async () => {
      try {
        const transactionsData = await api.transactions.getAll()
        setTransactions(transactionsData)

        // Calculate financial summary
        const income = transactionsData.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0)
        const expenses = transactionsData.filter((t) => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0)
        const savings = income - expenses

        setFinancialSummary({ income, expenses, savings })

        // Prepare monthly data
        prepareMonthlyData(transactionsData)

        // Prepare category data
        prepareCategoryData(transactionsData)
      } catch (error) {
        console.error("Error fetching transactions:", error)
        showToast("Failed to load transactions", "error")
      }
    }

    fetchData()
  }, [showToast])

  // Prepare monthly data for chart
  const prepareMonthlyData = (transactionsData) => {
    // Get last 6 months
    const months = []
    const currentDate = new Date()

    for (let i = 5; i >= 0; i--) {
      const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      months.push({
        month: month,
        label: month.toLocaleString("default", { month: "short" }),
        income: 0,
        expenses: 0,
      })
    }

    // Calculate income and expenses for each month
    transactionsData.forEach((transaction) => {
      const transactionDate = new Date(transaction.date)

      months.forEach((monthData) => {
        if (
          transactionDate.getMonth() === monthData.month.getMonth() &&
          transactionDate.getFullYear() === monthData.month.getFullYear()
        ) {
          if (transaction.amount > 0) {
            monthData.income += transaction.amount
          } else {
            monthData.expenses += Math.abs(transaction.amount)
          }
        }
      })
    })

    // Create chart data
    setMonthlyData({
      labels: months.map((data) => data.label),
      datasets: [
        {
          label: "Income",
          data: months.map((data) => data.income),
          backgroundColor: "rgba(46, 204, 113, 0.5)",
          borderColor: "rgb(46, 204, 113)",
          borderWidth: 1,
        },
        {
          label: "Expenses",
          data: months.map((data) => data.expenses),
          backgroundColor: "rgba(231, 76, 60, 0.5)",
          borderColor: "rgb(231, 76, 60)",
          borderWidth: 1,
        },
      ],
    })
  }

  // Prepare category data for chart
  const prepareCategoryData = (transactionsData) => {
    // Get expenses by category
    const categories = {}

    transactionsData.forEach((transaction) => {
      if (transaction.amount < 0) {
        const category = transaction.category
        const amount = Math.abs(transaction.amount)

        if (categories[category]) {
          categories[category] += amount
        } else {
          categories[category] = amount
        }
      }
    })

    // Convert to array for chart
    const categoryArray = Object.keys(categories).map((category) => ({
      category: category,
      amount: categories[category],
    }))

    // Create chart data
    setCategoryData({
      labels: categoryArray.map((data) => data.category),
      datasets: [
        {
          data: categoryArray.map((data) => data.amount),
          backgroundColor: ["#2e60aa", "#00aec7", "#f1c40f", "#e74c3c", "#9b59b6", "#1abc9c"],
          borderWidth: 1,
        },
      ],
    })
  }

  // Handle adding a new transaction
  const handleAddTransaction = async (data) => {
    try {
      const newTransaction = await api.transactions.add(data)
      setTransactions((prev) => [newTransaction, ...prev])

      // Update financial summary
      setFinancialSummary((prev) => {
        const amount = Number(data.amount)
        if (amount > 0) {
          return {
            ...prev,
            income: prev.income + amount,
            savings: prev.savings + amount,
          }
        } else {
          const absAmount = Math.abs(amount)
          return {
            ...prev,
            expenses: prev.expenses + absAmount,
            savings: prev.savings - absAmount,
          }
        }
      })

      // Update charts
      prepareMonthlyData([...transactions, newTransaction])
      prepareCategoryData([...transactions, newTransaction])

      showToast("Transaction added successfully", "success")
    } catch (error) {
      console.error("Error adding transaction:", error)
      showToast("Failed to add transaction", "error")
    }
  }

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)
  }

  // Prepare data for recent transactions table
  const recentTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)

  const columns = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        const date = new Date(row.date)
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      },
    },
    {
      accessorKey: "description",
      header: "Description",
    },
    {
      accessorKey: "category",
      header: "Category",
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => {
        const amount = row.amount
        return (
          <span className={amount < 0 ? "text-danger" : "text-success"}>
            {amount < 0 ? "-" : "+"}
            {formatCurrency(Math.abs(amount))}
          </span>
        )
      },
    },
    {
      accessorKey: "paymentMethod",
      header: "Payment Method",
    },
  ]

  return (
    <div className="dashboard-container" ref={pageRef} data-animation-id="dashboardPage">
      <Sidebar />
      <div className="dashboard-content">
        <PageHeader title="Dashboard">
          <TransactionForm onSubmit={handleAddTransaction} />
        </PageHeader>

        <div className="stats-container">
          <StatCard
            title="Income"
            value={formatCurrency(financialSummary.income)}
            icon={<FaArrowUp />}
            variant="income"
            animationDelay={100}
          />
          <StatCard
            title="Expenses"
            value={formatCurrency(financialSummary.expenses)}
            icon={<FaArrowDown />}
            variant="expense"
            animationDelay={200}
          />
          <StatCard
            title="Savings"
            value={formatCurrency(financialSummary.savings)}
            icon={<FaDollarSign />}
            variant="savings"
            animationDelay={300}
          />
        </div>

        <div className="charts-container">
          <div className="chart-card animate-on-scroll">
            <h3>Monthly Overview</h3>
            <Chart
              type="bar"
              data={monthlyData}
              options={{
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (value) => formatCurrency(value),
                    },
                  },
                },
              }}
            />
          </div>
          <div className="chart-card animate-on-scroll">
            <h3>Spending by Category</h3>
            <Chart
              type="pie"
              data={categoryData}
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
        </div>

        <div className="recent-transactions animate-on-scroll">
          <h3>Recent Transactions</h3>
          <DataTable columns={columns} data={recentTransactions} />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
