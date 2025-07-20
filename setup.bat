@echo off
echo ========================================
echo QR Attendance System Setup
echo ========================================
echo.

echo Starting backend...
cd backend
start "Backend" cmd /k "mvnw.cmd spring-boot:run"
cd ..

echo.
echo Waiting for backend to start...
timeout /t 10 /nobreak > nul

echo.
echo Starting frontend...
cd frontend
start "Frontend" cmd /k "npm install && npm start"
cd ..

echo.
echo ========================================
echo Setup complete!
echo ========================================
echo Backend: http://localhost:8080
echo Frontend: http://localhost:3000
echo.
echo Make sure you have:
echo 1. MySQL running with database 'attendance'
echo 2. Java 17+ installed
echo 3. Node.js 16+ installed
echo.
pause 