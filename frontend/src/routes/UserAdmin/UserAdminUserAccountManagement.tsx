import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../css/UserAdmin/UserAdminUserAccountManagement.css';
import { Link } from 'react-router-dom';
import LogoutModal from '../../components/LogoutModal';
import logo from '../../assets/logo.png';

interface UserAccountResponse {
  id: number | null;
  username: string;
  userProfile: string;
  isSuspended: boolean;
}

const UserAdminUserAccountManagement: React.FC = () => {
  const sessionUser = localStorage.getItem('sessionUser') || 'defaultUser';
  const [confirmSuspendModal, setConfirmSuspendModal] = useState<{ show: boolean; user: UserAccountResponse | null }>({
    show: false,
    user: null
  });
  const [newStatus, setNewStatus] = useState<'Active' | 'Suspended'>('Active');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
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

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/user-accounts', { withCredentials: true });
      const data: UserAccountResponse[] = response.data;
      if (Array.isArray(data)) setUsers(data);
      else setError('Unexpected server response.');
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Could not load users. Please try again later.');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const confirmSuspendAction = async () => {
    if (!confirmSuspendModal.user?.id) return;
  
    try {
      await axios.post(
        `http://localhost:3000/api/user-accounts/${newStatus === 'Active' ? 'unsuspend' : 'suspend'}`,
        { id: confirmSuspendModal.user.id },
        { withCredentials: true }
      );
      setConfirmSuspendModal({ show: false, user: null });
      await fetchUsers();
    } catch (error) {
      console.error('Failed to toggle suspension:', error);
      setError('Action failed!');
    }
  };

  return (
    <div className="user-account-page">
      <div className="header_container">
        <img src={logo} alt="Logo" height={40} />
        <h2><Link to="/admin-dashboard">Home</Link></h2>
        <h2><Link to="/user-account-management">User Account</Link></h2>
        <h2><Link to="/ViewUserProfile">User Profile</Link></h2>
        <h2 id="logout_button" onClick={() => setShowLogoutModal(true)} style={{ cursor: 'pointer' }}>
          <span style={{ marginRight: '8px' }}>👤</span>{sessionUser}/Logout
        </h2>
      </div>

      <LogoutModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} />

      <div className="account-container">
        <h2>User Accounts</h2>
        <div className="top-row">
          <input
            type="text"
            className="search-bar"
            placeholder="Search by username"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={async (e) => {
              if (e.key === 'Enter') {
                if (!search.trim()) {
                  fetchUsers();
                  return;
                }
                try {
                  const res = await axios.get(`http://localhost:3000/api/user-accounts/search?search=${search}`, {
                    withCredentials: true
                  });
                  setUsers([res.data]);
                } catch (err: any) {
                  if (err.response?.status === 404) setUsers([]);
                  else {
                    console.error('Search failed:', err);
                    setError('Search failed. Try again.');
                  }
                }
              }
            }}
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
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? users.map((user, index) => (
              <tr key={index}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.userProfile}</td>
                <td style={{ color: user.isSuspended ? 'red' : 'green', fontWeight: 'bold' }}>
                  {user.isSuspended ? 'Suspended' : 'Active'}
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="view-btn"><Link to="/">👁️</Link></button>
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
                    >📝</button>
                    <button
                      className={user.isSuspended ? "unsuspend-btn" : "suspend-btn"}
                      onClick={() => {
                        setConfirmSuspendModal({ show: true, user });
                        setNewStatus(user.isSuspended ? 'Active' : 'Suspended');
                      }}
                    >
                      {user.isSuspended ? '🚫' : '🗑️'}
                    </button>
                  </div>
                </td>
              </tr>
            )) : <tr><td colSpan={5}>No users available.</td></tr>}
          </tbody>
        </table>

        {/* Suspend Modal */}
        {confirmSuspendModal.show && confirmSuspendModal.user && (
  <div className="modal-overlay">
    <div className="modal">
      <h2>
        Are you sure you want to {newStatus === 'Active' ? 'unsuspend' : 'suspend'} user account
        <br />"<b>{confirmSuspendModal.user.username}</b>"?
      </h2>

      <select
        value={newStatus}
        onChange={(e) => setNewStatus(e.target.value as 'Active' | 'Suspended')}
        style={{ width: '100%', marginTop: '1rem' }}
      >
        <option value="Active">Active</option>
        <option value="Suspended">Suspended</option>
      </select>

      <div className="modal-btn-group" style={{ marginTop: '1.5rem' }}>
        <button onClick={() => setConfirmSuspendModal({ show: false, user: null })}>Cancel</button>
        <button onClick={confirmSuspendAction} className="submit-btn">Update Status</button>
      </div>
    </div>
  </div>
)}

        {/* Edit Modal remains unchanged */}
        {showEditModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Update User Account</h2>
              <label>Update As:</label>
              <select value={editingUser.role} onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}>
                <option value="">Select Role</option>
                <option value="cleaner">Cleaner</option>
                <option value="homeowner">Homeowner</option>
                <option value="platform manager">Platform Manager</option>
                <option value="user admin">User Admin</option>
              </select>
              <label>Username:</label>
              <input type="text" value={editingUser.username} onChange={e => setEditingUser({ ...editingUser, username: e.target.value })} required />
              <label>Password:</label>
              <input type="password" value={editingUser.password} onChange={e => setEditingUser({ ...editingUser, password: e.target.value })} required />
              <label>Confirm Password:</label>
              <input type="password" value={editingUser.confirmPassword} onChange={e => setEditingUser({ ...editingUser, confirmPassword: e.target.value })} required />
              <div className="modal-btn-group">
                <button className="cancel-btn" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button className="submit-btn" onClick={async () => {
                  if (editingUser.password !== editingUser.confirmPassword) {
                    alert("Passwords do not match!"); return;
                  }
                  try {
                    await axios.post('http://localhost:3000/api/user-accounts/update', {
                      userId: editingUser.id,
                      updatedAs: editingUser.role,
                      updatedUsername: editingUser.username,
                      updatedPassword: editingUser.password
                    }, { withCredentials: true });
                    alert('User updated successfully');
                    await fetchUsers();
                    setShowEditModal(false);
                  } catch (error) {
                    console.error('Failed to update user:', error);
                    alert('Failed to update user. Please try again.');
                  }
                }}>Update Account</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="footer">
        <b>© Copyright 2025 Easy & Breezy - All Rights Reserved</b>
      </div>
    </div>
  );
};

export default UserAdminUserAccountManagement;