const Course = require('../models/Course');
const Faculty = require('../models/Faculty');
const Classroom = require('../models/Classroom');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private/Admin
exports.getStats = async (req, res) => {
  try {
    const courseCount = await Course.countDocuments();
    const facultyCount = await Faculty.countDocuments();
    const classroomCount = await Classroom.countDocuments();

    res.json({
      courses: courseCount,
      faculty: facultyCount,
      classrooms: classroomCount,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
