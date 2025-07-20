import React, { useState, useEffect } from "react";
import axios from "axios";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  
  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    role: "EMPLOYEE"
  });
  const [addingUser, setAddingUser] = useState(false);

  // Password change states
  const [changingPassword, setChangingPassword] = useState(null);
  const [newPassword, setNewPassword] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/api/admin/users/all");
      setUsers(res.data);
      setError("");
    } catch (err) {
      setError("Error fetching users: " + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.username.trim() || !newUser.password.trim()) {
      setMessage("Please fill in all fields");
      return;
    }

    setAddingUser(true);
    setMessage("");

    try {
      const res = await axios.post("/api/admin/users/add", newUser);
      setMessage(res.data.message);
      setNewUser({ username: "", password: "", role: "EMPLOYEE" });
      setShowAddForm(false);
      fetchUsers(); // Refresh the list
    } catch (err) {
      setMessage("Error: " + (err.response?.data || err.message));
    } finally {
      setAddingUser(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      await axios.delete(`/api/admin/users/${userId}`);
      setMessage("User deleted successfully");
      fetchUsers(); // Refresh the list
    } catch (err) {
      setMessage("Error: " + (err.response?.data || err.message));
    }
  };

  const handleChangePassword = async (userId) => {
    if (!newPassword.trim()) {
      setMessage("Please enter a new password");
      return;
    }

    try {
      await axios.put(`/api/admin/users/${userId}/password`, {
        password: newPassword
      });
      setMessage("Password changed successfully");
      setChangingPassword(null);
      setNewPassword("");
    } catch (err) {
      setMessage("Error: " + (err.response?.data || err.message));
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            User Management
          </h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary"
          >
            {showAddForm ? 'Cancel' : 'Add New User'}
          </button>
        </div>

        {/* Add User Form */}
        {showAddForm && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Add New User
            </h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={newUser.username}
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                    className="input-field"
                    placeholder="Enter username"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    className="input-field"
                    placeholder="Enter password"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    className="input-field"
                  >
                    <option value="EMPLOYEE">Employee</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                disabled={addingUser}
                className={`btn-primary ${addingUser ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {addingUser ? 'Adding User...' : 'Add User'}
              </button>
            </form>
          </div>
        )}

        {/* Messages */}
        {message && (
          <div className={`p-3 rounded-md mb-4 ${
            message.includes('Error') 
              ? 'bg-red-50 text-red-700 border border-red-200' 
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Users List */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            All Users ({users.length})
          </h3>
          
          {users.length > 0 ? (
            <div className="space-y-3">
              {users.map((user) => (
                <div key={user.id} className="flex justify-between items-center p-4 bg-white rounded-md shadow-sm">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-sm">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{user.username}</p>
                      <p className="text-sm text-gray-500">
                        Role: <span className={`font-medium ${
                          user.role === 'ADMIN' ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {user.role}
                        </span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {changingPassword === user.id ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded text-sm"
                          placeholder="New password"
                        />
                        <button
                          onClick={() => handleChangePassword(user.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setChangingPassword(null);
                            setNewPassword("");
                          }}
                          className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => setChangingPassword(user.id)}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                        >
                          Change Password
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No users found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserManagement; 