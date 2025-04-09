require('dotenv').config();
const mongoose = require('mongoose');
const Room = require('./models/Room');

async function rebuildIndexes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Drop existing indexes on the rooms collection
    console.log('Dropping existing indexes...');
    await Room.collection.dropIndexes();

    // Create new case-insensitive index
    console.log('Creating new case-insensitive index...');
    await Room.collection.createIndex(
      { name: 1 },
      { 
        unique: true,
        collation: { locale: 'en', strength: 2 }
      }
    );

    console.log('Indexes rebuilt successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error rebuilding indexes:', error);
    process.exit(1);
  }
}

rebuildIndexes(); 