const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  Caption: {
    type: String,
    required: true,
  },
  userid: {
    type: String,
    // ref: 'User',  // Correct reference to the User model
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  likes: {
    type: Number,
    default: 0, // Initialize with 0 likes
  },
  // likedBy: {
  //   type: [mongoose.Schema.Types.ObjectId],  // Array of User IDs who have liked the product
  //   ref: 'User',  // Reference to the User model
  //   default: [], // Initialize with an empty array
    
  // },
  likedBy: {
    type: [String], // Array of usernames instead of user IDs
    default: [],
},
messages: [
  {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      message: String,
      name:String,
  },
],

  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400, // Expire after 1 day (86400 seconds)
  },
  
}, 
{ timestamps: true });

module.exports = mongoose.model('Product', productSchema);
