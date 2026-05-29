const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String },
  amount:      { type: Number, required: true },
  dueDate:     { type: Date },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  }
});

const gigSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Gig title required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description required']
  },
  category: {
    type: String,
    required: [true, 'Category required'],
    enum: [
      'Web Development',
      'Mobile Development',
      'UI/UX Design',
      'Graphic Design',
      'Content Writing',
      'Digital Marketing',
      'Data Science',
      'Other'
    ]
  },
  skills: [String],
  budget: {
    min: { type: Number, required: true },
    max: { type: Number, required: true }
  },
  deadline: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    default: 'Remote'
  },
  milestones: [milestoneSchema],
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedFreelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'completed', 'cancelled'],
    default: 'open'
  },
  proposals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Proposal'
  }],
  attachments: [String],

}, { timestamps: true });

// Search ke liye index
gigSchema.index({ title: 'text', description: 'text', skills: 'text' });
gigSchema.index({ status: 1, category: 1 });

module.exports = mongoose.model('Gig', gigSchema);