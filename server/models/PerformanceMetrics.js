const mongoose = require('mongoose');

const performanceMetricsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    timestamps: [Date],
    scores: [Number],
    averageScore: {
      type: Number,
      default: 0,
    },
    progressLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Pro'],
      default: 'Beginner',
    },
    interviewsByRole: {
      type: Map,
      of: Number,
      default: {},
    },
    improvementRate: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const PerformanceMetrics = mongoose.model('PerformanceMetrics', performanceMetricsSchema);

module.exports = PerformanceMetrics; 