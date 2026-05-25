// Purpose: maps URLs to the correct controller functions.

const express = require('express');
const router = express.Router();

const allotmentController = require('../controllers/G44_allotmentCtrl');

// GET  - Fetch all allotments 
router.get('/allotments', allotmentController.getAllotments);

// POST - Assign a room 
router.post('/assign', allotmentController.assignRoom);

// PUT  - Transfer 
router.put('/transfer', allotmentController.transferRoom);

// PUT  - Vacate
router.put('/vacate', allotmentController.vacateRoom);

module.exports = router;