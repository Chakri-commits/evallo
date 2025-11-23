const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { register, login, logout } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);

router.post('/logout', authMiddleware, logout);

module.exports = router;
