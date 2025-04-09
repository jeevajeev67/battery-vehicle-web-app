document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in and is a student
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (!token || userRole !== 'student') {
        window.location.href = '../login.html';
        return;
    }

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('bookingDate').min = today;

    // Handle logout
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        localStorage.removeItem('studentName');
        window.location.href = '../login.html';
    });

    // Handle form submission
    const bookingForm = document.getElementById('bookingForm');
    bookingForm.addEventListener('submit', handleBookingSubmit);

    // Prevent selecting same location for pickup and drop-off
    const pickupLocation = document.getElementById('pickupLocation');
    const dropoffLocation = document.getElementById('dropoffLocation');

    pickupLocation.addEventListener('change', function() {
        if (this.value === dropoffLocation.value) {
            alert('Pickup and drop-off locations cannot be the same');
            this.value = '';
        }
    });

    dropoffLocation.addEventListener('change', function() {
        if (this.value === pickupLocation.value) {
            alert('Pickup and drop-off locations cannot be the same');
            this.value = '';
        }
    });
});

async function handleBookingSubmit(e) {
    e.preventDefault();

    const pickupLocation = document.getElementById('pickupLocation').value;
    const dropoffLocation = document.getElementById('dropoffLocation').value;
    const bookingDate = document.getElementById('bookingDate').value;
    const bookingTime = document.getElementById('bookingTime').value;
    const notes = document.getElementById('notes').value;

    // Validate locations
    if (pickupLocation === dropoffLocation) {
        alert('Pickup and drop-off locations cannot be the same');
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');

        const bookingData = {
            studentId: userId,
            pickupLocation,
            dropoffLocation,
            date: bookingDate,
            time: bookingTime || null,
            notes: notes || null,
            status: 'pending'
        };

        const response = await fetch('http://localhost:3001/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(bookingData)
        });

        if (!response.ok) {
            throw new Error('Failed to create booking');
        }

        const result = await response.json();
        
        // Show success message
        alert('Booking created successfully!');
        
        // Redirect to bookings page
        window.location.href = 'bookings.html';
    } catch (error) {
        console.error('Error creating booking:', error);
        alert('Failed to create booking. Please try again later.');
    }
} 