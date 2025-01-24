const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // The user who receives the notification
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // The user who receives the notification
    message: { type: String, required: true },
    followRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'FollowRequest', required: true }, // If it's a follow request notification
    read: { type: Boolean, default: false },
    data: { type: String},
    createdAt: { type: Date, default: Date.now },
  });
  
  module.exports = mongoose.model('Notification', notificationSchema);
  
  
