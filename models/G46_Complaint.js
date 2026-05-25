// Purpose: Defines the database schema (data structure) for this module.const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    studentId: { type: String, required: true }, // Shared unique key
    issueType: { type: String, required: true },
    description: { type: String, required: true },
    complaintStatus: { type: String, enum: ['Pending', 'In Progress', 'Resolved'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('G46_Complaint', complaintSchema);