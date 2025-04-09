const mongoose = require('mongoose');

// Create a case-insensitive index on the name field
const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: [30, 'Room name cannot be longer than 30 characters'],
    trim: true,
    index: {
      unique: true,
      collation: { locale: 'en', strength: 2 }
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  owner: {
    type: String,
    required: true
  },
  customization: {
    backgroundUrl: {
      type: String,
      default: ''
    },
    cursorUrl: {
      type: String,
      default: ''
    },
    chatBackgroundUrl: {
      type: String,
      default: ''
    }
  }
});

module.exports = mongoose.model('Room', roomSchema, 'rooms'); 