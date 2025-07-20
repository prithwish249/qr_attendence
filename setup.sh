#!/bin/bash

echo "========================================"
echo "QR Attendance System Setup"
echo "========================================"
echo

echo "Starting backend..."
cd backend
gnome-terminal --title="Backend" -- bash -c "./mvnw spring-boot:run; exec bash" &
cd ..

echo
echo "Waiting for backend to start..."
sleep 10

echo
echo "Starting frontend..."
cd frontend
gnome-terminal --title="Frontend" -- bash -c "npm install && npm start; exec bash" &
cd ..

echo
echo "========================================"
echo "Setup complete!"
echo "========================================"
echo "Backend: http://localhost:8080"
echo "Frontend: http://localhost:3000"
echo
echo "Make sure you have:"
echo "1. MySQL running with database 'attendance'"
echo "2. Java 17+ installed"
echo "3. Node.js 16+ installed"
echo
read -p "Press Enter to continue..." 