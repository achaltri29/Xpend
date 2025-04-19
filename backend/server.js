const express = require("express")
const cors = require("cors")
const connectDB = require("./db")
const path = require("path")
require("dotenv").config()

// Connect to database
connectDB()

const app = express()

// Middleware
app.use(express.json())
app.use(cors())

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '../../')))

// Define API routes
app.use("/api/auth", require("./routes/auth"))
app.use("/api/user", require("./routes/users"))
app.use("/api/transactions", require("./routes/transactions"))
app.use("/api/budgets", require("./routes/budgets"))

// Serve HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../index.html'))
})

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../../index.html'))
})

app.get('/budgeting', (req, res) => {
  res.sendFile(path.join(__dirname, '../../index.html'))
})

app.get('/transactions', (req, res) => {
  res.sendFile(path.join(__dirname, '../../index.html'))
})

app.get('/settings', (req, res) => {
  res.sendFile(path.join(__dirname, '../../index.html'))
})

app.get('/export-import', (req, res) => {
  res.sendFile(path.join(__dirname, '../../index.html'))
})

const PORT = process.env.PORT || 5000

// Function to find an available port
const findAvailablePort = async (startPort) => {
  const net = require('net')
  return new Promise((resolve) => {
    const server = net.createServer()
    server.unref()
    server.on('error', () => {
      resolve(findAvailablePort(startPort + 1))
    })
    server.listen(startPort, () => {
      server.close(() => {
        resolve(startPort)
      })
    })
  })
}

// Start server with dynamic port
const startServer = async () => {
  try {
    const availablePort = await findAvailablePort(PORT)
    const server = app.listen(availablePort, () => {
      console.log(`Server running on port ${availablePort}`)
      console.log(`MongoDB Connected: localhost`)
    })

    // Handle server errors
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${availablePort} is in use, trying next port...`)
        startServer()
      } else {
        console.error('Server error:', err)
      }
    })
  } catch (error) {
    console.error('Failed to start server:', error)
  }
}

startServer()
