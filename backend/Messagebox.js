const mongoose = require('mongoose');

const Messagebox = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    messages: [
        {
          userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
          message: { type: String, required: true }, // Add required validation
          name: String,
        },
      ],
      
  },
  { timestamps: true }
);


module.exports = mongoose.model('Messagebox',Messagebox)

