import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LogoutModal from '../../components/LogoutModal';
import logo from '../../assets/logo.png';

const ViewCleanerService: React.FC = () => {
  const sessionUser = localStorage.getItem('sessionUser') || 'defaultUser';
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [cleanerName, setCleaner] = useState<string>('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const fetchUsers = async (name: string) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:3000/api/user-accounts/cleaners', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cleanerName: name }),
      });
      const json = await response.json();
      setUsers(json);
    } catch (error) {
      console.error('Error loading cleaners:', error);
      setError('Could not load users. Please try again later.');
    }
    setLoading(false);
  };

  // Load all cleaners on page load
  useEffect(() => {
    fetchUsers('');
  }, []);

  const handleSearch = () => {
    fetchUsers(cleanerName);
  };

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

      {/* Cleaners' Services */}
      <div className="account-container">
        <h2>Cleaners' Services</h2>

        {error && <div className="error-message">{error}</div>}

        <div className="top-row">
          <input
            type="text"
            className="search-bar"
            placeholder="Search by cleaner name"
            value={cleanerName}
            onChange={(e) => setCleaner(e.target.value)}
          />
          <button onClick={handleSearch} className="search-button">Search</button>
        </div>

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
              {users.length > 0 ? (
                users.slice(0, 30).map((user, index) => (
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
