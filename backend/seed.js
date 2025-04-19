const mongoose = require('mongoose');
const User = require('./models/User');
const Budget = require('./models/Budget');
const Transaction = require('./models/Transaction');
const connectDB = require('./db');
require('dotenv').config();

// Connect to database
connectDB();

const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Budget.deleteMany({});
    await Transaction.deleteMany({});

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin',
      email: 'master@admin',
      password: 'admin@123',
      settings: {
        currency: 'USD',
        theme: 'light',
        notifications: {
          email: true,
          sms: false,
          budgetAlerts: true
        }
      }
    });

    // Create sample budgets for admin
    const budgets = await Budget.create([
      {
        user: adminUser._id,
        category: 'Food',
        allocated: 1000
      },
      {
        user: adminUser._id,
        category: 'Transportation',
        allocated: 500
      },
      {
        user: adminUser._id,
        category: 'Entertainment',
        allocated: 800
      }
    ]);

    // Create sample transactions for admin
    const transactions = await Transaction.create([
      {
        user: adminUser._id,
        date: new Date('2024-01-15'),
        description: 'Monthly groceries',
        category: 'Food',
        amount: 300,
        paymentMethod: 'Credit Card'
      },
      {
        user: adminUser._id,
        date: new Date('2024-01-16'),
        description: 'Fuel',
        category: 'Transportation',
        amount: 150,
        paymentMethod: 'Debit Card'
      },
      {
        user: adminUser._id,
        date: new Date('2024-01-17'),
        description: 'Dining out',
        category: 'Food',
        amount: 200,
        paymentMethod: 'Credit Card'
      }
    ]);

    console.log('Database seeded successfully!');
    console.log('Created admin user:', adminUser.email);
    console.log('Created budgets:', budgets.length);
    console.log('Created transactions:', transactions.length);

    process.exit();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase(); 