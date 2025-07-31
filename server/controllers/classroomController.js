const Classroom = require('../models/classroom');

exports.createClassroom = async (req, res) => {
  try {
    const { roomNumber, capacity } = req.body;
    const classroom = new Classroom({ roomNumber, capacity });
    const createdClassroom = await classroom.save();
    res.status(201).json(createdClassroom);
  } catch (error) {
    res.status(400).json({ message: 'Error creating classroom', error: error.message });
  }
};

exports.getClassrooms = async (req, res) => {
  try {
    const classrooms = await Classroom.find({});
    res.json(classrooms);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching classrooms', error: error.message });
  }
};

// @desc    Delete a classroom
// @route   DELETE /api/classrooms/:id
// @access  Private/Admin
exports.deleteClassroom = async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id);
    if (classroom) {
      await classroom.deleteOne();
      res.json({ message: 'Classroom removed' });
    } else {
      res.status(404).json({ message: 'Classroom not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};