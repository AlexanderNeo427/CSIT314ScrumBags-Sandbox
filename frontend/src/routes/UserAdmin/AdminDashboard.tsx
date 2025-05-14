import React, { useState } from 'react'
import logo from '../../assets/logo.png'
import { Link } from 'react-router-dom'
import LogoutModal from '../../components/LogoutModal'

const AdminDashboard: React.FC = () => {
  const sessionUser = localStorage.getItem('sessionUser') || 'defaultUser'
  // Logout Modal State
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  return (
    <div className="page-container">
      {/* Header */}
      <div className="header-container">
        <div>
          <img src={logo} alt="Logo" height={40} />
          <h2><Link to="/admin-dashboard">Home</Link></h2>
          <h2><Link to="/user-account-management">User Account</Link></h2>
          <h2><Link to="/ViewUserProfile">User Profile</Link></h2>
        </div>
        
        <div>
          <h2 id="logout_button" onClick={() => setShowLogoutModal(true)} style={{ cursor: 'pointer' }}>
            <span style={{ marginRight: '8px' }}>👤</span>{sessionUser}/Logout
          </h2>
        </div>
      </div>

      {/* Logout Modal */}
      <LogoutModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} />
      
      <div className="body-container">
        <h2>Welcome back, {sessionUser}!!</h2>
      </div>

      {/* Footer */}
      <div className="footer-container">
        <b>© Copyright 2025 Easy & Breezy - All Rights Reserved</b>
      </div>
    </div>
  )
}

export default AdminDashboard
