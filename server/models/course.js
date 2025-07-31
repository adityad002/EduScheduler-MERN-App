const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseName: { type: String, required: true, trim: true },
  courseCode: { type: String, required: true, unique: true, trim: true },
  department: { type: String, required: true },
  semester: { type: Number, required: true, min: 1, max: 8 },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true,
  },
  section: {
    type: String,
    required: true,
    trim: true,
    default: 'A',
  },
  weeklyHours: {
    type: Number,
    required: true,
    min: 1,
  },
  isLab: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.models.Course || mongoose.model('Course', courseSchema);
