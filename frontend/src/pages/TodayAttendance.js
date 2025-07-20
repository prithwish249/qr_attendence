import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

function TodayAttendance() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    present: 0,
    absent: 0
  });

  useEffect(() => {
    fetchTodayAttendance();
  }, []);

  const fetchTodayAttendance = async () => {
    try {
      const response = await axios.get('/api/attendance/today');
      const data = response.data;
      setAttendanceData(data);
      
      // Calculate statistics
      const totalEmployees = data.length;
      const present = data.filter(record => record.status === 'PRESENT').length;
      const absent = data.filter(record => record.status === 'ABSENT').length;
      
      setStats({
        totalEmployees,
        present,
        absent
      });

      setLoading(false);
    } catch (err) {
      setError('Failed to fetch today\'s attendance');
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    // Prepare CSV data
    const headers = ['Username', 'Role', 'Check-in Time', 'Status'];
    const csvData = attendanceData.map(record => [
      record.username || 'Unknown',
      record.role || 'N/A',
      record.checkInTime ? new Date(`2000-01-01T${record.checkInTime}`).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }) : 'Not checked in',
      record.status || 'N/A'
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const exportToExcel = () => {
    // Prepare Excel data
    const excelData = attendanceData.map(record => ({
      Username: record.username || 'Unknown',
      Role: record.role || 'N/A',
      'Check-in Time': record.checkInTime ? new Date(`2000-01-01T${record.checkInTime}`).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }) : 'Not checked in',
      Status: record.status || 'N/A'
    }));

    // Create Excel content
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
    
    // Generate Excel file
    XLSX.writeFile(workbook, `attendance_report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="alert alert-error">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="page-header">
        <h1>Today's Attendance Report</h1>
        <p className="page-subtitle">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-emerald-400 to-teal-400 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100">Total Employees</p>
              <h3 className="text-3xl font-bold">{stats.totalEmployees}</h3>
            </div>
            <svg className="w-12 h-12 text-emerald-100 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-indigo-400 to-purple-400 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100">Present Today</p>
              <h3 className="text-3xl font-bold">{stats.present}</h3>
            </div>
            <svg className="w-12 h-12 text-indigo-100 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-rose-400 to-pink-400 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-rose-100">Absent Today</p>
              <h3 className="text-3xl font-bold">{stats.absent}</h3>
            </div>
            <svg className="w-12 h-12 text-rose-100 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Detailed Report</h2>
          <div className="flex gap-4">
            <button
              onClick={exportToCSV}
              className="btn-secondary"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </button>
            <button
              onClick={exportToExcel}
              className="btn-secondary"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Excel
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Role</th>
                <th>Check-in Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.map((record, index) => (
                <tr key={index} className={record.status === 'ABSENT' ? 'bg-rose-50' : ''}>
                  <td className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium">
                      {(record.username || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {record.username || 'Unknown User'}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {record.userId || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-info">
                      {record.role || 'N/A'}
                    </span>
                  </td>
                  <td>
                    {record.checkInTime ? (
                      new Date(`2000-01-01T${record.checkInTime}`).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    ) : (
                      <span className="text-gray-400">Not checked in</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${
                      record.status === 'PRESENT' ? 'badge-success' : 'badge-error'
                    }`}>
                      {record.status || 'N/A'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default TodayAttendance; 