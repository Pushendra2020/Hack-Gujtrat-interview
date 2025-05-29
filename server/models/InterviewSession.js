const mongoose = require('mongoose');

const interviewSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    jobDescription: {
      type: String,
      trim: true,
    },
    questions: [
      {
        text: String,
        ttsAudioUrl: String,
      },
    ],
    answers: [
      {
        text: String,
        audioUrl: String,
      },
    ],
    transcript: {
      type: String,
      default: '',
    },
    feedback: {
      clarity: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      confidence: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      fillerWords: {
        type: Number,
        default: 0,
      },
      emotion: {
        type: String,
        enum: ['Neutral', 'Positive', 'Negative', 'Confident', 'Nervous'],
        default: 'Neutral',
      },
      keywordUsage: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      suggestions: [String],
      overallScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
    },
    reportUrl: {
      type: String,
      default: '',
    },
    summary: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const InterviewSession = mongoose.model('InterviewSession', interviewSessionSchema);

module.exports = InterviewSession; 