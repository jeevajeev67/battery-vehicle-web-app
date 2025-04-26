# Campus Battery Vehicle Booking Systems

A web application for managing battery vehicle bookings within a college campus. Students can book rides, and drivers can manage these bookings efficiently.

## Features

### For Students
- Sign up/Login with student credentials
- Book battery vehicles with pickup and drop locations
- View current and past bookings
- Track booking status in real-time
- Rate and provide feedback for completed rides

### For Drivers
- Sign up/Login with driver credentials
- View and accept pending bookings
- Mark bookings as completed
- View booking history and statistics
- Track performance ratings

## Tech Stack

### Frontend
- HTML5
- CSS3 (with Bootstrap 5)
- JavaScript (Vanilla JS)
- Font Awesome icons

### Backend
- Node.js
- Express.js
- MongoDB
- JWT for authentication

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm (Node Package Manager)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd campus-battery-vehicle
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Create a `.env` file in the backend directory with the following content:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/campus-ride
JWT_SECRET=your-secret-key
```

4. Start MongoDB service on your machine

5. Start the backend server:
```bash
npm run dev
```

6. Open the frontend:
- Navigate to the `frontend` directory
- Open `index.html` in a web browser
- For development, you can use a local server like `live-server`

## API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new user (student/driver)
```json
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "password123",
  "role": "student",
  "studentId": "S12345"
}
```

#### POST /api/auth/login
Login with credentials
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "student"
}
```

### Booking Endpoints

#### POST /api/bookings
Create a new booking
```json
{
  "pickupLocation": "library",
  "dropoffLocation": "hostel",
  "date": "2024-04-05",
  "time": "14:30",
  "notes": "Optional notes"
}
```

#### GET /api/bookings/driver/:driverId/active
Get active bookings for a driver

#### POST /api/bookings/:bookingId/accept
Accept a booking (driver only)

#### POST /api/bookings/:bookingId/complete
Complete a booking (driver only)

## Directory Structure

```
campus-battery-vehicle/
├── frontend/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── login.js
│   │   └── dashboard.js
│   ├── student/
│   │   └── dashboard.html
│   ├── driver/
│   │   └── dashboard.html
│   └── index.html
└── backend/
    ├── models/
    │   ├── User.js
    │   └── Booking.js
    ├── routes/
    │   ├── auth.js
    │   ├── bookings.js
    │   ├── drivers.js
    │   └── students.js
    ├── package.json
    └── server.js
```

## Contributing

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email support@campusride.com or create an issue in the repository. 
