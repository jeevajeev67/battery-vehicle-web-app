const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Booking = require('../models/Booking');
const { protect } = require('./auth');

// Get driver's profile
router.get('/:driverId', protect, async (req, res) => {
    try {
        const driver = await User.findOne({
            _id: req.params.driverId,
            role: 'driver'
        }).select('-password');

        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }

        res.json(driver);
    } catch (error) {
        console.error('Get driver error:', error);
        res.status(500).json({ message: 'Failed to get driver information' });
    }
});

// Get driver's rating
router.get('/:driverId/rating', protect, async (req, res) => {
    try {
        const driver = await User.findOne({
            _id: req.params.driverId,
            role: 'driver'
        }).select('rating');

        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }

        res.json(driver.rating);
    } catch (error) {
        console.error('Get driver rating error:', error);
        res.status(500).json({ message: 'Failed to get driver rating' });
    }
});

// Get driver's completed bookings
router.get('/:driverId/bookings/completed', protect, async (req, res) => {
    try {
        if (req.user.role !== 'driver' || req.user._id.toString() !== req.params.driverId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const bookings = await Booking.find({
            driverId: req.params.driverId,
            status: 'completed'
        })
        .populate('studentId', 'name')
        .sort('-completedAt');

        res.json(bookings);
    } catch (error) {
        console.error('Get completed bookings error:', error);
        res.status(500).json({ message: 'Failed to get completed bookings' });
    }
});

// Update driver's profile
router.patch('/:driverId', protect, async (req, res) => {
    try {
        if (req.user.role !== 'driver' || req.user._id.toString() !== req.params.driverId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const allowedUpdates = ['name', 'email'];
        const updates = Object.keys(req.body);
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).json({ message: 'Invalid updates' });
        }

        const driver = await User.findById(req.params.driverId);
        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }

        updates.forEach(update => driver[update] = req.body[update]);
        await driver.save();

        res.json(driver);
    } catch (error) {
        console.error('Update driver error:', error);
        res.status(500).json({ message: 'Failed to update driver information' });
    }
});

// Get driver's statistics
router.get('/:driverId/stats', protect, async (req, res) => {
    try {
        if (req.user.role !== 'driver' || req.user._id.toString() !== req.params.driverId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [totalBookings, completedToday, averageRating] = await Promise.all([
            Booking.countDocuments({ driverId: req.params.driverId, status: 'completed' }),
            Booking.countDocuments({
                driverId: req.params.driverId,
                status: 'completed',
                completedAt: { $gte: today }
            }),
            Booking.aggregate([
                {
                    $match: {
                        driverId: req.params.driverId,
                        status: 'completed',
                        rating: { $exists: true }
                    }
                },
                {
                    $group: {
                        _id: null,
                        averageRating: { $avg: '$rating' }
                    }
                }
            ])
        ]);

        res.json({
            totalBookings,
            completedToday,
            averageRating: averageRating[0]?.averageRating || 0
        });
    } catch (error) {
        console.error('Get driver stats error:', error);
        res.status(500).json({ message: 'Failed to get driver statistics' });
    }
});

module.exports = router; 