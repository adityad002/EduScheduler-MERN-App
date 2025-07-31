const mongoose = require('mongoose');

const scheduleEntrySchema = new mongoose.Schema({
  day: { type: String, required: true },
  timeSlot: { type: String, required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
  classroom: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true },
}, { _id: false });

const timetableSchema = new mongoose.Schema({
  sessionName: { // 👈 Now the unique key
    type: String,
    required: true,
    unique: true,
  },
  schedule: [scheduleEntrySchema],
}, { timestamps: true });

module.exports = mongoose.models.Timetable || mongoose.model('Timetable', timetableSchema);
