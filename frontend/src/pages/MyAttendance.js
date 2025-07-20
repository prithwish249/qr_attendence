import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function MyAttendance() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  const fetchUserLogs = async () => {
    if (!user) return;
    
    try {
      const res = await axios.get(`/api/attendance/by-user/${user.id}`);
      setLogs(res.data);
      setError("");
    } catch (err) {
      setError("Error fetching attendance logs.");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserLogs();
  }, [user]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading your attendance records...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
          My Attendance Logs
        </h2>
        
        <div className="mb-4 text-center">
          <p className="text-sm text-gray-600">
            Showing attendance records for: <span className="font-medium">{user?.username}</span>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {logs.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Attendance History ({logs.length} records)
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-3">
                {logs.map((log, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-white rounded-md shadow-sm">
                    <div>
                      <span className="font-medium text-gray-800">
                        {formatDate(log.date)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-gray-600">
                        {formatTime(log.time)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {logs.length === 0 && !error && !loading && (
          <div className="text-center py-8 text-gray-500">
            <p>No attendance records found.</p>
            <p className="text-sm mt-2">Enter your username above to view your attendance history.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyAttendance; 