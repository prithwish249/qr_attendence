-- Initial user setup (passwords should be set securely by admin)
INSERT INTO user (username, role) VALUES ('admin', 'ADMIN') ON DUPLICATE KEY UPDATE role = 'ADMIN';
INSERT INTO user (username, role) VALUES ('john.doe', 'EMPLOYEE') ON DUPLICATE KEY UPDATE role = 'EMPLOYEE';
INSERT INTO user (username, role) VALUES ('jane.smith', 'EMPLOYEE') ON DUPLICATE KEY UPDATE role = 'EMPLOYEE';
INSERT INTO user (username, role) VALUES ('mike.wilson', 'EMPLOYEE') ON DUPLICATE KEY UPDATE role = 'EMPLOYEE';
INSERT INTO user (username, role) VALUES ('sarah.jones', 'EMPLOYEE') ON DUPLICATE KEY UPDATE role = 'EMPLOYEE'; 