const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
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

module.exports = mongoose.model('Room', roomSchema); 