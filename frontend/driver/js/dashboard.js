document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in and is a driver
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (!token || userRole !== 'driver') {
        window.location.href = '../login.html';
        return;
    }

    // Get driver name
    const driverName = localStorage.getItem('driverName') || 'Driver';
    document.getElementById('driverName').textContent = driverName;

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
        fetchDashboardData();
    });

    // Initial data fetch
    fetchDashboardData();

    // Set up polling for real-time updates
    setInterval(fetchDashboardData, 30000); // Poll every 30 seconds
});

async function fetchDashboardData() {
    try {
        const token = localStorage.getItem('token');
        const driverId = localStorage.getItem('userId');

        // Fetch active bookings count
        const activeResponse = await fetch(`http://localhost:3001/api/bookings/driver/${driverId}/active/count`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!activeResponse.ok) {
            throw new Error('Failed to fetch active bookings count');
        }

        const activeCount = await activeResponse.json();
        document.getElementById('activeBookingsCount').textContent = activeCount;

        // Fetch completed bookings count for today
        const completedResponse = await fetch(`http://localhost:3001/api/bookings/driver/${driverId}/completed/today/count`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!completedResponse.ok) {
            throw new Error('Failed to fetch completed bookings count');
        }

        const completedCount = await completedResponse.json();
        document.getElementById('completedTodayCount').textContent = completedCount;

        // Fetch driver rating
        const ratingResponse = await fetch(`http://localhost:3001/api/drivers/${driverId}/rating`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!ratingResponse.ok) {
            throw new Error('Failed to fetch driver rating');
        }

        const rating = await ratingResponse.json();
        document.getElementById('driverRating').textContent = rating.toFixed(1);

        // Fetch active bookings
        const bookingsResponse = await fetch(`http://localhost:3001/api/bookings/driver/${driverId}/active`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!bookingsResponse.ok) {
            throw new Error('Failed to fetch active bookings');
        }

        const bookings = await bookingsResponse.json();
        displayActiveBookings(bookings);
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Show error message to user
        const tbody = document.getElementById('activeBookings');
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Failed to load data. Please try again later.</td></tr>';
    }
}

function displayActiveBookings(bookings) {
    const tbody = document.getElementById('activeBookings');
    
    if (!bookings || bookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No active bookings found.</td></tr>';
        return;
    }

    tbody.innerHTML = bookings.map(booking => {
        // Format date and time
        const bookingDate = booking.date ? new Date(booking.date) : new Date();
        const formattedDate = bookingDate.toLocaleDateString();
        const formattedTime = booking.time || 'N/A';
        
        return `
            <tr>
                <td>${formattedDate} ${formattedTime}</td>
                <td>${booking.pickupLocation || 'N/A'}</td>
                <td>${booking.dropoffLocation || 'N/A'}</td>
                <td>
                    <span class="badge bg-${getStatusBadgeClass(booking.status)}">
                        ${booking.status || 'Unknown'}
                    </span>
                </td>
                <td>
                    ${getActionButtons(booking)}
                </td>
            </tr>
        `;
    }).join('');
}

function getStatusBadgeClass(status) {
    if (!status) return 'secondary';
    
    switch (status.toLowerCase()) {
        case 'pending':
            return 'warning';
        case 'in-progress':
            return 'primary';
        case 'completed':
            return 'success';
        case 'cancelled':
            return 'danger';
        default:
            return 'secondary';
    }
}

function getActionButtons(booking) {
    if (!booking || !booking.status) return '';
    
    switch (booking.status.toLowerCase()) {
        case 'pending':
            return `
                <button class="btn btn-sm btn-success" onclick="acceptBooking('${booking._id}')">
                    Accept
                </button>
            `;
        case 'in-progress':
            return `
                <button class="btn btn-sm btn-primary" onclick="completeBooking('${booking._id}')">
                    Complete
                </button>
            `;
        default:
            return '';
    }
}

async function acceptBooking(bookingId) {
    if (!bookingId) {
        alert('Invalid booking ID');
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3001/api/bookings/${bookingId}/accept`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to accept booking');
        }

        // Refresh dashboard data
        fetchDashboardData();
        alert('Booking accepted successfully');
    } catch (error) {
        console.error('Error accepting booking:', error);
        alert(error.message || 'Failed to accept booking. Please try again later.');
    }
}

async function completeBooking(bookingId) {
    if (!bookingId) {
        alert('Invalid booking ID');
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3001/api/bookings/${bookingId}/complete`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to complete booking');
        }

        // Refresh dashboard data
        fetchDashboardData();
        alert('Booking completed successfully');
    } catch (error) {
        console.error('Error completing booking:', error);
        alert(error.message || 'Failed to complete booking. Please try again later.');
    }
} 