// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get form elements
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    // Check if all required elements exist
    if (!loginForm || !emailInput || !passwordInput) {
        console.error('Required form elements not found');
        return;
    }
    
    // Add submit event listener to the form
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form values
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        
        // Validate form inputs
        if (!email || !password) {
            alert('Please fill in all fields');
            return;
        }
        
        // Get the selected role
        const roleInput = document.querySelector('input[name="role"]:checked');
        const role = roleInput ? roleInput.value : 'student';
        
        try {
            // Send login request
            const response = await fetch('http://localhost:3001/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password,
                    role
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Store user data in localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('userRole', role);
                localStorage.setItem('userId', data.userId);
                localStorage.setItem('userName', data.name);
                
                // Redirect based on role
                if (role === 'student') {
                    window.location.href = 'student/dashboard.html';
                } else {
                    window.location.href = 'driver/dashboard.html';
                }
            } else {
                // Show error message
                alert(data.message || 'Login failed. Please try again.');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('An error occurred. Please try again later.');
        }
    });
}); 