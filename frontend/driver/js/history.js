document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in and is a driver
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (!token || userRole !== 'driver') {
        window.location.href = '../login.html';
        return;
    }

    // Handle logout
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        localStorage.removeItem('driverName');
        window.location.href = '../login.html';
    });

    // Handle refresh button
    document.getElementById('refreshBtn').addEventListener('click', function() {
        fetchBookingHistory();
    });

    // Initial data fetch
    fetchBookingHistory();
});

async function fetchBookingHistory() {
    try {
        const token = localStorage.getItem('token');
        const driverId = localStorage.getItem('userId');

        const response = await fetch(`http://localhost:3001/api/drivers/${driverId}/bookings/completed`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch booking history');
        }

        const bookings = await response.json();
        displayBookingHistory(bookings);
    } catch (error) {
        console.error('Error fetching booking history:', error);
        // Show error message to user
        const tbody = document.getElementById('historyTable');
        tbody.innerHTML = '<tr><td colspan="9" class="text-center">Failed to load booking history. Please try again later.</td></tr>';
    }
}

function displayBookingHistory(bookings) {
    const tbody = document.getElementById('historyTable');
    
    if (bookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="text-center">No booking history found.</td></tr>';
        return;
    }

    tbody.innerHTML = bookings.map(booking => `
        <tr>
            <td>${booking._id}</td>
            <td>${booking.studentId ? booking.studentId.name : 'Unknown'}</td>
            <td>${booking.pickupLocation}</td>
            <td>${booking.dropoffLocation}</td>
            <td>${new Date(booking.date).toLocaleDateString()}</td>
            <td>${booking.time || 'N/A'}</td>
            <td>${booking.completedAt ? new Date(booking.completedAt).toLocaleString() : 'N/A'}</td>
            <td>${getRatingStars(booking.rating)}</td>
            <td>${booking.feedback || 'No feedback'}</td>
        </tr>
    `).join('');
}

function getRatingStars(rating) {
    if (!rating) return 'Not rated';
    
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    let stars = '';
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star text-warning"></i>';
    }
    
    // Add half star if needed
    if (halfStar) {
        stars += '<i class="fas fa-star-half-alt text-warning"></i>';
    }
    
    // Add empty stars
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star text-warning"></i>';
    }
    
    return stars;
} 