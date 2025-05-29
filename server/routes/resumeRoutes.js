const express = require('express');
const router = express.Router();
const { 
  uploadResume, 
  getATSScore, 
  getUserResumes,
  getResumeById
} = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.post('/upload', protect, uploadResume);
router.post('/ats-score', protect, getATSScore);
router.get('/:id', protect, getResumeById);
router.get('/', protect, getUserResumes);

module.exports = router; 