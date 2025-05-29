const InterviewSession = require('../models/InterviewSession');
const User = require('../models/User');
const PerformanceMetrics = require('../models/PerformanceMetrics');

// Mock function to generate questions based on role (would be replaced with actual OpenAI call)
const generateQuestionsForRole = async (role, jobDescription) => {
  // This would be replaced with an actual call to OpenAI API
  const questions = [
    `Tell me about your experience with ${role}?`,
    `What are the key skills required for a ${role} position?`,
    `Describe a challenging project you worked on as a ${role}.`,
    `How do you stay updated with the latest trends in ${role}?`,
    `Where do you see yourself in 5 years as a ${role}?`,
  ];
  
  return questions.map(q => ({ text: q, ttsAudioUrl: '' }));
};

// @desc    Start a new interview session
// @route   POST /api/interview/start
// @access  Private
const startInterview = async (req, res) => {
  try {
    const { role, jobDescription } = req.body;
    
    if (!role) {
      return res.status(400).json({ message: 'Role is required' });
    }
    
    // Generate questions based on role
    const questions = await generateQuestionsForRole(role, jobDescription);
    
    // Create new interview session
    const interviewSession = await InterviewSession.create({
      userId: req.user._id,
      role,
      jobDescription: jobDescription || '',
      questions,
      answers: Array(questions.length).fill({ text: '', audioUrl: '' }),
    });
    
    // Add the session to user's history
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { history: interviewSession._id } }
    );
    
    res.status(201).json({
      _id: interviewSession._id,
      role,
      questions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Submit answer for a question
// @route   POST /api/interview/submit-answer
// @access  Private
const submitAnswer = async (req, res) => {
  try {
    const { sessionId, questionIndex, answer, audioUrl } = req.body;
    
    if (!sessionId || questionIndex === undefined || !answer) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Find the interview session
    const session = await InterviewSession.findById(sessionId);
    
    if (!session) {
      return res.status(404).json({ message: 'Interview session not found' });
    }
    
    // Check if user owns this session
    if (session.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Update the answer at the specified index
    session.answers[questionIndex] = {
      text: answer,
      audioUrl: audioUrl || '',
    };
    
    await session.save();
    
    // Check if this is the last question
    const isLastQuestion = questionIndex === session.questions.length - 1;
    
    res.json({
      success: true,
      isLastQuestion,
      nextQuestionIndex: isLastQuestion ? null : questionIndex + 1,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Generate feedback for an interview
// @route   POST /api/interview/feedback
// @access  Private
const generateFeedback = async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID is required' });
    }
    
    // Find the interview session
    const session = await InterviewSession.findById(sessionId);
    
    if (!session) {
      return res.status(404).json({ message: 'Interview session not found' });
    }
    
    // Check if user owns this session
    if (session.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Generate transcript
    const transcript = session.questions.map((q, i) => {
      return `Q: ${q.text}\nA: ${session.answers[i]?.text || 'No answer provided'}`;
    }).join('\n\n');
    
    // Mock feedback generation (would be replaced with actual AI analysis)
    const feedback = {
      clarity: Math.floor(Math.random() * 40) + 60, // 60-100
      confidence: Math.floor(Math.random() * 40) + 60, // 60-100
      fillerWords: Math.floor(Math.random() * 10), // 0-10
      emotion: ['Neutral', 'Positive', 'Confident'][Math.floor(Math.random() * 3)],
      keywordUsage: Math.floor(Math.random() * 40) + 60, // 60-100
      suggestions: [
        'Try to be more specific with your examples',
        'Use more industry-specific terminology',
        'Elaborate more on your achievements',
      ],
      overallScore: Math.floor(Math.random() * 40) + 60, // 60-100
    };
    
    // Generate summary
    const summary = `Overall, your interview performance was ${feedback.overallScore >= 80 ? 'excellent' : 'good'}. 
    You demonstrated ${feedback.confidence >= 80 ? 'high' : 'moderate'} confidence and ${feedback.clarity >= 80 ? 'clear' : 'somewhat clear'} communication. 
    Your use of industry keywords was ${feedback.keywordUsage >= 80 ? 'excellent' : 'adequate'}.`;
    
    // Update the session with feedback and transcript
    session.feedback = feedback;
    session.transcript = transcript;
    session.summary = summary;
    
    await session.save();
    
    // Update user's performance metrics
    const performanceMetrics = await PerformanceMetrics.findOne({ userId: req.user._id });
    
    if (performanceMetrics) {
      performanceMetrics.timestamps.push(new Date());
      performanceMetrics.scores.push(feedback.overallScore);
      
      // Calculate average score
      const sum = performanceMetrics.scores.reduce((a, b) => a + b, 0);
      performanceMetrics.averageScore = Math.round(sum / performanceMetrics.scores.length);
      
      // Update progress level based on average score and number of interviews
      if (performanceMetrics.scores.length >= 5 && performanceMetrics.averageScore >= 80) {
        performanceMetrics.progressLevel = 'Advanced';
      } else if (performanceMetrics.scores.length >= 3 && performanceMetrics.averageScore >= 70) {
        performanceMetrics.progressLevel = 'Intermediate';
      }
      
      // Update interviews by role count
      const roleKey = session.role.replace(/\s+/g, '_').toLowerCase();
      const currentCount = performanceMetrics.interviewsByRole.get(roleKey) || 0;
      performanceMetrics.interviewsByRole.set(roleKey, currentCount + 1);
      
      await performanceMetrics.save();
      
      // Update user XP points
      const user = await User.findById(req.user._id);
      user.xpPoints += 100; // Add XP for completing an interview
      
      // Level up if enough XP
      if (user.xpPoints >= 1000 && user.level === 'Beginner') {
        user.level = 'Intermediate';
        user.badges.push({
          name: 'Intermediate Interviewer',
          description: 'Completed 10 interviews with good scores',
          earnedAt: new Date(),
        });
      } else if (user.xpPoints >= 3000 && user.level === 'Intermediate') {
        user.level = 'Advanced';
        user.badges.push({
          name: 'Advanced Interviewer',
          description: 'Mastered the interview process',
          earnedAt: new Date(),
        });
      } else if (user.xpPoints >= 10000 && user.level === 'Advanced') {
        user.level = 'Pro';
        user.badges.push({
          name: 'Professional Interviewer',
          description: 'Achieved expert status in interviewing',
          earnedAt: new Date(),
        });
      }
      
      await user.save();
    }
    
    res.json({
      feedback,
      transcript,
      summary,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get interview session by ID
// @route   GET /api/interview/:id
// @access  Private
const getInterviewById = async (req, res) => {
  try {
    const session = await InterviewSession.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({ message: 'Interview session not found' });
    }
    
    // Check if user owns this session
    if (session.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    res.json(session);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all interview sessions for a user
// @route   GET /api/interview
// @access  Private
const getUserInterviews = async (req, res) => {
  try {
    const interviews = await InterviewSession.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json(interviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  startInterview,
  submitAnswer,
  generateFeedback,
  getInterviewById,
  getUserInterviews,
}; 