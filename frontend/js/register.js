document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const studentFields = document.getElementById('studentFields');
    const driverFields = document.getElementById('driverFields');
    const roleInputs = document.querySelectorAll('input[name="role"]');
    
    // Handle role selection
    roleInputs.forEach(input => {
        input.addEventListener('change', function() {
            if (this.value === 'student') {
                studentFields.style.display = 'block';
                driverFields.style.display = 'none';
            } else {
                studentFields.style.display = 'none';
                driverFields.style.display = 'block';
            }
        });
    });
    
    // Handle form submission
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const role = document.querySelector('input[name="role"]:checked').value;
        
        // Validate passwords
        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        
        // Prepare registration data
        const registrationData = {
            name,
            email,
            password,
            role
        };
        
        // Add role-specific data
        if (role === 'student') {
            const studentId = document.getElementById('studentId').value;
            if (!studentId) {
                alert('Please enter your Student ID');
                return;
            }
            registrationData.studentId = studentId;
        } else {
            const driverId = document.getElementById('driverId').value;
            const vehicleNumber = document.getElementById('vehicleNumber').value;
            if (!driverId || !vehicleNumber) {
                alert('Please fill in all driver details');
                return;
            }
            registrationData.driverId = driverId;
            registrationData.vehicleNumber = vehicleNumber;
        }
        
        try {
            const response = await fetch('http://localhost:3001/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(registrationData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Store the token in localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('userRole', role);
                localStorage.setItem('userId', data.userId);
                
                // Show success message
                alert('Registration successful!');
                
                // Redirect based on role
                if (role === 'student') {
                    window.location.href = 'student/dashboard.html';
                } else {
                    window.location.href = 'driver/dashboard.html';
                }
            } else {
                // Show error message
                alert(data.message || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('An error occurred. Please try again later.');
        }
    });
}); 