const express = require('express');
const router = express.Router();
const { 
  generateReport, 
  getReportByInterviewId 
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.post('/pdf', protect, generateReport);
router.get('/:interviewId', protect, getReportByInterviewId);

module.exports = router; 