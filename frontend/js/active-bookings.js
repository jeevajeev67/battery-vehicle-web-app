document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '../login.html';
        return;
    }

    // Display user name
    const userName = localStorage.getItem('userName');
    document.getElementById('userName').textContent = userName;

    // Fetch active bookings
    fetchActiveBookings();
});

async function fetchActiveBookings() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    try {
        const response = await fetch(`http://localhost:3001/api/bookings/student/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const bookings = await response.json();

        if (response.ok) {
            displayActiveBookings(bookings);
        } else {
            alert('Failed to fetch active bookings');
        }
    } catch (error) {
        console.error('Fetch active bookings error:', error);
        alert('An error occurred. Please try again.');
    }
}

function displayActiveBookings(bookings) {
    const tableBody = document.getElementById('activeBookingsTable');
    tableBody.innerHTML = '';

    bookings.forEach(booking => {
        if (booking.status === 'pending' || booking.status === 'in-progress') {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${booking._id}</td>
                <td>${booking.pickupLocation}</td>
                <td>${booking.dropoffLocation}</td>
                <td>${new Date(booking.pickupTime).toLocaleString()}</td>
                <td><span class="badge ${getStatusBadgeClass(booking.status)}">${booking.status}</span></td>
                <td>${booking.driverId ? booking.driverId.name : 'Not assigned'}</td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="viewBookingDetails('${booking._id}')">View</button>
                    ${booking.status === 'pending' ? `
                        <button class="btn btn-sm btn-danger" onclick="cancelBooking('${booking._id}')">Cancel</button>
                    ` : ''}
                </td>
            `;
            tableBody.appendChild(row);
        }
    });
}

function getStatusBadgeClass(status) {
    switch (status) {
        case 'pending':
            return 'bg-warning';
        case 'in-progress':
            return 'bg-primary';
        case 'completed':
            return 'bg-success';
        case 'cancelled':
            return 'bg-danger';
        default:
            return 'bg-secondary';
    }
}

async function cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) {
        return;
    }

    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`http://localhost:3001/api/bookings/${bookingId}/cancel`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            alert('Booking cancelled successfully');
            fetchActiveBookings();
        } else {
            alert(data.message || 'Failed to cancel booking');
        }
    } catch (error) {
        console.error('Cancel booking error:', error);
        alert('An error occurred. Please try again.');
    }
}

function viewBookingDetails(bookingId) {
    // Implement booking details view functionality
    alert('Booking details view will be implemented soon');
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    window.location.href = '../login.html';
} 