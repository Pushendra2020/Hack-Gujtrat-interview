const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Set environment variables directly
process.env.PORT = process.env.PORT || 5000;
process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://<Enter user name>:<Enter password>@cluster1.hexrteo.mongodb.net';

const connectDB = require('./config/db');
// Import routes
const userRoutes = require('./routes/userRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const reportRoutes = require('./routes/reportRoutes');

// Load environment variables
console.log('Loading environment variables from:', path.resolve(__dirname, '.env'));
const result = dotenv.config({
  path: path.resolve(__dirname, '.env')
});
if (result.error) {
  console.error('Error loading .env file:', result.error);
  // Set environment variables manually if dotenv fails
  console.log('Setting environment variables manually');
  process.env.PORT = 5000;
  process.env.MONGO_URI = 'mongodb+srv://pushendralink2020:E83DT0MU134QO9t6@cluster1.hexrteo.mongodb.net';
}
console.log('Environment variables loaded:', Object.keys(process.env).filter(key => key === 'MONGO_URI' || key === 'PORT'));

// Load environment variables
console.log('Environment variables set:', {
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI ? 'DEFINED' : 'UNDEFINED'
});

const app = express();
const PORT = process.env.PORT || 5000;
console.log('PORT:', process.env.PORT);
console.log('MONGO_URI:', process.env.MONGO_URI);

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/report', reportRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('InterviewAI API is running...');
});

// Listen for connections after MongoDB connects (handled in connectDB)
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 


