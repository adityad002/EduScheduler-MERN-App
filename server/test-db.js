const mongoose = require('mongoose');
const dotenv = require('dotenv');

// 1. Load environment variables
dotenv.config();

// 2. Log the URI to be 100% sure it's loaded
const MONGO_URI = process.env.MONGO_URI;
console.log('--- DATABASE CONNECTION TEST ---');
console.log('Attempting to connect with URI:', MONGO_URI);

// 3. Check if the URI was actually loaded
if (!MONGO_URI) {
    console.error('❌ MONGO_URI not found. Please check your .env file.');
    process.exit(1);
}

// 4. Attempt to connect
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅✅✅ SUCCESS: The connection from Node.js is working!');
    // Close the connection after successful test
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('❌❌❌ FAILED: The connection from Node.js failed.');
    console.error(err);
    process.exit(1);
  });