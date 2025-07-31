const Faculty = require('../models/faculty');

exports.createFaculty = async (req, res) => {
  try {
    const { name, department } = req.body;
    const faculty = new Faculty({ name, department });
    const createdFaculty = await faculty.save();
    res.status(201).json(createdFaculty);
  } catch (error) {
    res.status(400).json({ message: 'Error creating faculty', error: error.message });
  }
};

exports.getFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.find({});
    res.json(faculty);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching faculty', error: error.message });
  }
};

// @desc    Delete a faculty member
// @route   DELETE /api/faculty/:id
// @access  Private/Admin
exports.deleteFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (faculty) {
      await faculty.deleteOne();
      res.json({ message: 'Faculty member removed' });
    } else {
      res.status(404).json({ message: 'Faculty member not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};