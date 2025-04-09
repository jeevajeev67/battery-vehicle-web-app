const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Booking = require('../models/Booking');
const { protect } = require('./auth');

// Get student's profile
router.get('/:studentId', protect, async (req, res) => {
    try {
        const student = await User.findOne({
            _id: req.params.studentId,
            role: 'student'
        }).select('-password');

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.json(student);
    } catch (error) {
        console.error('Get student error:', error);
        res.status(500).json({ message: 'Failed to get student information' });
    }
});

// Get student's booking history
router.get('/:studentId/bookings', protect, async (req, res) => {
    try {
        if (req.user.role !== 'student' || req.user._id.toString() !== req.params.studentId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const bookings = await Booking.find({ studentId: req.params.studentId })
            .populate('driverId', 'name rating')
            .sort('-createdAt');

        res.json(bookings);
    } catch (error) {
        console.error('Get student bookings error:', error);
        res.status(500).json({ message: 'Failed to get bookings' });
    }
});

// Get student's active bookings
router.get('/:studentId/bookings/active', protect, async (req, res) => {
    try {
        if (req.user.role !== 'student' || req.user._id.toString() !== req.params.studentId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const bookings = await Booking.find({
            studentId: req.params.studentId,
            status: { $in: ['pending', 'in-progress'] }
        })
        .populate('driverId', 'name rating')
        .sort('-createdAt');

        res.json(bookings);
    } catch (error) {
        console.error('Get active bookings error:', error);
        res.status(500).json({ message: 'Failed to get active bookings' });
    }
});

// Update student's profile
router.patch('/:studentId', protect, async (req, res) => {
    try {
        if (req.user.role !== 'student' || req.user._id.toString() !== req.params.studentId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const allowedUpdates = ['name', 'email'];
        const updates = Object.keys(req.body);
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).json({ message: 'Invalid updates' });
        }

        const student = await User.findById(req.params.studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        updates.forEach(update => student[update] = req.body[update]);
        await student.save();

        res.json(student);
    } catch (error) {
        console.error('Update student error:', error);
        res.status(500).json({ message: 'Failed to update student information' });
    }
});

// Cancel a booking
router.post('/:studentId/bookings/:bookingId/cancel', protect, async (req, res) => {
    try {
        if (req.user.role !== 'student' || req.user._id.toString() !== req.params.studentId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const booking = await Booking.findOne({
            _id: req.params.bookingId,
            studentId: req.params.studentId
        });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.status !== 'pending') {
            return res.status(400).json({ message: 'Only pending bookings can be cancelled' });
        }

        booking.status = 'cancelled';
        await booking.save();

        res.json(booking);
    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({ message: 'Failed to cancel booking' });
    }
});

// Get student's booking statistics
router.get('/:studentId/stats', protect, async (req, res) => {
    try {
        if (req.user.role !== 'student' || req.user._id.toString() !== req.params.studentId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const [totalBookings, activeBookings, completedBookings, cancelledBookings] = await Promise.all([
            Booking.countDocuments({ studentId: req.params.studentId }),
            Booking.countDocuments({
                studentId: req.params.studentId,
                status: { $in: ['pending', 'in-progress'] }
            }),
            Booking.countDocuments({
                studentId: req.params.studentId,
                status: 'completed'
            }),
            Booking.countDocuments({
                studentId: req.params.studentId,
                status: 'cancelled'
            })
        ]);

        res.json({
            totalBookings,
            activeBookings,
            completedBookings,
            cancelledBookings
        });
    } catch (error) {
        console.error('Get student stats error:', error);
        res.status(500).json({ message: 'Failed to get student statistics' });
    }
});

module.exports = router; 