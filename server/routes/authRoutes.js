const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authcontroller');

// --- DEBUGGING LINE ---
// This middleware will run for every request that hits this router
router.use((req, res, next) => {
    console.log('Request received by authRoutes.js');
    next(); // Pass the request to the next handler
});

// Define the routes and link them to the controller functions
router.post('/register', registerUser);
router.post('/login', loginUser);

module.exports = router;
