const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'], // [rule, error message]
      trim: true,                            // removes extra spaces
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,      // no two users can have same email
      lowercase: true,   // always store as lowercase
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['user', 'organizer', 'admin'], // only these 3 values allowed
      default: 'user',                      // new signups are 'user' by default
    },
    avatar: {
      type: String,
      default: '',   // profile picture URL (Cloudinary later)
    },
  },
  {
    timestamps: true, // auto-adds createdAt and updatedAt fields
  }
);

// Export the model so other files can use it
module.exports = mongoose.model('User', userSchema);