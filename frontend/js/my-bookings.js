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

    // Fetch bookings
    fetchBookings();

    // Initialize rating stars
    initializeRatingStars();
});

async function fetchBookings() {
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
            displayBookings(bookings);
        } else {
            alert('Failed to fetch bookings');
        }
    } catch (error) {
        console.error('Fetch bookings error:', error);
        alert('An error occurred. Please try again.');
    }
}

function displayBookings(bookings) {
    const activeBookingsTable = document.getElementById('activeBookingsTable');
    const completedBookingsTable = document.getElementById('completedBookingsTable');
    
    activeBookingsTable.innerHTML = '';
    completedBookingsTable.innerHTML = '';

    bookings.forEach(booking => {
        const row = document.createElement('tr');
        const isActive = booking.status === 'pending' || booking.status === 'in-progress';
        
        row.innerHTML = `
            <td>${booking._id}</td>
            <td>${booking.pickupLocation}</td>
            <td>${booking.dropoffLocation}</td>
            <td>${new Date(booking.pickupTime).toLocaleString()}</td>
            ${isActive ? '' : `<td>${booking.completedAt ? new Date(booking.completedAt).toLocaleString() : 'N/A'}</td>`}
            <td><span class="badge ${getStatusBadgeClass(booking.status)}">${booking.status}</span></td>
            <td>${booking.driverId ? booking.driverId.name : 'Not assigned'}</td>
            ${isActive ? '' : `<td>${booking.rating ? getRatingStars(booking.rating) : 'Not rated'}</td>`}
            <td>
                <button class="btn btn-sm btn-info" onclick="viewBookingDetails('${booking._id}')">View</button>
                ${isActive ? `
                    <button class="btn btn-sm btn-danger" onclick="cancelBooking('${booking._id}')">Cancel</button>
                ` : booking.status === 'completed' && !booking.rating ? `
                    <button class="btn btn-sm btn-warning" onclick="openRatingModal('${booking._id}')">Rate</button>
                ` : ''}
            </td>
        `;

        if (isActive) {
            activeBookingsTable.appendChild(row);
        } else {
            completedBookingsTable.appendChild(row);
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

function getRatingStars(rating) {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
}

function initializeRatingStars() {
    const stars = document.querySelectorAll('.rating i');
    stars.forEach(star => {
        star.addEventListener('mouseover', function() {
            const rating = this.dataset.rating;
            stars.forEach(s => {
                s.classList.remove('text-warning');
                if (s.dataset.rating <= rating) {
                    s.classList.add('text-warning');
                }
            });
        });

        star.addEventListener('click', function() {
            const rating = this.dataset.rating;
            document.getElementById('ratingValue').value = rating;
            stars.forEach(s => {
                s.classList.remove('text-warning');
                if (s.dataset.rating <= rating) {
                    s.classList.add('text-warning');
                }
            });
        });
    });
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

        if (response.ok) {
            alert('Booking cancelled successfully');
            fetchBookings();
        } else {
            const data = await response.json();
            alert(data.message || 'Failed to cancel booking');
        }
    } catch (error) {
        console.error('Cancel booking error:', error);
        alert('An error occurred. Please try again.');
    }
}

function openRatingModal(bookingId) {
    document.getElementById('bookingIdForRating').value = bookingId;
    document.getElementById('ratingValue').value = '';
    document.getElementById('feedback').value = '';
    const modal = new bootstrap.Modal(document.getElementById('ratingModal'));
    modal.show();
}

async function submitRating() {
    const bookingId = document.getElementById('bookingIdForRating').value;
    const rating = document.getElementById('ratingValue').value;
    const feedback = document.getElementById('feedback').value;
    const token = localStorage.getItem('token');

    if (!rating) {
        alert('Please select a rating');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3001/api/bookings/${bookingId}/rate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ rating, feedback })
        });

        if (response.ok) {
            alert('Rating submitted successfully');
            bootstrap.Modal.getInstance(document.getElementById('ratingModal')).hide();
            fetchBookings();
        } else {
            const data = await response.json();
            alert(data.message || 'Failed to submit rating');
        }
    } catch (error) {
        console.error('Submit rating error:', error);
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