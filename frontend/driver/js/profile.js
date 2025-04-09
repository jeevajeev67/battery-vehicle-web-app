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

    // Handle edit profile button
    document.getElementById('editProfileBtn').addEventListener('click', function() {
        // Populate the edit form with current values
        document.getElementById('editName').value = document.getElementById('driverName').textContent;
        document.getElementById('editPhone').value = document.getElementById('driverPhone').textContent === 'Not provided' ? '' : document.getElementById('driverPhone').textContent;
        document.getElementById('editVehicle').value = document.getElementById('driverVehicle').textContent === 'Not provided' ? '' : document.getElementById('driverVehicle').textContent;
        
        // Show the modal
        const editProfileModal = new bootstrap.Modal(document.getElementById('editProfileModal'));
        editProfileModal.show();
    });

    // Handle save profile button
    document.getElementById('saveProfileBtn').addEventListener('click', async function() {
        const name = document.getElementById('editName').value;
        const phone = document.getElementById('editPhone').value;
        const vehicle = document.getElementById('editVehicle').value;
        const password = document.getElementById('editPassword').value;

        if (!name) {
            alert('Name is required');
            return;
        }

        try {
            const driverId = localStorage.getItem('userId');
            const updateData = {
                name,
                phone: phone || undefined,
                vehicleNumber: vehicle || undefined
            };

            // Only include password if it's provided
            if (password) {
                updateData.password = password;
            }

            const response = await fetch(`http://localhost:3001/api/drivers/${driverId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            // Update local storage
            localStorage.setItem('driverName', name);

            // Update UI
            document.getElementById('driverName').textContent = name;
            document.getElementById('driverPhone').textContent = phone || 'Not provided';
            document.getElementById('driverVehicle').textContent = vehicle || 'Not provided';

            // Close the modal
            const editProfileModal = bootstrap.Modal.getInstance(document.getElementById('editProfileModal'));
            editProfileModal.hide();

            alert('Profile updated successfully');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile. Please try again later.');
        }
    });

    // Initial data fetch
    fetchDriverProfile();
    fetchDriverStats();
    fetchRecentRatings();
});

async function fetchDriverProfile() {
    try {
        const token = localStorage.getItem('token');
        const driverId = localStorage.getItem('userId');

        const response = await fetch(`http://localhost:3001/api/drivers/${driverId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch driver profile');
        }

        const driver = await response.json();
        
        // Update UI with driver information
        document.getElementById('driverName').textContent = driver.name || 'Driver';
        document.getElementById('driverEmail').textContent = driver.email || 'Not provided';
        document.getElementById('driverPhone').textContent = driver.phone || 'Not provided';
        document.getElementById('driverVehicle').textContent = driver.vehicleNumber || 'Not provided';
        
        // Update rating display
        updateRatingDisplay(driver.rating || 0);
    } catch (error) {
        console.error('Error fetching driver profile:', error);
        // Show error message to user
        document.getElementById('driverName').textContent = 'Error loading profile';
    }
}

async function fetchDriverStats() {
    try {
        const token = localStorage.getItem('token');
        const driverId = localStorage.getItem('userId');

        const response = await fetch(`http://localhost:3001/api/drivers/${driverId}/stats`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch driver statistics');
        }

        const stats = await response.json();
        
        // Update UI with statistics
        document.getElementById('totalCompleted').textContent = stats.totalBookings || 0;
        document.getElementById('completedToday').textContent = stats.completedToday || 0;
        document.getElementById('averageRating').textContent = (stats.averageRating || 0).toFixed(1);
    } catch (error) {
        console.error('Error fetching driver statistics:', error);
        // Show error message to user
        document.getElementById('totalCompleted').textContent = 'Error';
        document.getElementById('completedToday').textContent = 'Error';
        document.getElementById('averageRating').textContent = 'Error';
    }
}

async function fetchRecentRatings() {
    try {
        const token = localStorage.getItem('token');
        const driverId = localStorage.getItem('userId');

        const response = await fetch(`http://localhost:3001/api/drivers/${driverId}/bookings/completed`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch recent ratings');
        }

        const bookings = await response.json();
        
        // Filter bookings with ratings
        const ratedBookings = bookings.filter(booking => booking.rating);
        
        // Sort by completion date (most recent first)
        ratedBookings.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
        
        // Take only the 5 most recent ratings
        const recentRatings = ratedBookings.slice(0, 5);
        
        displayRecentRatings(recentRatings);
    } catch (error) {
        console.error('Error fetching recent ratings:', error);
        // Show error message to user
        const tbody = document.getElementById('recentRatings');
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">Failed to load recent ratings. Please try again later.</td></tr>';
    }
}

function displayRecentRatings(ratings) {
    const tbody = document.getElementById('recentRatings');
    
    if (ratings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No ratings yet.</td></tr>';
        return;
    }

    tbody.innerHTML = ratings.map(booking => `
        <tr>
            <td>${booking.studentId ? booking.studentId.name : 'Unknown'}</td>
            <td>${booking.completedAt ? new Date(booking.completedAt).toLocaleDateString() : 'N/A'}</td>
            <td>${getRatingStars(booking.rating)}</td>
            <td>${booking.feedback || 'No feedback'}</td>
        </tr>
    `).join('');
}

function updateRatingDisplay(rating) {
    const ratingElement = document.getElementById('driverRating');
    ratingElement.innerHTML = getRatingStars(rating) + `<span class="ms-2">${rating.toFixed(1)}</span>`;
}

function getRatingStars(rating) {
    if (!rating) return '<span>Not rated</span>';
    
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    let stars = '';
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    
    // Add half star if needed
    if (halfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    
    // Add empty stars
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
} 