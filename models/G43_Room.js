const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomNumber: { type: String, required: true, unique: true },
    roomType: { type: String, enum: ['Single', 'Double', 'Triple'], required: true },
    baseRent: { type: Number, required: true }, 
    status: { type: String, enum: ['Available', 'Occupied', 'Maintenance'], default: 'Available' }
}, { timestamps: true });

module.exports = mongoose.model('G43_Room', roomSchema);