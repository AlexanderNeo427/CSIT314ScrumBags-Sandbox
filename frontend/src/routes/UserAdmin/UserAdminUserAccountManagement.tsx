import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../css/UserAdmin/UserAdminUserAccountManagement.css'
import { Link } from 'react-router-dom';
import LogoutModal from '../../components/LogoutModal';
import logo from '../../assets/logo.png';

// Define the type for the response data
interface UserAccountResponse {
  id: number | null;
  username: string;
  userProfile: string;
  isSuspended: boolean;
}

const UserAdminUserAccountManagement: React.FC = () => {
  const sessionUser = localStorage.getItem('sessionUser') || 'defaultUser';

  // Logout Modal State
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // For Update User Account
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<{
    id: number | null;
    username: string;
    role: string;
    password: string;
    confirmPassword: string;
  }>({
    id: null,
    username: '',
    role: '',
    password: '',
    confirmPassword: ''
  });

  const [users, setUsers] = useState<UserAccountResponse[]>([]);
  const [error, setError] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/user-accounts', {
          withCredentials: true,
        });

        const data: UserAccountResponse[] = response.data;
        console.log(data);

        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          console.error('Unexpected server response:', data);
          setError('Unexpected server response.');
        }
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setError('Could not load users. Please try again later.');
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="user-account-page">
      {/* Header */}
      <div className="header_container">
        <img src={logo} alt="Logo" height={40} />
        <h2><Link to="/admin-dashboard">Home</Link></h2>
        <h2><Link to="/user-account-management">User Account</Link></h2>
        <h2><Link to="/ViewUserProfile">User Profile</Link></h2>
        <h2 id="logout_button" onClick={() => setShowLogoutModal(true)} style={{ cursor: 'pointer' }}>
          <span style={{ marginRight: '8px' }}>👤</span>{sessionUser}/Logout
        </h2>
      </div>

      {/* Logout Modal */}
      <LogoutModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} />

      {/* User Account Management */}
      <div className="account-container">
        <h2>User Accounts</h2>
        <div className="top-row">
          <input
            type="text"
            className="search-bar"
            placeholder="Search by username"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="create-btn">
            <Link to="/create" className="create-btn">Create Account</Link>
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <table className="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Profile</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.userProfile}</td>
                  <td>
                    <span className={user.isSuspended ? 'status-suspended' : 'status-active'}>
                      {user.isSuspended ? 'Suspended' : 'Active'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="view-btn"><Link to="/">View</Link></button>
                      <button
                        className="edit-btn"
                        onClick={() => {
                          setEditingUser({
                            id: user.id,
                            username: user.username,
                            role: user.userProfile || '',
                            password: '',
                            confirmPassword: ''
                          });
                          setShowEditModal(true);
                        }}
                      >
                        Edit
                      </button>
                      <button className="delete-btn"><Link to="/">Delete</Link></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5}>No users available.</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Edit Modal */}
        {showEditModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Update User Account</h2>

              <label>Update As:</label>
              <select
                value={editingUser.role}
                onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}
              >
                <option value="">Select Role</option>
                <option value="cleaner">Cleaner</option>
                <option value="homeowner">Homeowner</option>
                <option value="platform manager">Platform Manager</option>
                <option value="user admin">User Admin</option>
              </select>

              <label>Username:</label>
              <input
                type="text"
                value={editingUser.username}
                onChange={e => setEditingUser({ ...editingUser, username: e.target.value })}
                required />

              <label>Password:</label>
              <input
                type="password"
                value={editingUser.password}
                onChange={e => setEditingUser({ ...editingUser, password: e.target.value })}
                required />

              <label>Confirm Password:</label>
              <input
                type="password"
                value={editingUser.confirmPassword}
                onChange={e => setEditingUser({ ...editingUser, confirmPassword: e.target.value })}
                required />

              <div className="modal-btn-group">
                <button className="cancel-btn" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button
                  className="submit-btn"
                  onClick={async () => {
                    if (editingUser.password !== editingUser.confirmPassword) {
                      alert("Passwords do not match!");
                      return;
                    }

                    try {
                      const response = await axios.post(
                        `http://localhost:3000/api/user-accounts/update`,
                        {
                          userId: editingUser.id,
                          updatedAs: editingUser.role,
                          updatedUsername: editingUser.username,
                          updatedPassword: editingUser.password,
                        },
                        { withCredentials: true }
                      );

                      console.log('User updated:', response.data);
                      alert('User updated successfully');

                      const refreshed = await axios.get('http://localhost:3000/api/user-accounts', {
                        withCredentials: true,
                      });

                      setUsers(refreshed.data);
                      setShowEditModal(false);
                    } catch (error) {
                      console.error('Failed to update user:', error);
                      alert('Failed to update user. Please try again.');
                    }
                  }}
                >
                  Update Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="footer">
        <b>© Copyright 2025 Easy & Breezy - All Rights Reserved</b>
      </div>
    </div>
  );
};

export default UserAdminUserAccountManagement;
