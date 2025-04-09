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

    // Fetch booking history
    fetchBookingHistory();

    // Initialize rating stars
    initializeRatingStars();
});

async function fetchBookingHistory() {
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
            displayBookingHistory(bookings);
        } else {
            alert('Failed to fetch booking history');
        }
    } catch (error) {
        console.error('Fetch booking history error:', error);
        alert('An error occurred. Please try again.');
    }
}

function displayBookingHistory(bookings) {
    const tableBody = document.getElementById('bookingHistoryTable');
    tableBody.innerHTML = '';

    bookings.forEach(booking => {
        if (booking.status === 'completed' || booking.status === 'cancelled') {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${booking._id}</td>
                <td>${booking.pickupLocation}</td>
                <td>${booking.dropoffLocation}</td>
                <td>${new Date(booking.pickupTime).toLocaleString()}</td>
                <td>${booking.completedAt ? new Date(booking.completedAt).toLocaleString() : 'N/A'}</td>
                <td><span class="badge ${getStatusBadgeClass(booking.status)}">${booking.status}</span></td>
                <td>${booking.driverId ? booking.driverId.name : 'N/A'}</td>
                <td>${booking.rating ? getRatingStars(booking.rating) : 'Not rated'}</td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="viewBookingDetails('${booking._id}')">View</button>
                    ${booking.status === 'completed' && !booking.rating ? `
                        <button class="btn btn-sm btn-warning" onclick="openRatingModal('${booking._id}')">Rate</button>
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

        const data = await response.json();

        if (response.ok) {
            alert('Rating submitted successfully');
            bootstrap.Modal.getInstance(document.getElementById('ratingModal')).hide();
            fetchBookingHistory();
        } else {
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