package com.qrattendance.service;

import com.qrattendance.model.User;
import com.qrattendance.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PasswordMigrationService {
    
    @Autowired
    private UserRepository userRepo;
    
    @Autowired
    private PasswordService passwordService;
    
    /**
     * Migrate plain text passwords to BCrypt hashed passwords
     * This method checks if a password looks like BCrypt and if not, hashes it
     */
    public void migratePasswords() {
        List<User> users = userRepo.findAll();
        
        for (User user : users) {
            String currentPassword = user.getPassword();
            
            // Check if password is already BCrypt hashed
            if (!isBCryptHash(currentPassword)) {
                // Hash the plain text password
                String hashedPassword = passwordService.hashPassword(currentPassword);
                user.setPassword(hashedPassword);
                userRepo.save(user);
                System.out.println("Migrated password for user: " + user.getUsername());
            }
        }
    }
    
    /**
     * Check if a string looks like a BCrypt hash
     * BCrypt hashes start with $2a$, $2b$, or $2y$ followed by cost and salt
     */
    private boolean isBCryptHash(String password) {
        return password != null && 
               password.length() == 60 && 
               (password.startsWith("$2a$") || password.startsWith("$2b$") || password.startsWith("$2y$"));
    }
} 