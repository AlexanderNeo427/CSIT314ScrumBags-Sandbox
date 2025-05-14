import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import LogoutModal from '../../components/LogoutModal'
import logo from '../../assets/logo.png'

interface shortlistView {
  cleanerName: string
  serviceName: string
}

const ViewShortlistPage: React.FC = () => {
  const sessionUser = localStorage.getItem('sessionUser') || 'defaultUser'

  const [shortlist, setShortlist] = useState<shortlistView[]>([])
  const [search, setSearch] = useState<string>('')

  // Logout Modal State
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const fetchUsers = async () => {
    try {
      // Added by Alex (delete this comment in future)
      // Copypasta these lines below to conditionally include the 'search' query params
      const queryParams = new URLSearchParams()
      queryParams.append('search', search.trim())
      console.log(queryParams)
      const response = await axios.get(`http://localhost:3000/api/homeowner/shortlist/`, {
        params: queryParams,
        withCredentials: true,
      })

      // Assuming the backend returns { message: 'Shortlist retrieved successfully', data: ['user2', 'User5'] }
      const data: shortlistView[] = response.data // Access the data property
      console.log(data)  // Log the data to verify structure
      setShortlist(data)  // Set the users list with the fetched data
    } catch (err) {
      console.error('Failed to fetch users:', err)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])  // Empty dependency array ensures this runs once when the component mounts

  return (
    <div className="page-container">
      <div className="header-container">
        <div>
          <img src={logo} alt="Logo" height={40} />
          <h2><Link to="/homeowner-dashboard">Home</Link></h2>
          <h2><Link to="/ViewCleanerService">View All Cleaners</Link></h2>
          <h2><Link to="/ViewServiceHistory">My History</Link></h2>
          <h2><Link to="/ViewShortlist">My Shortlist</Link></h2>
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
        <div className="card">
          <h2>View Shortlist</h2>

          <div className="top-bar">
            <input
              type="text"
              className="search-bar"
              placeholder="Search by cleaner name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button onClick={fetchUsers} className="search-button">Search</button>
          </div>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Type of Service</th>
              </tr>
            </thead>
            <tbody>
              {shortlist.length > 0 ? (
                shortlist.map((user, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{user.cleanerName}</td>
                    <td>{user.serviceName}</td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td>Your shortlist is currently empty</td>  {/* Message when no users are found */}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="footer-container">
        <b>© Copyright 2025 Easy & Breezy - All Rights Reserved</b>
      </div>
    </div>
  )
}

export default ViewShortlistPage
