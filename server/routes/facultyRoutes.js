const express = require('express');
const router = express.Router();
const { createFaculty, getFaculty, deleteFaculty } = require('../controllers/facultyController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(protect, getFaculty).post(protect, admin, createFaculty);
router.route('/:id').delete(protect, admin, deleteFaculty); // 👈 ADD THIS LINE

module.exports = router;