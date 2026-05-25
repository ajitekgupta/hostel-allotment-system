const G44_Allotment = require('../models/G44_Allotment');

const AC_BLOCKS   = ['BH4', 'BH5'];
const GIRLS_BLOCK = 'GH1';
const FLOORS      = ['A', 'B', 'C', 'D', 'E'];

function generateRoomNumber(block) {
    const floor   = FLOORS[Math.floor(Math.random() * FLOORS.length)];
    const roomNum = Math.floor(100 + Math.random() * 300);
    return `${block}-${floor}${roomNum}`;
}

const getAllotments = async (req, res) => {
    try {
        const allotments = await G44_Allotment.find();
        res.status(200).json(allotments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching allotments', error: error.message });
    }
};

const assignRoom = async (req, res) => {
    try {
        const { studentId, gender, roomNumber, block, roomType, acType, academicYear } = req.body;
        const sId = studentId.toUpperCase();

        if (block === GIRLS_BLOCK && gender !== 'Female') {
            return res.status(400).json({ message: 'Error: GH1 is a girls-only hostel. Only female students can be allotted to GH1.' });
        }

        if (AC_BLOCKS.includes(block) && acType !== 'AC') {
            return res.status(400).json({ message: `Error: ${block} is an AC-only block. AC preference is required.` });
        }

        let finalRoomNumber;

        if (roomNumber && roomNumber.trim() !== '') {
            finalRoomNumber = roomNumber.trim();
        } else {
            if (roomType === 'Double') {
                const existingInBlock = await G44_Allotment.find({ block, roomType, acType, status: 'Allotted' });
                const roomCounts = {};
                existingInBlock.forEach(a => {
                    roomCounts[a.roomNumber] = (roomCounts[a.roomNumber] || 0) + 1;
                });
                const partialRoom = Object.keys(roomCounts).find(r => roomCounts[r] === 1);
                finalRoomNumber = partialRoom || generateRoomNumber(block);
            } else {
                finalRoomNumber = generateRoomNumber(block);
            }
        }

        const newAllotment = new G44_Allotment({
            studentId: sId,
            roomNumber: finalRoomNumber,
            block,
            roomType,
            acType,
            academicYear
        });
        const saved = await newAllotment.save();

        const mode = (roomNumber && roomNumber.trim() !== '') ? 'Manual' : 'Auto';
        res.status(201).json({
            message: `Room ${finalRoomNumber} allotted successfully! (${mode} Allotment)`,
            data: saved
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Error: This student already has a room. Use Transfer to change rooms.' });
        }
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

const transferRoom = async (req, res) => {
    try {
        const { studentId, gender, newRoomNumber, block, roomType, acType } = req.body;
        const sId = studentId.toUpperCase();

        const existing = await G44_Allotment.findOne({ studentId: sId });
        if (!existing) {
            return res.status(404).json({ message: 'Error: No allotment found for this Student ID.' });
        }

        if (existing.roomNumber === newRoomNumber.trim()) {
            return res.status(400).json({ message: 'Error: Student is already in this room.' });
        }

        if (block === GIRLS_BLOCK && gender !== 'Female') {
            return res.status(400).json({ message: 'Error: GH1 is a girls-only hostel. Only female students can be transferred to GH1.' });
        }

        if (AC_BLOCKS.includes(block) && acType !== 'AC') {
            return res.status(400).json({ message: `Error: ${block} is an AC-only block. AC preference is required.` });
        }

        const updated = await G44_Allotment.findOneAndUpdate(
            { studentId: sId },
            {
                roomNumber: newRoomNumber.trim(),
                block:    block    || existing.block,
                roomType: roomType || existing.roomType,
                acType:   acType   || existing.acType,
                status: 'Allotted',
                allotmentDate: Date.now()
            },
            { new: true }
        );

        res.status(200).json({
            message: `Transfer successful. ${sId} moved to Room ${newRoomNumber.trim()} in ${block || existing.block}.`,
            data: updated
        });

    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

const vacateRoom = async (req, res) => {
    try {
        const { studentId } = req.body;
        const sId = studentId.toUpperCase();

        const allotment = await G44_Allotment.findOne({ studentId: sId });
        if (!allotment) {
            return res.status(404).json({ message: 'Error: No allotment found for this Student ID.' });
        }

        await G44_Allotment.findOneAndUpdate({ studentId: sId }, { status: 'Vacated' });
        res.status(200).json({ message: `Room vacated successfully for student ${sId}.` });

    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

module.exports = { getAllotments, assignRoom, transferRoom, vacateRoom };