document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in and is a student
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (!token || userRole !== 'student') {
        window.location.href = '../login.html';
        return;
    }

    // Get student name
    const studentName = localStorage.getItem('studentName') || 'Student';
    document.getElementById('studentName').textContent = studentName;

    // Handle logout
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        localStorage.removeItem('studentName');
        window.location.href = '../login.html';
    });

    // Fetch recent bookings
    fetchRecentBookings();
});

async function fetchRecentBookings() {
    try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');

        const response = await fetch(`http://localhost:3001/api/bookings/student/${userId}/recent`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch bookings');
        }

        const bookings = await response.json();
        displayBookings(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        // Show error message to user
        const tbody = document.getElementById('recentBookings');
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Failed to load bookings. Please try again later.</td></tr>';
    }
}

function displayBookings(bookings) {
    const tbody = document.getElementById('recentBookings');
    
    if (bookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No recent bookings found.</td></tr>';
        return;
    }

    tbody.innerHTML = bookings.map(booking => `
        <tr>
            <td>${new Date(booking.date).toLocaleDateString()}</td>
            <td>${booking.pickupLocation}</td>
            <td>${booking.dropoffLocation}</td>
            <td>
                <span class="badge badge-${getStatusBadgeClass(booking.status)}">
                    ${booking.status}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="viewBookingDetails('${booking._id}')">
                    View Details
                </button>
            </td>
        </tr>
    `).join('');
}

function getStatusBadgeClass(status) {
    switch (status.toLowerCase()) {
        case 'pending':
            return 'pending';
        case 'in-progress':
            return 'in-progress';
        case 'completed':
            return 'completed';
        default:
            return 'secondary';
    }
}

function viewBookingDetails(bookingId) {
    // TODO: Implement booking details view
    window.location.href = `booking-details.html?id=${bookingId}`;
} 