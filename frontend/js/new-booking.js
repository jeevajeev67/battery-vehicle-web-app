document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (!token || userRole !== 'student') {
        window.location.href = '../login.html';
        return;
    }

    // Display user name
    const userName = localStorage.getItem('userName');
    document.getElementById('userName').textContent = userName || 'Student';

    // Set minimum date to today
    const dateInput = document.getElementById('date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;

    // Set minimum time to current time if date is today
    const timeInput = document.getElementById('time');
    dateInput.addEventListener('change', function() {
        if (this.value === today) {
            const now = new Date();
            const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            timeInput.min = currentTime;
        } else {
            timeInput.min = '';
        }
    });

    // Handle form submission
    const newBookingForm = document.getElementById('newBookingForm');
    newBookingForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Get form values
        const pickupLocation = document.getElementById('pickupLocation').value;
        const dropoffLocation = document.getElementById('dropoffLocation').value;
        const date = document.getElementById('date').value;
        const time = document.getElementById('time').value;
        const notes = document.getElementById('notes').value;

        // Validate locations
        if (!pickupLocation || !dropoffLocation) {
            alert('Please select both pickup and dropoff locations');
            return;
        }

        if (pickupLocation === dropoffLocation) {
            alert('Pickup and dropoff locations cannot be the same');
            return;
        }

        // Validate date and time
        if (!date || !time) {
            alert('Please select both date and time');
            return;
        }

        // Create booking datetime
        const bookingDateTime = new Date(`${date}T${time}`);
        const now = new Date();
        
        if (bookingDateTime < now) {
            alert('Booking time must be in the future');
            return;
        }

        // Format date for backend (convert to ISO string)
        const formattedDate = new Date(date).toISOString();

        // Create booking data
        const bookingData = {
            pickupLocation,
            dropoffLocation,
            date: formattedDate,
            time,
            notes: notes || ''
        };

        try {
            console.log('Sending booking data:', bookingData);
            
            const response = await fetch('http://localhost:3001/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(bookingData)
            });

            const data = await response.json();
            console.log('Booking response:', data);

            if (response.ok) {
                alert('Booking created successfully!');
                window.location.href = 'active-bookings.html';
            } else {
                const errorMessage = data.message || data.error || 'Failed to create booking';
                alert(`Error: ${errorMessage}`);
                console.error('Booking error details:', data);
            }
        } catch (error) {
            console.error('Create booking error:', error);
            alert('An error occurred while creating the booking. Please try again.');
        }
    });
});

function logout() {
    localStorage.clear();
    window.location.href = '../login.html';
} 