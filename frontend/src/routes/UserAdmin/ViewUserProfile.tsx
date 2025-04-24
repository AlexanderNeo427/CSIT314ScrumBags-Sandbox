import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../css/UserAdmin/ViewUserProfile.css'
import { Link } from 'react-router-dom';
import LogoutModal from '../../components/LogoutModal';
import logo from '../../assets/logo.png';

const ViewUserRoles: React.FC = () => {
  const sessionUser = localStorage.getItem('sessionUser') || 'defaultUser';
  // Logout Modal State
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  // For Update User Profile
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState<{
    currentProfile: string;
    updatedProfile: string;
  }>({
    currentProfile: '',
    updatedProfile: ''
  });
  const [roles, setRoles] = useState<string[]>([]);
  const [error, setError] = useState<string>('');
  const [search, setSearch] = useState<string>(''); // Search state

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/user-profiles/', {
          withCredentials: true,
        });

        const data: string[] = response.data;
        if (Array.isArray(data)) {
          setRoles(data);
        } else {
          console.error('Unexpected server response:', data);
          setError('Unexpected server response.');
        }
      } catch (err) {
        console.error('Failed to fetch roles:', err);
        setError('Could not load roles. Please try again later.');
      }
    };

    fetchRoles();
  }, []);

  // Filter roles based on search
  const filteredRoles = roles.filter(role =>
    role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="user-account-page">
      {/* Navbar */}
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

      {/* Roles Section */}
      {/* User Accounts Section */}
      <div className="account-container">
        <h2>User Profiles</h2>
        <div className="top-row">
          <input
            type="text"
            className="search-bar"
            placeholder="Search by profiles"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="create-btn"><Link to="/create-profile" className="create-btn">Create Profile</Link></button>
        </div>

        {error && <p className="error-message">{error}</p>}
        <table className="user-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Role Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRoles.length > 0 ? (
              filteredRoles.map((role, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{role}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="view-btn">View</button>
                      <button
                        className="edit-btn"
                        onClick={() => {
                          setEditingProfile({ currentProfile: role, updatedProfile: '' });
                          setShowProfileEditModal(true);
                        }}>
                        Edit
                      </button>
                      <button className="delete-btn">Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3}>No roles available.</td>
              </tr>
            )}
          </tbody>
        </table>
        {showProfileEditModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Update User Profile</h2>

              <label>Current Profile:</label>
              <input type="text" value={editingProfile.currentProfile} disabled />

              <label>Updated Profile:</label>
              <input
                type="text"
                value={editingProfile.updatedProfile}
                onChange={e =>
                  setEditingProfile({ ...editingProfile, updatedProfile: e.target.value }
                  )
                }
                required
              />

              <div className="modal-btn-group">
                <button onClick={() => setShowProfileEditModal(false)}>Cancel</button>
                <button
                  onClick={async () => {
                    try {
                      await axios.put('http://localhost:3000/api/user-profiles/update', {
                        oldProfileName: editingProfile.currentProfile,
                        newProfileName: editingProfile.updatedProfile
                      });

                      alert('Profile updated successfully!');
                      setShowProfileEditModal(false);
                      // Optionally refetch profiles here if needed
                    } catch (err) {
                      console.error(err);
                      alert('Update failed!');
                    }
                  }}
                >
                  Save Profile
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

export default ViewUserRoles;
