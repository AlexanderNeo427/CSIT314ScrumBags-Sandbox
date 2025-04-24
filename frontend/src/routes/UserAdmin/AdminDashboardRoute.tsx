import React, { useState } from 'react';
import logo from '../../assets/logo.png';
import '../../css/UserAdmin/AdminDashboardRoute.css';
import { Link } from 'react-router-dom';
import LogoutModal from '../../components/LogoutModal';

const AdminDashboard: React.FC = () => {
  const sessionUser = localStorage.getItem('sessionUser') || 'defaultUser';
  // Logout Modal State
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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
      <h2>Welcome back, {sessionUser}!!</h2>
      {/* Footer */}
      <div className="footer">
        <b>© Copyright 2025 Easy & Breezy - All Rights Reserved</b>
      </div>
    </div>
  );
};

export default AdminDashboard;
