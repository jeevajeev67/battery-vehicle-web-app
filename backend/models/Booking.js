const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Booking must belong to a student']
    },
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    pickupLocation: {
        type: String,
        required: [true, 'Please specify pickup location'],
        enum: {
            values: ['library', 'cafeteria', 'academic_block', 'hostel', 'sports_complex', 'parking_lot'],
            message: 'Invalid pickup location. Must be one of: library, cafeteria, academic_block, hostel, sports_complex, parking_lot'
        }
    },
    dropoffLocation: {
        type: String,
        required: [true, 'Please specify drop-off location'],
        enum: {
            values: ['library', 'cafeteria', 'academic_block', 'hostel', 'sports_complex', 'parking_lot'],
            message: 'Invalid dropoff location. Must be one of: library, cafeteria, academic_block, hostel, sports_complex, parking_lot'
        }
    },
    date: {
        type: Date,
        required: [true, 'Please specify booking date']
    },
    time: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed', 'cancelled'],
        default: 'pending'
    },
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot be longer than 500 characters']
    },
    rating: {
        type: Number,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot be more than 5'],
        default: null
    },
    feedback: {
        type: String,
        maxlength: [500, 'Feedback cannot be longer than 500 characters']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date,
        default: null
    }
});

// Prevent booking same location for pickup and drop-off
bookingSchema.pre('save', function(next) {
    if (this.pickupLocation === this.dropoffLocation) {
        return next(new Error('Pickup and drop-off locations cannot be the same'));
    }
    next();
});

// Update driver's rating when booking is rated
bookingSchema.post('save', async function() {
    if (this.rating && this.driverId) {
        const User = require('./User');
        const driver = await User.findById(this.driverId);
        
        // Get all completed and rated bookings for this driver
        const Booking = mongoose.model('Booking');
        const ratedBookings = await Booking.find({
            driverId: this.driverId,
            status: 'completed',
            rating: { $exists: true, $ne: null }
        });
        
        // Calculate average rating
        const totalRating = ratedBookings.reduce((sum, booking) => sum + booking.rating, 0);
        const averageRating = totalRating / ratedBookings.length;
        
        // Update driver's rating
        await User.findByIdAndUpdate(this.driverId, { rating: averageRating });
    }
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking; 