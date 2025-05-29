const Resume = require('../models/Resume');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// Check file type
const checkFileType = (file, cb) => {
  const filetypes = /pdf|docx|doc/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Error: Only PDF and Word documents are allowed!');
  }
};

// Initialize upload
const upload = multer({
  storage,
  limits: { fileSize: 10000000 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
});

// Mock function to parse resume content (would be replaced with actual parser)
const parseResumeContent = async (filePath, fileType) => {
  // This would be replaced with actual parsing logic
  return {
    parsedContent: 'Sample parsed resume content',
    skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
  };
};

// Mock function to analyze resume against job role (would be replaced with AI analysis)
const analyzeResumeForRole = async (parsedContent, skills, role) => {
  // This would be replaced with actual AI analysis
  return {
    atsScore: Math.floor(Math.random() * 40) + 60, // 60-100
    formattingIssues: [
      'Consider using bullet points for better readability',
      'Add more white space between sections',
    ],
    grammarIssues: [
      'Check for passive voice in your experience section',
      'Ensure consistent tense usage throughout',
    ],
    improvementSuggestions: [
      'Add more quantifiable achievements',
      'Include relevant keywords from the job description',
      'Highlight specific technical skills more prominently',
    ],
    keywordMatch: Math.floor(Math.random() * 40) + 60, // 60-100
  };
};

// @desc    Upload resume
// @route   POST /api/resume/upload
// @access  Private
const uploadResume = async (req, res) => {
  try {
    // Note: In a real implementation, upload.single('resume') middleware would be used
    // Here we're mocking the file upload process
    const mockFile = {
      filename: `${req.user._id}-${Date.now()}.pdf`,
      originalname: 'resume.pdf',
      path: `/uploads/${req.user._id}-${Date.now()}.pdf`,
      mimetype: 'application/pdf',
    };

    // Extract file type
    const fileType = path.extname(mockFile.originalname).toLowerCase().substring(1);

    // Parse resume content
    const { parsedContent, skills } = await parseResumeContent(mockFile.path, fileType);

    // Create resume record
    const resume = await Resume.create({
      userId: req.user._id,
      fileUrl: mockFile.path,
      fileName: mockFile.originalname,
      fileType,
      parsedContent,
      skills,
    });

    // Update user's resumeUrl
    await User.findByIdAndUpdate(req.user._id, { resumeUrl: mockFile.path });

    res.status(201).json({
      _id: resume._id,
      fileName: resume.fileName,
      fileUrl: resume.fileUrl,
      skills: resume.skills,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get ATS score for resume
// @route   POST /api/resume/ats-score
// @access  Private
const getATSScore = async (req, res) => {
  try {
    const { resumeId, role } = req.body;

    if (!resumeId || !role) {
      return res.status(400).json({ message: 'Resume ID and role are required' });
    }

    // Find the resume
    const resume = await Resume.findById(resumeId);

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Check if user owns this resume
    if (resume.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Analyze resume for the specified role
    const analysis = await analyzeResumeForRole(
      resume.parsedContent,
      resume.skills,
      role
    );

    // Update resume with analysis results
    resume.atsScore = analysis.atsScore;
    resume.formattingIssues = analysis.formattingIssues;
    resume.grammarIssues = analysis.grammarIssues;
    resume.improvementSuggestions = analysis.improvementSuggestions;
    resume.keywordMatch = analysis.keywordMatch;
    resume.comparedJobRole = role;

    await resume.save();

    // Update user's ATS score
    await User.findByIdAndUpdate(req.user._id, { atsScore: analysis.atsScore });

    // Add XP points for analyzing resume
    const user = await User.findById(req.user._id);
    user.xpPoints += 50; // Add XP for resume analysis
    await user.save();

    res.json({
      atsScore: analysis.atsScore,
      formattingIssues: analysis.formattingIssues,
      grammarIssues: analysis.grammarIssues,
      improvementSuggestions: analysis.improvementSuggestions,
      keywordMatch: analysis.keywordMatch,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's resumes
// @route   GET /api/resume
// @access  Private
const getUserResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    res.json(resumes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get resume by ID
// @route   GET /api/resume/:id
// @access  Private
const getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Check if user owns this resume
    if (resume.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(resume);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  uploadResume,
  getATSScore,
  getUserResumes,
  getResumeById,
}; 