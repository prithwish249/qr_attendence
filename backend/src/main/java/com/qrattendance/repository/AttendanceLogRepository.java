package com.qrattendance.repository;

import com.qrattendance.model.AttendanceLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface AttendanceLogRepository extends JpaRepository<AttendanceLog, Long> {
    List<AttendanceLog> findByUserId(Long userId);
    List<AttendanceLog> findByDate(LocalDate date);
    List<AttendanceLog> findByUserIdAndDate(Long userId, LocalDate date);
} 