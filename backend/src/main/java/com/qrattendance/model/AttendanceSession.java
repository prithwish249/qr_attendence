package com.qrattendance.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "attendance_session")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceSession {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String qrCodeToken;
    private LocalDate date;
} 