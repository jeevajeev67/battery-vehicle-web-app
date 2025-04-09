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

    // Add logout event listener
    document.getElementById('logoutBtn').addEventListener('click', logout);

    // Fetch recent bookings
    fetchRecentBookings();
});

async function fetchRecentBookings() {
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
            displayRecentBookings(bookings);
        } else {
            console.error('Failed to fetch recent bookings:', bookings.message);
            document.getElementById('recentBookings').innerHTML = '<p class="text-muted">Failed to load bookings</p>';
        }
    } catch (error) {
        console.error('Fetch recent bookings error:', error);
        document.getElementById('recentBookings').innerHTML = '<p class="text-muted">Failed to load bookings</p>';
    }
}

function displayRecentBookings(bookings) {
    const recentBookingsDiv = document.getElementById('recentBookings');
    recentBookingsDiv.innerHTML = '';

    // Sort bookings by date (most recent first)
    bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Display only the 5 most recent bookings
    const recentBookings = bookings.slice(0, 5);

    if (recentBookings.length === 0) {
        recentBookingsDiv.innerHTML = '<p class="text-muted">No bookings yet</p>';
        return;
    }

    const table = document.createElement('table');
    table.className = 'table table-hover';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Status</th>
                <th>Pickup</th>
                <th>Dropoff</th>
                <th>Time</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody>
            ${recentBookings.map(booking => `
                <tr>
                    <td><span class="badge ${getStatusBadgeClass(booking.status)}">${booking.status}</span></td>
                    <td>${booking.pickupLocation}</td>
                    <td>${booking.dropoffLocation}</td>
                    <td>${new Date(booking.pickupTime).toLocaleString()}</td>
                    <td>
                        <a href="active-bookings.html" class="btn btn-sm btn-primary">View Details</a>
                    </td>
                </tr>
            `).join('')}
        </tbody>
    `;

    recentBookingsDiv.appendChild(table);

    // Add a link to view all bookings if there are more than 5
    if (bookings.length > 5) {
        const viewAllLink = document.createElement('a');
        viewAllLink.href = 'active-bookings.html';
        viewAllLink.className = 'btn btn-link mt-2';
        viewAllLink.textContent = 'View All Bookings';
        recentBookingsDiv.appendChild(viewAllLink);
    }
}

function getStatusBadgeClass(status) {
    switch (status) {
        case 'pending':
            return 'bg-warning';
        case 'in-progress':
            return 'bg-info';
        case 'completed':
            return 'bg-success';
        case 'cancelled':
            return 'bg-danger';
        default:
            return 'bg-secondary';
    }
}

function logout() {
    localStorage.clear();
    window.location.href = '../login.html';
} 