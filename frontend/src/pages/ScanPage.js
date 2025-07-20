import React, { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function ScanPage() {
  const [scannedToken, setScannedToken] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionAvailable, setSessionAvailable] = useState(false);
  const [showScanner, setShowScanner] = useState(true);
  const { user } = useAuth();
  const scannerRef = useRef(null);

  const handleScan = async (decodedText) => {
    if (decodedText) {
      setScannedToken(decodedText);
      setShowScanner(false);
      await submitAttendance(decodedText);
    }
  };

  const submitAttendance = async (token) => {
    if (!user) {
      setMessage("Please log in to mark attendance");
      return;
    }

    setLoading(true);
    setMessage("");
    
    try {
      const res = await axios.post("/api/attendance/submit", null, {
        params: { username: user.username, token },
      });
      
      if (res.data.includes("already marked")) {
        setMessage("⚠️ " + res.data);
      } else if (res.data.includes("successfully")) {
        setMessage("✅ " + res.data);
      } else {
        setMessage(res.data);
      }
    } catch (err) {
      const errorMessage = err.response?.data || err.message;
      if (errorMessage.includes("No session")) {
        setMessage("❌ No active session for today. Please contact your administrator.");
      } else if (errorMessage.includes("Invalid QR token")) {
        setMessage("❌ Invalid QR code. Please scan the correct QR code.");
      } else {
        setMessage("❌ Error: " + errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const checkSessionAvailability = async () => {
    try {
      await axios.get("/api/session/today");
      setSessionAvailable(true);
    } catch (err) {
      setSessionAvailable(false);
      setMessage("No session available for today.");
    }
  };

  useEffect(() => {
    checkSessionAvailability();
  }, []);

  useEffect(() => {
    if (sessionAvailable && showScanner && !scannerRef.current) {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        false
      );
      
      scanner.render(handleScan, (error) => {
        console.error(error);
      });
      
      scannerRef.current = scanner;
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    };
  }, [sessionAvailable, showScanner]);

  const resetScanner = () => {
    setScannedToken("");
    setShowScanner(true);
    setMessage("");
  };

  const cancelScanning = () => {
    setShowScanner(false);
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="card">
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
          Scan QR Code
        </h2>
        
        {!sessionAvailable && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
            <p className="text-yellow-800 text-sm">
              No active session for today. Please contact your administrator.
            </p>
          </div>
        )}

        {sessionAvailable && (
          <>
            {showScanner ? (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Point your camera at the QR code to mark attendance
                  </p>
                  <p className="text-xs text-gray-500">
                    Logged in as: <span className="font-medium">{user?.username}</span>
                  </p>
                </div>
                
                <div id="qr-reader" className="border-2 border-gray-300 rounded-lg overflow-hidden"></div>
                
                <button
                  onClick={cancelScanning}
                  className="w-full btn-secondary"
                >
                  Cancel Scanning
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    QR Code Scanned Successfully
                  </p>
                  <p className="text-xs text-gray-500 font-mono break-all">
                    Token: {scannedToken.substring(0, 20)}...
                  </p>
                </div>
                
                <button
                  onClick={resetScanner}
                  className="w-full btn-primary"
                >
                  Scan Another QR Code
                </button>
              </div>
            )}
          </>
        )}

        {message && (
          <div className={`mt-4 p-3 rounded-md ${
            message.includes('Error') || message.includes('Invalid') || message.includes('not found') 
              ? 'bg-red-50 text-red-700 border border-red-200' 
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {message}
          </div>
        )}

        {loading && (
          <div className="mt-4 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">Processing attendance...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ScanPage; 