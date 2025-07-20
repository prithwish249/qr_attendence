# QR Attendance System Setup Guide

## Prerequisites
- Java 17 or higher
- Node.js 16 or higher
- MySQL 8.0 or higher
- Maven (for backend)

## Database Setup

1. **Create MySQL Database**
```sql
CREATE DATABASE attendance;
USE attendance;
```

2. **Update Database Configuration**
Edit `backend/src/main/resources/application.properties`:
```properties
spring.datasource.username=your_mysql_username
spring.datasource.password=your_mysql_password
```

## Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Build the project**
```bash
./mvnw clean install
```

3. **Run the application**
```bash
./mvnw spring-boot:run
```

The backend will start on `http://localhost:8080`

## Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npm start
```

The frontend will start on `http://localhost:3000`

## Initial Setup

1. **Access the application** at `http://localhost:3000`

2. **Create a session** (Admin only):
   - Go to Admin Panel
   - Click "Create New Session"
   - Display the QR code for users download it and and user can only give attendence only after scan the QR.

## Features

### For Employees:
- 📱 Scan QR codes to mark attendance
- 📊 View personal attendance history
- 🔐 Secure login with role-based access

### For Admins:
- ⚙️ Create daily attendance sessions
- 📈 View today's attendance reports
- 👥 Manage users and roles
- 📊 Generate QR codes for attendance

## Troubleshooting

### Common Issues:

1. **Database Connection Error**
   - Verify MySQL is running
   - Check database credentials in `application.properties`
   - Ensure database `attendance` exists

2. **Frontend Can't Connect to Backend**
   - Verify backend is running on port 8080
   - Check proxy configuration in `package.json`
   - Ensure CORS is properly configured

3. **QR Scanner Not Working**
   - Ensure HTTPS or localhost (camera access requires secure context)
   - Check browser permissions for camera access
   - Verify `html5-qrcode` library is installed

## Security Notes

- Passwords are automatically migrated from plain text to BCrypt on first login
- Session tokens are UUID-based for security
- Role-based access control is implemented
- Input validation is in place for all endpoints

## API Endpoints

- `POST /api/auth/login` - User authentication
- `POST /api/admin/session/new` - Create new attendance session
- `GET /api/session/today` - Get today's session
- `POST /api/attendance/submit` - Submit attendance
- `GET /api/attendance/today` - Get today's attendance logs
- `GET /api/attendance/by-user/{id}` - Get user's attendance history 
