"use client"

import { useState, useEffect, useRef } from "react"
import { FaPencilAlt, FaTrash } from "react-icons/fa"
import Sidebar from "../components/Sidebar"
import PageHeader from "../components/PageHeader"
import DataTable from "../components/DataTable"
import TransactionForm from "../components/TransactionForm"
import Button from "../components/Button"
import ConfirmDialog from "../components/ConfirmDialog"
import { api } from "../services/api"
import { useToast } from "../contexts/ToastContext"
import { useAnimation } from "../contexts/AnimationContext"
import "../styles/Transactions.css"

const Transactions = () => {
  const [transactions, setTransactions] = useState([])
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()
  const { registerAnimation } = useAnimation()
  const pageRef = useRef(null)

  // Register page animation
  useEffect(() => {
    registerAnimation("transactionsPage", pageRef.current, {
      opacity: [0, 1],
      duration: 800,
      easing: "easeOutQuad",
    })
  }, [registerAnimation])

  // Load transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await api.transactions.getAll()
        setTransactions(data)
      } catch (error) {
        console.error("Error fetching transactions:", error)
        showToast("Failed to load transactions", "error")
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [showToast])

  // Handle adding a new transaction
  const handleAddTransaction = async (data) => {
    try {
      const newTransaction = await api.transactions.add(data)
      setTransactions((prev) => [newTransaction, ...prev])
      showToast("Transaction added successfully", "success")
    } catch (error) {
      console.error("Error adding transaction:", error)
      showToast("Failed to add transaction", "error")
    }
  }

  // Handle updating a transaction
  const handleUpdateTransaction = async (data) => {
    if (!selectedTransaction) return

    try {
      const updatedTransaction = await api.transactions.update(selectedTransaction.id, data)

      setTransactions((prev) => prev.map((t) => (t.id === selectedTransaction.id ? updatedTransaction : t)))

      setSelectedTransaction(null)
      showToast("Transaction updated successfully", "success")
    } catch (error) {
      console.error("Error updating transaction:", error)
      showToast("Failed to update transaction", "error")
    }
  }

  // Handle deleting a transaction
  const handleDeleteTransaction = async () => {
    if (!selectedTransaction) return

    try {
      await api.transactions.delete(selectedTransaction.id)

      setTransactions((prev) => prev.filter((t) => t.id !== selectedTransaction.id))

      showToast("Transaction deleted successfully", "success")
    } catch (error) {
      console.error("Error deleting transaction:", error)
      showToast("Failed to delete transaction", "error")
    } finally {
      setSelectedTransaction(null)
      setIsDeleteDialogOpen(false)
    }
  }

  // Handle edit button click
  const handleEdit = (transaction) => {
    setSelectedTransaction(transaction)
  }

  // Handle delete button click
  const handleDelete = (transaction) => {
    setSelectedTransaction(transaction)
    setIsDeleteDialogOpen(true)
  }

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)
  }

  // Prepare data for transactions table
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
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="action-buttons">
          <Button variant="secondary" size="small" icon={<FaPencilAlt />} onClick={() => handleEdit(row)}>
            Edit
          </Button>
          <Button variant="danger" size="small" icon={<FaTrash />} onClick={() => handleDelete(row)}>
            Delete
          </Button>
        </div>
      ),
    },
  ]

  // Prepare default values for edit form
  const getDefaultValues = () => {
    if (!selectedTransaction) return {}

    return {
      description: selectedTransaction.description,
      amount: String(Math.abs(selectedTransaction.amount)),
      category: selectedTransaction.category,
      date: new Date(selectedTransaction.date).toISOString().split("T")[0],
      paymentMethod: selectedTransaction.paymentMethod,
    }
  }

  return (
    <div className="transactions-container" ref={pageRef} data-animation-id="transactionsPage">
      <Sidebar />
      <div className="transactions-content">
        <PageHeader title="Transactions">
          <TransactionForm onSubmit={handleAddTransaction} />
        </PageHeader>

        <div className="transactions-table">
          <DataTable
            columns={columns}
            data={transactions}
            searchKey="description"
            searchPlaceholder="Search transactions..."
          />
        </div>

        {selectedTransaction && (
          <TransactionForm
            onSubmit={handleUpdateTransaction}
            defaultValues={getDefaultValues()}
            buttonText="Edit Transaction"
            isEdit={true}
          />
        )}

        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDeleteTransaction}
          title="Confirm Deletion"
          message="Are you sure you want to delete this transaction? This action cannot be undone."
          confirmText="Delete"
          variant="danger"
        />
      </div>
    </div>
  )
}

export default Transactions
