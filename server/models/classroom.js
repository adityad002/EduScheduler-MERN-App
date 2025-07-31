const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, unique: true },
  capacity: { type: Number, required: true, min: 1 },
}, { timestamps: true });

module.exports = mongoose.models.Classroom || mongoose.model('Classroom', classroomSchema);
