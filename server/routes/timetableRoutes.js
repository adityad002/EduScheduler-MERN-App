const express = require('express');
const router = express.Router();
const { generateTimetable, getTimetable, getLatestTimetable } = require('../controllers/timetableController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/generate', protect, admin, generateTimetable);
router.get('/latest', protect, getLatestTimetable);
router.get('/:sessionName', protect, getTimetable); // Updated parameter

module.exports = router;
