"use client"

import React, { useState, useRef } from "react"
import { FaDownload, FaUpload } from "react-icons/fa"
import Sidebar from "../components/Sidebar"
import PageHeader from "../components/PageHeader"
import Button from "../components/Button"
import { api } from "../services/api"
import { useToast } from "../contexts/ToastContext"
import { useAnimation } from "../contexts/AnimationContext"
import "../styles/ExportImport.css"

const ExportImport = () => {
  const [file, setFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const { showToast } = useToast()
  const { registerAnimation } = useAnimation()
  const pageRef = useRef(null)
  const fileInputRef = useRef(null)

  // Register page animation
  React.useEffect(() => {
    registerAnimation("exportImportPage", pageRef.current, {
      opacity: [0, 1],
      duration: 800,
      easing: "easeOutQuad",
    })
  }, [registerAnimation])

  // Handle file change
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  // Handle export as CSV
  const handleExportCSV = async () => {
    setIsExporting(true)

    try {
      // Get all transactions
      const transactions = await api.transactions.getAll()

      // Convert to CSV
      const headers = ["Date", "Description", "Category", "Amount", "Payment Method"]
      const csvRows = [headers]

      transactions.forEach((transaction) => {
        const row = [
          new Date(transaction.date).toISOString().split("T")[0],
          transaction.description,
          transaction.category,
          transaction.amount.toString(),
          transaction.paymentMethod,
        ]
        csvRows.push(row)
      })

      const csvContent = csvRows.map((row) => row.join(",")).join("\n")

      // Create a blob and download
      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "xpend-transactions.csv"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      showToast("Transactions exported as CSV successfully", "success")
    } catch (error) {
      console.error("Error exporting CSV:", error)
      showToast("Failed to export transactions", "error")
    } finally {
      setIsExporting(false)
    }
  }

  // Handle export as JSON
  const handleExportJSON = async () => {
    setIsExporting(true)

    try {
      // Get all transactions and budgets
      const transactions = await api.transactions.getAll()
      const budgets = await api.budgets.getAll()

      // Create data object
      const data = {
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
      a.download = "xpend-data.json"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      showToast("Data exported as JSON successfully", "success")
    } catch (error) {
      console.error("Error exporting JSON:", error)
      showToast("Failed to export data", "error")
    } finally {
      setIsExporting(false)
    }
  }

  // Handle import
  const handleImport = async () => {
    if (!file) {
      showToast("Please select a file to import", "error")
      return
    }

    setIsUploading(true)

    try {
      // Read file content
      const fileContent = await readFileContent(file)

      // Process file based on type
      if (file.name.endsWith(".json")) {
        // Parse JSON data
        const data = JSON.parse(fileContent)

        // Import transactions
        if (data.transactions && Array.isArray(data.transactions)) {
          // In a real app, you would send this to the backend
          showToast(`Imported ${data.transactions.length} transactions`, "success")
        }

        // Import budgets
        if (data.budgets && Array.isArray(data.budgets)) {
          // In a real app, you would send this to the backend
          showToast(`Imported ${data.budgets.length} budgets`, "success")
        }
      } else if (file.name.endsWith(".csv")) {
        // Parse CSV data
        const rows = fileContent.split("\n")
        const headers = rows[0].split(",")

        // Check if it's a valid transactions CSV
        if (headers.includes("Description") && headers.includes("Amount")) {
          showToast(`Imported ${rows.length - 1} transactions`, "success")
        } else {
          showToast("Invalid CSV format", "error")
        }
      } else {
        showToast("Unsupported file format", "error")
      }

      // Reset file input
      setFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      console.error("Error importing file:", error)
      showToast(`Failed to import file: ${error.message}`, "error")
    } finally {
      setIsUploading(false)
    }
  }

  // Helper function to read file content
  const readFileContent = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (event) => {
        resolve(event.target.result)
      }

      reader.onerror = (error) => {
        reject(error)
      }

      reader.readAsText(file)
    })
  }

  return (
    <div className="export-import-container" ref={pageRef} data-animation-id="exportImportPage">
      <Sidebar />
      <div className="export-import-content">
        <PageHeader title="Export/Import" />

        <div className="export-import-sections">
          <div className="export-section">
            <h3>Export Data</h3>
            <p>Download your financial data as a file for backup or use in other applications.</p>
            <div className="export-buttons">
              <Button variant="primary" onClick={handleExportCSV} icon={<FaDownload />} disabled={isExporting}>
                Export as CSV
              </Button>
              <Button variant="primary" onClick={handleExportJSON} icon={<FaDownload />} disabled={isExporting}>
                Export as JSON
              </Button>
            </div>
          </div>

          <div className="import-section">
            <h3>Import Data</h3>
            <p>Upload a file to import financial data into your account.</p>
            <div className="file-input-container">
              <input type="file" id="fileInput" ref={fileInputRef} accept=".csv,.json" onChange={handleFileChange} />
              <label htmlFor="fileInput" className="file-input-label">
                {file ? file.name : "Choose a file"}
              </label>
            </div>
            <Button variant="primary" onClick={handleImport} icon={<FaUpload />} disabled={!file || isUploading}>
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExportImport
