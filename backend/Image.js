const mongoose = require('mongoose');

// Define the schema for the image
const ImageSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' , required: true } ,
    images: [
        {
          data: { type: String, required: true },  // Base64 image data
          createdAt: { type: Date, default: Date.now }, // Timestamp when the image is uploaded
          username:{type:String,required:true},
          userid: { type: mongoose.Schema.Types.ObjectId, ref: 'User' , required: true } ,
          caption:{type:String},
          comments:{
            type:[String]
          },
          likes: {
            type: Number,
            default: 0, // Initialize with 0 likes
          },
          likedBy: {
            type: [String],
            
            default: [],
        },
        }
      ], // Base64 string for the image
});

// Create and export the Image model
module.exports = mongoose.model('Image', ImageSchema);
