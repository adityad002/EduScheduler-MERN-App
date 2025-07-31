const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  // We can use a fixed key to ensure only one settings document exists
  configKey: {
    type: String,
    default: "main",
    unique: true,
  },
  workingDays: {
    type: [String], // e.g., ["Monday", "Tuesday", ...]
    default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  },
  timeSlots: {
    type: [String], // e.g., ["9:00-10:00", "10:00-11:00", ...]
    default: ['9:00-10:00', '10:00-11:00', '11:00-12:00', '1:00-2:00', '2:00-3:00'],
  },
}, { timestamps: true });

module.exports = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);
