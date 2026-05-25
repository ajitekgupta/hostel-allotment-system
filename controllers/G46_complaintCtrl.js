// Purpose: The "Brain" of the module—this is where you write the actual functions that handle, process, and save data.const G46_Complaint = require('../models/G46_Complaint');

exports.createComplaint = async (req, res) => {
    try {
        const { studentId, issueType, description } = req.body;
        const newComplaint = new G46_Complaint({ studentId: studentId.toUpperCase(), issueType, description });
        await newComplaint.save();
        res.status(201).json({ message: "Complaint logged successfully", data: newComplaint });
    } catch (err) {
        res.status(500).json({ message: "Error logging complaint", error: err.message });
    }
};

exports.getComplaints = async (req, res) => {
    try {
        const complaints = await G46_Complaint.find().sort({ createdAt: -1 });
        res.status(200).json(complaints);
    } catch (err) {
        res.status(500).json({ message: "Error fetching complaints", error: err.message });
    }
};