import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import LogoutModal from '../../components/LogoutModal';
import logo from '../../assets/logo.png';

const ViewShortlist: React.FC = () => {
  const sessionUser = localStorage.getItem('sessionUser') || 'defaultUser';
  const [users, setUsers] = useState<string[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  // Logout Modal State
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Replace with the correct URL for fetching shortlist data
        const response = await axios.get('http://localhost:3000/api/homeowner/', {
          withCredentials: true,
        });

        // Assuming the backend returns { message: 'Shortlist retrieved successfully', data: ['user2', 'User5'] }
        const data: string[] = response.data.data;  // Access the data property
        console.log(data);  // Log the data to verify structure
        setUsers(data);  // Set the users list with the fetched data
        setLoading(false);  // Stop the loading spinner
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setError('Could not load users. Please try again later.');
        setLoading(false);  // Stop loading on error
      }
    };

    fetchUsers();
  }, []);  // Empty dependency array ensures this runs once when the component mounts

  return (
    <div className="ViewShortListPageContainer">
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
        <h2>View Shortlist</h2>

        {error && <div className="error-message">{error}</div>}  {/* Display error message if any */}

        {/* Loading Spinner */}
        {loading ? (
          <div className="loading">Loading cleaners...</div>
        ) : (
          <table className="user-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{user}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="view-btn">View</button>
                        <button className="edit-btn">Edit</button>
                        <button className="delete-btn">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3}>No users found</td>  {/* Message when no users are found */}
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

export default ViewShortlist;
