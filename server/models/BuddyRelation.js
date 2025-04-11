const mongoose = require('mongoose');

const buddyRelationSchema = new mongoose.Schema({
  user1: { type: String, required: true },
  user2: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'accepted'],
    required: true
  },
  requestedBy: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

// Compound index to ensure unique pairs and faster queries
buddyRelationSchema.index({ user1: 1, user2: 1 }, { unique: true });

module.exports = mongoose.model('BuddyRelation', buddyRelationSchema); 