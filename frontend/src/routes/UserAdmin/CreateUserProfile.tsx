import React, { useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import logo from '../../assets/logo.png';
import LogoutModal from '../../components/LogoutModal';

const CreateProfilePage: React.FC = () => {
  const sessionUser = localStorage.getItem('sessionUser') || 'defaultUser';
  const [profileName, setProfileName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()
  // Logout Modal State
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await axios.post('http://localhost:3000/api/user-profiles', {
        profileName: profileName
      },
        { withCredentials: true }
      )

      if (response.data.message === 'Success') {
        console.log('response.data:', response.data);
        setSuccess('Profile created successfully!🥳')
        setProfileName('')
      } else {
        console.log('response.data:', response.data);
        setError('Failed to create account. Please try again.😢')
        setSuccess('')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong.😡')
      console.log({ profileName });
      setSuccess('')
    }
  }

  return (
    <div className="user-profile-page">
      {/* Navbar */}
      <div className="create_container">
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

        {/* Left Side */}
        <div className="left_side">
          <h1>Experience a New Level of Clean</h1>
          <p>
            Create an profile to allow accounts to be tagged to that profile.
          </p>
        </div>

        {/* Right Side */}
        <div className="right_side">
          <form className="create_form" onSubmit={handleCreateProfile}>
            <h2>Create User Profile</h2>
            <p>Please enter your details</p>

            {error && <p className="error_msg">{error}</p>}
            {success && <p className="success_msg">{success}</p>}

            <label>Enter User Profile name:</label>
            <div className="input_group">
              <input
                type="text"
                placeholder="User Profile name"
                value={profileName}
                onChange={e => setProfileName(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="create_btn">
              Save Profile
            </button>
            <button
              type="button"
              className="cancel_btn"
              onClick={() => {
                setProfileName('')
                setError('')
                setSuccess('')
                navigate('/ViewUserProfile')
              }}
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateProfilePage