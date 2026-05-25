const G43_Room = require('../models/G43_Room');

// Get all rooms
exports.getAllRooms = async (req, res) => {
    try {
        const rooms = await G43_Room.find();
        res.status(200).json(rooms);
    } catch (err) {
        res.status(500).json({ message: "Error fetching rooms", error: err.message });
    }
};

// Create a new room
exports.createRoom = async (req, res) => {
    try {
        const { roomNumber, roomType, baseRent } = req.body;
        const newRoom = new G43_Room({ roomNumber, roomType, baseRent });
        await newRoom.save();
        res.status(201).json({ message: "Room added successfully", room: newRoom });
    } catch (err) {
        res.status(500).json({ message: "Error creating room", error: err.message });
    }
};