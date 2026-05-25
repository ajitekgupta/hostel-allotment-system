// Purpose: The "Traffic Controller"—it maps web addresses (URLs) to the correct function in the controller.
const express = require('express');
const router = express.Router();
const roomCtrl = require('../controllers/G43_roomCtrl');

// Match these to the functions we wrote in the controller
router.get('/', roomCtrl.getAllRooms);
router.post('/', roomCtrl.createRoom);

// THIS is the line your server is crashing trying to find
module.exports = router;