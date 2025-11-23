const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { getLogs } = require('../controllers/logController');


router.use(authMiddleware);

router.get('/', getLogs);

module.exports = router;
