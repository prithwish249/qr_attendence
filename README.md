# QR Attendance System

A modern attendance management system that uses QR codes to track attendance. Built with Spring Boot backend and React frontend.

## Features

- **QR Code Attendance**: Mark attendance by scanning QR codes
- **User Authentication**: Secure login system for admins and employees
- **Real-time Tracking**: View today's attendance records
- **Personal History**: Check individual attendance history
- **Admin Panel**: Create and manage attendance sessions with QR code generation
- **User Management**: Add, edit, and delete users with secure password hashing
- **Modern UI**: Beautiful, responsive interface built with React and Tailwind CSS

## Tech Stack

### Backend
- **Spring Boot 3.5.3**: Java-based REST API
- **Spring Data JPA**: Database operations
- **Spring Security Crypto**: Password hashing with BCrypt
- **MySQL**: Database
- **Lombok**: Reduces boilerplate code
- **Maven**: Build tool

### Frontend
- **React 18**: Modern JavaScript framework
- **React Router**: Client-side routing
- **Axios**: HTTP client for API calls
- **Tailwind CSS**: Utility-first CSS framework (properly configured)
- **QR Code Libraries**: QR code generation and scanning
- **Create React App**: Development environment



## Setup Instructions

### 1. Database Setup

1. Create a MySQL database named `attendance`
2. Update database credentials in `backend/src/main/resources/application.properties` if needed:
   ```properties
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Run the Spring Boot application:
   ```bash
   # On Windows
   mvnw.cmd spring-boot:run
   
  

3. The backend will start on `http://localhost:8080`

### 3. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```
   
   Note: Tailwind CSS is properly configured with PostCSS and will be automatically processed during development.

3. Start the development server:
   ```bash
   npm start
   ```

4. The frontend will start on `http://localhost:3000`

## Usage

### For Administrators

1. **Login**: 
   - Use admin credentials to log in
   - You'll be redirected to the Admin Panel

2. **Create a Session**: 
   - Go to the Admin Panel
   - Click "Create New Session" to generate a QR code for today
   - Display the QR code where users can scan it

3. **View Today's Attendance**:
   - Navigate to "Today's Attendance" to see all attendance records for today

4. **Manage Users**:
   - Go to "User Management" to add new users, change passwords, or delete users
  

### For Users

1. **Login**:
   - Use your employee credentials to log in
   - You'll be redirected to the Scan QR page

2. **Mark Attendance**:
   - Go to "Scan QR" page
   - Point your camera at the QR code displayed by your administrator
   - Attendance will be automatically marked

3. **View Personal History**:
   - Go to "My Attendance" page to view your attendance history

## API Endpoints

### Attendance
- `POST /api/attendance/submit` - Submit attendance
- `GET /api/attendance/today` - Get today's attendance logs
- `GET /api/attendance/by-user/{id}` - Get attendance logs by user ID

### Sessions
- `POST /api/admin/session/new` - Create new attendance session
- `GET /api/session/today` - Get today's session

### Authentication
- `POST /api/auth/login` - User login

### User Management (Admin Only)
- `POST /api/admin/users/add` - Add new user
- `GET /api/admin/users/all` - Get all users
- `DELETE /api/admin/users/{id}` - Delete user
- `PUT /api/admin/users/{id}/password` - Change user password

### Users
- `GET /api/users/by-username` - Get user by username
- `GET /api/users/{id}` - Get user by ID

## Database Schema

### User
- `id` (Long, Primary Key)
- `username` (String, Unique)
- `password` (String)
- `role` (String: ADMIN or EMPLOYEE)

### AttendanceSession
- `id` (Long, Primary Key)
- `qrCodeToken` (String)
- `date` (LocalDate)

### AttendanceLog
- `id` (Long, Primary Key)
- `userId` (Long, Foreign Key to User)
- `date` (LocalDate)
- `time` (LocalTime)

## Development

### Adding New Features

1. **Backend**: Add new endpoints in controllers, models, and repositories
2. **Frontend**: Create new React components and update routing

### Database Changes

1. Update entity models in `backend/src/main/java/com/qrattendance/model/`
2. Create/update repositories in `backend/src/main/java/com/qrattendance/repository/`
3. Spring Boot will automatically update the database schema

## Troubleshooting

### Common Issues

1. **Database Connection Error**:
   - Ensure MySQL is running
   - Check database credentials in `application.properties`
   - Verify database `attendance` exists

2. **Frontend Can't Connect to Backend**:
   - Ensure backend is running on port 8080
   - Check CORS configuration in `BackendApplication.java`
   - Verify proxy setting in `package.json`

3. **Port Already in Use**:
   - Change port in `application.properties` for backend
   - Change port in `package.json` for frontend



## License

This project is licensed under the MIT License. 