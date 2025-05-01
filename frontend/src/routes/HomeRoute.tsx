import React from 'react'
import { useNavigate } from 'react-router-dom'

const HomeRoute: React.FC = () => {
  const navigate = useNavigate()

  const goToLogin = () => {
    navigate('/login')
  }

  const goToCreate = () => {
    navigate('/create')
  }

  const goToCleanerDashboard = () => {
    navigate('/cleaner-dashboard')
  }

  const goToPlatformManagerDashboard = () => {
    navigate('/platformManager-dashboard')
  }
  const goToAdminDashboard = () => {
    navigate('/admin-dashboard')
  }
  const goToCreateProfile = () => {
    navigate('/create-profile')
  }
  const goToCleanerViewSevices = () => {
    navigate('/cleaner-view-services')
  }
  const goToViewReportPage = () => {
    navigate('/platformManager-view-report')
  }
  const goToUserAdminUserAccountManagement = () => {
    navigate('/user-account-management')
  }
  const goToCleanerViewBookings = () => {
    navigate('/cleaner-view-bookings')
  }
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        gap: '1rem',
      }}
    >
      <h2>The beginning of a multi-million dollar cleaning service venture</h2>
      <button onClick={goToLogin}>Go to Login</button>
      <button onClick={goToCreate}>Go to Create</button>
      <button onClick={goToCreateProfile}>Go to Create Profile</button>
      <button onClick={goToCleanerDashboard}>Go to Cleaner</button>
      <button onClick={goToPlatformManagerDashboard}>Go to Platform Manager</button>
      <button onClick={goToAdminDashboard}>Go to User Admin</button>
      <button onClick={goToCleanerViewSevices}>Go to Cleaner View Services</button>
      <button onClick={goToViewReportPage}>Go to View Report Page</button>
      <button onClick={goToUserAdminUserAccountManagement}>Go to User Account Management</button>
      <button onClick={goToCleanerViewBookings}>Go to Cleaners My Booking</button>
    </div>
  )
}

export default HomeRoute
