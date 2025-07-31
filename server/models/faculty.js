const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
  name: { type: String, required: true },
  department: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.models.Faculty || mongoose.model('Faculty', facultySchema);