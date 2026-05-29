const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  gig: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gig',
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-escrow', 'released', 'refunded'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    default: () => 'TXN' + Date.now()
  },
  milestoneIndex: {
    type: Number,
    default: 0
  },
  paidAt: Date,
  releasedAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);