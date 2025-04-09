const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const auth = require('./auth');
const protect = auth.protect;

// Create a new booking
router.post('/', protect, async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ message: 'Only students can create bookings' });
        }

        console.log('Creating booking with data:', req.body);
        
        const booking = await Booking.create({
            ...req.body,
            studentId: req.user._id
        });

        console.log('Booking created successfully:', booking);
        res.status(201).json(booking);
    } catch (error) {
        console.error('Create booking error:', error);
        
        // Provide more specific error messages
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                message: 'Validation error', 
                error: error.message 
            });
        }
        
        res.status(500).json({ 
            message: 'Failed to create booking',
            error: error.message
        });
    }
});

// Get all active bookings for a driver
router.get('/driver/:driverId/active', protect, async (req, res) => {
    try {
        if (req.user.role !== 'driver') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const bookings = await Booking.find({
            $or: [
                { driverId: req.params.driverId, status: 'in-progress' },
                { driverId: null, status: 'pending' }
            ]
        }).populate('studentId', 'name');

        res.json(bookings);
    } catch (error) {
        console.error('Get driver bookings error:', error);
        res.status(500).json({ message: 'Failed to get bookings' });
    }
});

// Get active bookings count for a driver
router.get('/driver/:driverId/active/count', protect, async (req, res) => {
    try {
        if (req.user.role !== 'driver') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const count = await Booking.countDocuments({
            $or: [
                { driverId: req.params.driverId, status: 'in-progress' },
                { driverId: null, status: 'pending' }
            ]
        });

        res.json(count);
    } catch (error) {
        console.error('Get driver bookings count error:', error);
        res.status(500).json({ message: 'Failed to get bookings count' });
    }
});

// Get completed bookings count for today
router.get('/driver/:driverId/completed/today/count', protect, async (req, res) => {
    try {
        if (req.user.role !== 'driver') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const count = await Booking.countDocuments({
            driverId: req.params.driverId,
            status: 'completed',
            completedAt: { $gte: today }
        });

        res.json(count);
    } catch (error) {
        console.error('Get completed bookings count error:', error);
        res.status(500).json({ message: 'Failed to get completed bookings count' });
    }
});

// Get student's bookings
router.get('/student/:studentId', protect, async (req, res) => {
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

// Accept a booking
router.post('/:bookingId/accept', protect, async (req, res) => {
    try {
        if (req.user.role !== 'driver') {
            return res.status(403).json({ message: 'Only drivers can accept bookings' });
        }

        const booking = await Booking.findById(req.params.bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.status !== 'pending') {
            return res.status(400).json({ message: 'Booking cannot be accepted' });
        }

        booking.driverId = req.user._id;
        booking.status = 'in-progress';
        await booking.save();

        res.json(booking);
    } catch (error) {
        console.error('Accept booking error:', error);
        res.status(500).json({ message: 'Failed to accept booking' });
    }
});

// Complete a booking
router.post('/:bookingId/complete', protect, async (req, res) => {
    try {
        if (req.user.role !== 'driver') {
            return res.status(403).json({ message: 'Only drivers can complete bookings' });
        }

        const booking = await Booking.findById(req.params.bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.status !== 'in-progress' || booking.driverId.toString() !== req.user._id.toString()) {
            return res.status(400).json({ message: 'Booking cannot be completed' });
        }

        booking.status = 'completed';
        booking.completedAt = new Date();
        await booking.save();

        res.json(booking);
    } catch (error) {
        console.error('Complete booking error:', error);
        res.status(500).json({ message: 'Failed to complete booking' });
    }
});

// Rate a booking
router.post('/:bookingId/rate', protect, async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ message: 'Only students can rate bookings' });
        }

        const { rating, feedback } = req.body;
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Invalid rating' });
        }

        const booking = await Booking.findById(req.params.bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.studentId.toString() !== req.user._id.toString() || booking.status !== 'completed') {
            return res.status(400).json({ message: 'Cannot rate this booking' });
        }

        booking.rating = rating;
        booking.feedback = feedback;
        await booking.save();

        res.json(booking);
    } catch (error) {
        console.error('Rate booking error:', error);
        res.status(500).json({ message: 'Failed to rate booking' });
    }
});

module.exports = router; 