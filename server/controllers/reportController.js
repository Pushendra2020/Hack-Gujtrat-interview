const InterviewSession = require('../models/InterviewSession');
const Resume = require('../models/Resume');
const path = require('path');

// Mock function to generate PDF report (would be replaced with actual PDF generation)
const generatePDFReport = async (interviewData, resumeData = null) => {
  // This would be replaced with actual PDF generation logic
  // using a library like PDFKit, jsPDF, or pdf-lib
  
  // Mock return value - in a real implementation, this would be the URL to the generated PDF
  return `/reports/${interviewData._id}-${Date.now()}.pdf`;
};

// @desc    Generate PDF report for an interview
// @route   POST /api/report/pdf
// @access  Private
const generateReport = async (req, res) => {
  try {
    const { interviewId, resumeId } = req.body;
    
    if (!interviewId) {
      return res.status(400).json({ message: 'Interview ID is required' });
    }
    
    // Find the interview session
    const interview = await InterviewSession.findById(interviewId);
    
    if (!interview) {
      return res.status(404).json({ message: 'Interview session not found' });
    }
    
    // Check if user owns this interview
    if (interview.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Get resume data if provided
    let resume = null;
    if (resumeId) {
      resume = await Resume.findById(resumeId);
      
      // Check if resume exists and belongs to user
      if (!resume || resume.userId.toString() !== req.user._id.toString()) {
        resume = null; // Reset to null if not found or not authorized
      }
    }
    
    // Generate PDF report
    const reportUrl = await generatePDFReport(interview, resume);
    
    // Update interview with report URL
    interview.reportUrl = reportUrl;
    await interview.save();
    
    res.json({
      success: true,
      reportUrl,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get report by interview ID
// @route   GET /api/report/:interviewId
// @access  Private
const getReportByInterviewId = async (req, res) => {
  try {
    const interview = await InterviewSession.findById(req.params.interviewId);
    
    if (!interview) {
      return res.status(404).json({ message: 'Interview session not found' });
    }
    
    // Check if user owns this interview
    if (interview.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Check if report exists
    if (!interview.reportUrl) {
      return res.status(404).json({ message: 'Report not found for this interview' });
    }
    
    res.json({
      reportUrl: interview.reportUrl,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  generateReport,
  getReportByInterviewId,
}; 