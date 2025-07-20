package com.qrattendance.controller;

import com.qrattendance.model.*;
import com.qrattendance.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

@RestController
@RequestMapping("/api")
public class AttendanceController {

    @Autowired private UserRepository userRepo;
    @Autowired private AttendanceSessionRepository sessionRepo;
    @Autowired private AttendanceLogRepository logRepo;

    @PostMapping("/admin/session/new")
    public ResponseEntity<?> createSession() {
        try {
            // Check if there's already a session for today
            Optional<AttendanceSession> existingSession = sessionRepo.findByDate(LocalDate.now());
            
            if (existingSession.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Session already exists for today");
                response.put("session", existingSession.get());
                return ResponseEntity.ok(response);
            }

            // Generate a new session with UUID as QR code token
            String token = UUID.randomUUID().toString();
            AttendanceSession session = new AttendanceSession(null, token, LocalDate.now());
            AttendanceSession savedSession = sessionRepo.save(session);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "New session created successfully");
            response.put("session", savedSession);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating session: " + e.getMessage());
        }
    }

    @GetMapping("/session/today")
    public ResponseEntity<?> getTodaySession() {
        try {
            Optional<AttendanceSession> session = sessionRepo.findByDate(LocalDate.now());
            if (session.isEmpty()) {
                return ResponseEntity.badRequest().body("No session available for today");
            }
            return ResponseEntity.ok(session.get());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching today's session: " + e.getMessage());
        }
    }

    @PostMapping("/attendance/submit")
    public ResponseEntity<?> submitAttendance(@RequestParam String username, @RequestParam String token) {
        try {
            // Find today's session
            Optional<AttendanceSession> sessionOpt = sessionRepo.findByDate(LocalDate.now());
            if (sessionOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("No session available for today");
            }

            AttendanceSession session = sessionOpt.get();
            if (!session.getQrCodeToken().equals(token)) {
                return ResponseEntity.badRequest().body("Invalid QR token");
            }

            // Find user
            Optional<User> userOpt = userRepo.findByUsername(username);
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("User not found");
            }

            User user = userOpt.get();

            // Check if attendance already marked for today
            List<AttendanceLog> existingLogs = logRepo.findByUserIdAndDate(user.getId(), LocalDate.now());
            if (!existingLogs.isEmpty()) {
                return ResponseEntity.badRequest().body("Attendance already marked for today");
            }

            // Mark attendance
            AttendanceLog log = new AttendanceLog(null, user.getId(), LocalDate.now(), LocalTime.now());
            logRepo.save(log);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Attendance marked successfully");
            response.put("username", username);
            response.put("time", LocalTime.now().toString());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error marking attendance: " + e.getMessage());
        }
    }

    @GetMapping("/attendance/today")
    public ResponseEntity<?> getTodayLogs() {
        try {
            LocalDate today = LocalDate.now();
            
            // Get all employees (users with role EMPLOYEE)
            List<User> allEmployees = userRepo.findAll().stream()
                .filter(user -> "EMPLOYEE".equals(user.getRole()))
                .toList();
            
            // Get today's attendance logs
            List<AttendanceLog> todayLogs = logRepo.findByDate(today);
            
            // Create a set of user IDs who are present today
            Set<Long> presentUserIds = todayLogs.stream()
                .map(AttendanceLog::getUserId)
                .collect(java.util.stream.Collectors.toSet());
            
            // Build comprehensive attendance data
            List<Map<String, Object>> comprehensiveAttendance = new ArrayList<>();
            
            for (User employee : allEmployees) {
                Map<String, Object> attendanceRecord = new HashMap<>();
                attendanceRecord.put("userId", employee.getId());
                attendanceRecord.put("username", employee.getUsername());
                attendanceRecord.put("role", employee.getRole());
                
                // Check if this employee is present today
                if (presentUserIds.contains(employee.getId())) {
                    // Find the attendance log for this user
                    AttendanceLog userLog = todayLogs.stream()
                        .filter(log -> log.getUserId().equals(employee.getId()))
                        .findFirst()
                        .orElse(null);
                    
                    attendanceRecord.put("status", "PRESENT");
                    attendanceRecord.put("checkInTime", userLog != null ? userLog.getTime() : null);
                    attendanceRecord.put("date", today);
                } else {
                    attendanceRecord.put("status", "ABSENT");
                    attendanceRecord.put("checkInTime", null);
                    attendanceRecord.put("date", today);
                }
                
                comprehensiveAttendance.add(attendanceRecord);
            }
            
            return ResponseEntity.ok(comprehensiveAttendance);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching attendance logs: " + e.getMessage());
        }
    }

    @GetMapping("/attendance/by-user/{id}")
    public ResponseEntity<?> getLogsByUser(@PathVariable Long id) {
        try {
            Optional<User> userOpt = userRepo.findById(id);
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("User not found");
            }

            List<AttendanceLog> logs = logRepo.findByUserId(id);
            return ResponseEntity.ok(logs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching user logs: " + e.getMessage());
        }
    }

    @DeleteMapping("/admin/session/today")
    public ResponseEntity<?> deleteTodaySession() {
        try {
            Optional<AttendanceSession> sessionOpt = sessionRepo.findByDate(LocalDate.now());
            if (sessionOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("No session found for today");
            }
            
            sessionRepo.delete(sessionOpt.get());
            return ResponseEntity.ok("Today's session deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting session: " + e.getMessage());
        }
    }
} 