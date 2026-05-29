const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const portfolioItemSchema = new mongoose.Schema({
  url:      { type: String, required: true },
  publicId: { type: String },
  title:    { type: String, default: 'Portfolio Item' }
});
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email required'],
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Password required'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['client', 'freelancer', 'admin'],
    default: 'client'
  },

  avatar:          { type: String, default: '' },
  avatarPublicId:  { type: String, default: '' },

  bio:       String,
  location:  String,
  skills:      [String],
  hourlyRate:  Number,
  rating:      { type: Number, default: 0 },
  portfolio:      [portfolioItemSchema],
  resume:         { type: String, default: '' },
  resumePublicId: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  isActive:   { type: Boolean, default: true },
twoFactorSecret:  { type: String, default: '', select: false },
twoFactorEnabled: { type: Boolean, default: false },
  resetPasswordToken:   String,
  resetPasswordExpire:  Date,
emailVerifyToken:   String,
emailVerifyExpire:  Date,

}, { timestamps: true });
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);