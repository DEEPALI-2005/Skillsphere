const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date }
});

const progressSchema = new mongoose.Schema({
  gig: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gig',
    required: true
  },
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tasks:       [taskSchema],
  logs: [{
    message:   String,
    createdAt: { type: Date, default: Date.now }
  }],
  percentage:  { type: Number, default: 0 },
  deadline:    { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Progress', progressSchema);