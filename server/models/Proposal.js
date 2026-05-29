const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema({
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
  coverLetter: {
    type: String,
    required: [true, 'Cover letter required']
  },
  bidAmount: {
    type: Number,
    required: [true, 'Bid amount required']
  },
  deliveryTime: {
    type: Number, // Days mein
    required: [true, 'Delivery time required']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Proposal', proposalSchema);