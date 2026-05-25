// Purpose: The "Traffic Controller"—it maps web addresses (URLs) to the correct function in the controller.
const express = require('express');
const router = express.Router();
const complaintCtrl = require('../controllers/G46_complaintCtrl');

// Match these to the functions we wrote in the controller
router.get('/', complaintCtrl.getComplaints);
router.post('/', complaintCtrl.createComplaint);

// Export the router
module.exports = router;