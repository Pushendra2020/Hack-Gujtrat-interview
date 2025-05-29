const express = require('express');
const router = express.Router();
const { 
  startInterview, 
  submitAnswer, 
  generateFeedback,
  getInterviewById,
  getUserInterviews
} = require('../controllers/interviewController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.post('/start', protect, startInterview);
router.post('/submit-answer', protect, submitAnswer);
router.post('/feedback', protect, generateFeedback);
router.get('/:id', protect, getInterviewById);
router.get('/', protect, getUserInterviews);

module.exports = router; 