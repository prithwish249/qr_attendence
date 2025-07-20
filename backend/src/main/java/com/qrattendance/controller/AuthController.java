package com.qrattendance.controller;

import com.qrattendance.model.User;
import com.qrattendance.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private UserRepository userRepo;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        String username = loginRequest.get("username");
        String password = loginRequest.get("password");

        logger.debug("Login attempt for username: {}", username);

        if (username == null || password == null) {
            logger.debug("Login failed: Missing username or password");
            return ResponseEntity.badRequest().body("Username and password are required");
        }

        Optional<User> userOpt = userRepo.findByUsername(username);
        if (userOpt.isEmpty()) {
            logger.debug("Login failed: User not found - {}", username);
            return ResponseEntity.badRequest().body("Invalid username or password");
        }

        User user = userOpt.get();
        String storedPassword = user.getPassword();
        
        // Simple plain text password comparison
        if (!password.equals(storedPassword)) {
            logger.debug("Login failed: Invalid password for user - {}", username);
            return ResponseEntity.badRequest().body("Invalid username or password");
        }

        // Return user data without password
        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("username", user.getUsername());
        response.put("role", user.getRole());

        logger.info("Successful login for user: {}", username);
        return ResponseEntity.ok(response);
    }
} 