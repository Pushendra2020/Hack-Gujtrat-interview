const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      enum: ['pdf', 'docx'],
      required: true,
    },
    parsedContent: {
      type: String,
    },
    skills: [String],
    atsScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    formattingIssues: [String],
    grammarIssues: [String],
    improvementSuggestions: [String],
    keywordMatch: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    comparedJobRole: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Resume = mongoose.model('Resume', resumeSchema);

module.exports = Resume; 