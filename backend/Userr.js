const mongoose = require('mongoose');

const userschema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  data: { type: String},
  resetToken: { type: String, default: undefined },
  resetTokenExpiry: { type: Date, default: undefined },

  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: [],  // Default to an empty array
    }
  ],
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: [],  // Default to an empty array
    }
  ],
}, { timestamps: true });  // Optional: Add createdAt and updatedAt fields

module.exports = mongoose.model('User', userschema);
