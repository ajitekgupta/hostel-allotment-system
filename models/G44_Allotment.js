const mongoose = require('mongoose');

const allotmentSchema = new mongoose.Schema({
    studentId: {
        type: String,
        required: true,
        unique: true
    },
    roomNumber: {
        type: String,
        required: true
    },
    block: {
        type: String,
        required: true,
        enum: ['BH1', 'BH2', 'BH3', 'BH4', 'BH5', 'GH1']
    },
    roomType: {
        type: String,
        required: true,
        enum: ['Single', 'Double']
    },
    acType: {
        type: String,
        required: true,
        enum: ['AC', 'Non-AC']
    },
    academicYear: {
        type: String,
        required: true,
        enum: ['1st Year', '2nd Year', '3rd Year', '4th Year']
    },
    status: {
        type: String,
        enum: ['Allotted', 'Pending Transfer', 'Vacated'],
        default: 'Allotted'
    },
    allotmentDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('G44_Allotment', allotmentSchema);