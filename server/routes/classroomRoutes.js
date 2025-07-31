const express = require('express');
const router = express.Router();
const { createClassroom, getClassrooms, deleteClassroom } = require('../controllers/classroomController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(protect, getClassrooms).post(protect, admin, createClassroom);
router.route('/:id').delete(protect, admin, deleteClassroom); // 👈 ADD THIS LINE

module.exports = router;