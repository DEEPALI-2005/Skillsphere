const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
  gig: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gig',
    required: true
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    required: true
  },
  raisedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  against: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    required: [true, 'Reason required']
  },
  description: {
    type: String,
    required: [true, 'Description required']
  },
  evidence: [String],
  status: {
    type: String,
    enum: ['open', 'under_review', 'resolved_client', 'resolved_freelancer', 'closed'],
    default: 'open'
  },
  resolution: {
    type: String,
    default: ''
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('Dispute', disputeSchema);