// API service for making requests to the backend

// Base URL for API calls
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api"

// Default headers
let headers = {
  "Content-Type": "application/json",
}

// Set authentication token
const setToken = (token) => {
  headers = {
    ...headers,
    Authorization: `Bearer ${token}`,
  }
}

// Remove authentication token
const removeToken = () => {
  const { Authorization, ...rest } = headers
  headers = rest
}

// Helper function for making API requests
const request = async (endpoint, method = "GET", data = null) => {
  const url = `${BASE_URL}${endpoint}`

  const options = {
    method,
    headers,
  }

  if (data && (method === "POST" || method === "PUT")) {
    options.body = JSON.stringify(data)
  }

  try {
    const response = await fetch(url, options)

    // Handle HTTP errors
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "API request failed")
    }

    return await response.json()
  } catch (error) {
    console.error("API request error:", error)
    throw error
  }
}

// Authentication API
const auth = {
  login: (email, password) => request("/auth/login", "POST", { email, password }),
  register: (name, email, password) => request("/auth/register", "POST", { name, email, password }),
  resetPassword: (email) => request("/auth/reset-password", "POST", { email }),
}

// User API
const user = {
  getProfile: () => request("/user/profile"),
  updateProfile: (userData) => request("/user/profile", "PUT", userData),
  updateSettings: (settings) => request("/user/settings", "PUT", settings),
}

// Transaction API
const transactions = {
  getAll: () => request("/transactions"),
  getRecent: (limit = 5) => request(`/transactions/recent?limit=${limit}`),
  add: (transaction) => request("/transactions", "POST", transaction),
  update: (id, transaction) => request(`/transactions/${id}`, "PUT", transaction),
  delete: (id) => request(`/transactions/${id}`, "DELETE"),
}

// Budget API
const budgets = {
  getAll: () => request("/budgets"),
  add: (budget) => request("/budgets", "POST", budget),
  update: (id, budget) => request(`/budgets/${id}`, "PUT", budget),
  delete: (id) => request(`/budgets/${id}`, "DELETE"),
}

// Mock API for development (when backend is not available)
const mockData = {
  transactions: [
    {
      id: "1",
      date: new Date(2024, 0, 30),
      description: "Groceries",
      category: "Food",
      amount: -50,
      paymentMethod: "Credit Card",
    },
    {
      id: "2",
      date: new Date(2024, 0, 29),
      description: "Salary",
      category: "Income",
      amount: 3000,
      paymentMethod: "Bank Transfer",
    },
    {
      id: "3",
      date: new Date(2024, 1, 5),
      description: "Electricity Bill",
      category: "Bills",
      amount: -75,
      paymentMethod: "Credit Card",
    },
    {
      id: "4",
      date: new Date(2024, 1, 2),
      description: "Freelance Work",
      category: "Income",
      amount: 500,
      paymentMethod: "Bank Transfer",
    },
    {
      id: "5",
      date: new Date(2024, 1, 10),
      description: "Restaurant",
      category: "Food",
      amount: -45,
      paymentMethod: "Credit Card",
    },
  ],
  budgets: [
    {
      id: "1",
      category: "Groceries",
      allocated: 600,
      spent: 450,
    },
    {
      id: "2",
      category: "Entertainment",
      allocated: 300,
      spent: 120,
    },
    {
      id: "3",
      category: "Transportation",
      allocated: 200,
      spent: 150,
    },
  ],
  user: {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    settings: {
      currency: "USD",
      theme: "light",
      notifications: {
        email: true,
        sms: false,
        budgetAlerts: true,
      },
    },
  },
}

// Mock API implementation
const mockApi = {
  auth: {
    login: (email, password) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (email === "demo@example.com" && password === "password") {
            resolve({ token: "mock-token-12345", user: mockData.user })
          } else {
            reject(new Error("Invalid credentials"))
          }
        }, 500)
      })
    },
    register: (name, email, password) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: true })
        }, 500)
      })
    },
    resetPassword: (email) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: true })
        }, 500)
      })
    },
  },
  user: {
    getProfile: () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(mockData.user)
        }, 500)
      })
    },
    updateProfile: (userData) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          mockData.user = { ...mockData.user, ...userData }
          resolve(mockData.user)
        }, 500)
      })
    },
    updateSettings: (settings) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          mockData.user.settings = { ...mockData.user.settings, ...settings }
          resolve(mockData.user.settings)
        }, 500)
      })
    },
  },
  transactions: {
    getAll: () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve([...mockData.transactions])
        }, 500)
      })
    },
    getRecent: (limit = 5) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const sorted = [...mockData.transactions].sort((a, b) => new Date(b.date) - new Date(a.date))
          resolve(sorted.slice(0, limit))
        }, 500)
      })
    },
    add: (transaction) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const newTransaction = {
            id: String(mockData.transactions.length + 1),
            ...transaction,
            date: new Date(transaction.date),
          }
          mockData.transactions.push(newTransaction)
          resolve(newTransaction)
        }, 500)
      })
    },
    update: (id, transaction) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const index = mockData.transactions.findIndex((t) => t.id === id)
          if (index !== -1) {
            mockData.transactions[index] = {
              ...mockData.transactions[index],
              ...transaction,
              date: new Date(transaction.date),
            }
            resolve(mockData.transactions[index])
          } else {
            reject(new Error("Transaction not found"))
          }
        }, 500)
      })
    },
    delete: (id) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const index = mockData.transactions.findIndex((t) => t.id === id)
          if (index !== -1) {
            mockData.transactions.splice(index, 1)
            resolve({ success: true })
          } else {
            reject(new Error("Transaction not found"))
          }
        }, 500)
      })
    },
  },
  budgets: {
    getAll: () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve([...mockData.budgets])
        }, 500)
      })
    },
    add: (budget) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const newBudget = {
            id: String(mockData.budgets.length + 1),
            ...budget,
            spent: 0,
          }
          mockData.budgets.push(newBudget)
          resolve(newBudget)
        }, 500)
      })
    },
    update: (id, budget) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const index = mockData.budgets.findIndex((b) => b.id === id)
          if (index !== -1) {
            mockData.budgets[index] = {
              ...mockData.budgets[index],
              ...budget,
            }
            resolve(mockData.budgets[index])
          } else {
            reject(new Error("Budget not found"))
          }
        }, 500)
      })
    },
    delete: (id) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const index = mockData.budgets.findIndex((b) => b.id === id)
          if (index !== -1) {
            mockData.budgets.splice(index, 1)
            resolve({ success: true })
          } else {
            reject(new Error("Budget not found"))
          }
        }, 500)
      })
    },
  },
}

// Use real API if available, otherwise use mock API
const api = {
  auth,
  user,
  transactions,
  budgets,
  setToken,
  removeToken,
}

export { api }
