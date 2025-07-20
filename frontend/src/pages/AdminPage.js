import React, { useState, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import axios from "axios";

function AdminPage() {
  const [currentSession, setCurrentSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [sessionLoading, setSessionLoading] = useState(true);
  const qrRef = useRef(null);

  const createNewSession = async () => {
    setLoading(true);
    setMessage("");
    
    try {
      const res = await axios.post("/api/admin/session/new");
      if (res.data.session) {
        setCurrentSession(res.data.session);
        setMessage("✅ " + (res.data.message || "New session created successfully! QR code is now active."));
      } else {
        setMessage("❌ Error: Invalid response format");
      }
    } catch (err) {
      setMessage("❌ Error: " + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchTodaySession = async () => {
    try {
      const res = await axios.get("/api/session/today");
      setCurrentSession(res.data);
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data === "No session available for today") {
      setCurrentSession(null);
      } else {
        setMessage("❌ Error fetching session: " + (err.response?.data || err.message));
      }
    } finally {
      setSessionLoading(false);
    }
  };

  const deleteSession = async () => {
    setLoading(true);
    setMessage("");
    
    try {
      const res = await axios.delete("/api/admin/session/today");
      setCurrentSession(null);
      setMessage("✅ " + (res.data || "Session deleted successfully"));
    } catch (err) {
      setMessage("❌ Error: " + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrRef.current) return;

    const canvas = document.createElement('canvas');
    const svg = qrRef.current.querySelector('svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    
    img.onload = () => {
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      
      // Fill white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, 400, 400);
      
      // Draw the QR code
      ctx.drawImage(img, 0, 0, 400, 400);
      
      // Convert to blob and download
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `qr-code-${new Date().toISOString().split('T')[0]}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  useEffect(() => {
    fetchTodaySession();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Manage attendance sessions and monitor QR code generation
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Session Status */}
          <div className="space-y-6">
            {/* Current Session Card */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-indigo-100 p-6 hover:shadow-xl transition-shadow duration-300">
              <h2 className="text-xl font-semibold text-indigo-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Session Status
        </h2>
            
            {sessionLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : currentSession ? (
              <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                    <span className="text-sm font-medium text-indigo-700">Date</span>
                    <span className="text-sm text-indigo-900 font-semibold">{formatDate(currentSession.date)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                    <span className="text-sm font-medium text-purple-700">Session ID</span>
                    <span className="text-sm text-purple-900 font-mono">{currentSession.id}</span>
                  </div>
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-3 flex items-center">
                    <svg className="w-5 h-5 text-emerald-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-sm text-emerald-700 font-medium">Active session running</p>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-4 flex items-center">
                  <svg className="w-5 h-5 text-amber-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <p className="text-sm text-amber-700">No active session available</p>
                </div>
              )}
            </div>

            {/* Session Management Card */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100 p-6 hover:shadow-xl transition-shadow duration-300">
              <h2 className="text-xl font-semibold text-purple-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Session Management
              </h2>

              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  {currentSession 
                    ? "Manage the current session or generate a new QR code if needed."
                    : "Start a new session to begin tracking attendance for today."}
                </p>
                
                <div className="space-y-3">
                  {currentSession ? (
                    <>
                      <button
                        onClick={deleteSession}
                        disabled={loading}
                        className={`w-full px-4 py-2 text-sm font-medium text-rose-100 bg-gradient-to-r from-rose-500 to-pink-500 rounded-lg hover:from-rose-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition-all duration-300 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {loading ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-rose-100" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Deleting Session...
                          </span>
                        ) : 'Delete Current Session'}
                      </button>
                      <button
                        onClick={createNewSession}
                        disabled={loading}
                        className={`w-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg hover:from-indigo-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {loading ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generating...
                          </span>
                        ) : 'Generate New QR Code'}
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={createNewSession}
                      disabled={loading}
                      className={`w-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg hover:from-indigo-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating Session...
                        </span>
                      ) : 'Create New Session'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Message Display */}
            {message && (
              <div className={`rounded-lg p-4 flex items-center backdrop-blur-sm ${
                message.includes('❌') 
                  ? 'bg-rose-50/80 text-rose-700 border border-rose-200' 
                  : 'bg-emerald-50/80 text-emerald-700 border border-emerald-200'
              }`}>
                <span className="text-sm font-medium">{message}</span>
              </div>
            )}
          </div>

          {/* Right Column - QR Code Display */}
          <div>
            {currentSession && (
              <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-indigo-100 p-6 hover:shadow-xl transition-shadow duration-300">
                <h2 className="text-xl font-semibold text-indigo-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  QR Code
                </h2>

                <div className="flex flex-col items-center space-y-4">
                  <div ref={qrRef} className="bg-gradient-to-r from-white to-indigo-50 p-6 rounded-xl border-2 border-indigo-100 shadow-inner">
                    <QRCodeSVG
                      value={currentSession.qrCodeToken}
                      size={280}
                      level="H"
                      includeMargin={true}
                      className="rounded-lg"
                    />
                  </div>
                  <p className="text-sm text-indigo-600 text-center font-medium">
                    Scan this QR code to mark attendance for today's session
                  </p>
                  
                  {/* Download QR Code Button */}
                  <button
                    onClick={downloadQRCode}
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-300 flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download QR Code
                  </button>
                </div>
              </div>
            )}

            {/* Instructions Card */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100 p-6 mt-6 hover:shadow-xl transition-shadow duration-300">
              <h2 className="text-xl font-semibold text-purple-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Instructions
              </h2>
              <ul className="space-y-3">
                {[
                  "Create a new session to generate a QR code for today",
                  "The QR code will remain unchanged until you generate a new one",
                  "Display the QR code where users can scan it",
                  "Download the QR code as PNG image for printing or sharing",
                  "Users can scan the QR code using the 'Scan QR' page",
                  "View attendance records in the 'Today's Attendance' page",
                  "Only one session can be active per day"
                ].map((instruction, index) => (
                  <li key={index} className="flex items-center text-sm text-indigo-700">
                    <svg className="w-4 h-4 mr-2 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {instruction}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPage; 