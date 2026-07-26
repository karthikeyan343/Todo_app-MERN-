const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const startReminderScheduler = require('./services/reminderService');

const app = express();
const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGO_URI;

app.use(cors({
  origin: process.env.CLIENT_URL || true,
  credentials: true
}));
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/todos', taskRoutes);

const startServer = async () => {
  try {
    if (!mongoUri) {
      throw new Error('MONGO_URI is missing in .env');
    }

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000
    });
    console.log('db connected successfully');

    startReminderScheduler();

    app.listen(port, () => {
      console.log(`port ${port} is running on the server!`);
    });
  } catch (error) {
    console.log('MongoDB connection failed:', error);
    console.log('Check your internet/DNS, MongoDB Atlas connection string, and Atlas Network Access IP whitelist.');
    process.exit(1);
  }
};

startServer();
