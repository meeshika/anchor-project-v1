const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');

router.post('/', videoController.analyzeVideo);
router.get('/resultPage', videoController.getVideoLinks);
router.post('/requestCallBack', videoController.requestCallBack);

module.exports = router;
