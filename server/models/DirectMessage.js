const mongoose = require('mongoose');

const directMessageSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  content: { type: String, required: true },
  textColor: { type: String, default: '#000000' },
  formatting: {
    bold: { type: Boolean, default: false },
    italic: { type: Boolean, default: false },
    underline: { type: Boolean, default: false }
  },
  createdAt: { type: Date, default: Date.now }
});

// Index for faster queries when loading chat history
directMessageSchema.index({ from: 1, to: 1, createdAt: -1 });
directMessageSchema.index({ to: 1, from: 1, createdAt: -1 });

module.exports = mongoose.model('DirectMessage', directMessageSchema); 