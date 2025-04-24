import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import LogoutModal from '../../components/LogoutModal';
import logo from '../../assets/logo.png';

const ViewCleanerService: React.FC = () => {
  const sessionUser = localStorage.getItem('sessionUser') || 'defaultUser';
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  // Logout Modal State
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/user-accounts/cleaners', {
          withCredentials: true,
        });

        const data = response.data;
        console.log(data);
        setUsers(data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setError('Could not load users. Please try again later.');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filtering by cleaner's name
  const filteredUsers = users.filter(user =>
    typeof user.cleaner === 'string' &&
    user.cleaner.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="user-account-page">
      {/* Navbar */}
      <div className="header_container">
        <img src={logo} alt="Logo" height={40} />
        <h2><Link to="/homeowner-dashboard">Home</Link></h2>
        <h2><Link to="/ViewCleanerService">View All Cleaners</Link></h2>
        <h2><Link to="/">My Bookings</Link></h2>
        <h2><Link to="/ViewServiceHistory">My History</Link></h2>
        <h2><Link to="/ViewShortlist">My Shortlist</Link></h2>
        <h2 id="logout_button" onClick={() => setShowLogoutModal(true)} style={{ cursor: 'pointer' }}>
          <span style={{ marginRight: '8px' }}>👤</span>{sessionUser}/Logout
        </h2>
      </div>
      {/* Logout Modal */}
      <LogoutModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} />
      {/* User Accounts Section */}
      <div className="account-container">
        <h2>Cleaners' Services</h2>

        {error && <div className="error-message">{error}</div>}

        <div className="top-row">
          <input
            type="text"
            className="search-bar"
            placeholder="Search by cleaner name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="loading">Loading cleaners...</div>
        ) : (
          <table className="user-table">
            <thead>
              <tr>
                <th>Cleaner</th>
                <th>Type of Service</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.slice(0, 30).length > 0 ? (
                filteredUsers.slice(0, 30).map((user, index) => (
                  <tr key={index}>
                    <td>{user.cleaner}</td>
                    <td>{user.service}</td>
                    <td>${user.price?.toFixed(2)}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="edit-btn">Fav</button>
                        <button className="delete-btn">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4}>No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      <div className="footer">
        <b>© Copyright 2025 Easy & Breezy - All Rights Reserved</b>
      </div>
    </div>
  );
};

export default ViewCleanerService;
