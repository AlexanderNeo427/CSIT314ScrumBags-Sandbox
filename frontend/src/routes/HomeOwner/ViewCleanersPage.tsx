import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import LogoutModal from '../../components/LogoutModal'
import logo from '../../assets/logo.png'

const ViewCleanersPage: React.FC = () => {
  const sessionUser = localStorage.getItem('sessionUser') || 'defaultUser'
  const [cleanerServices, setCleanerServices] = useState<any[]>([])
  const [error, setError] = useState<string>('')
  const [cleanerName, setCleaner] = useState<string>('')
  const [currentServiceID, setCurrentServiceID] = useState('')

  // Popup modals
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [addToShortlistModal, setAddToShortlistModal] = useState(false)

  // Alex: Commented out for now, to ensure build/tests pass ----
  //       Unused variables prevent the project from building ._.
  // const [showViewCleanerModal, setShowViewCleanerModal] = useState(false)

  const handleShortlist = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/homeowner/shortlist', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceProvidedID: currentServiceID
        }),
      })
      if(!response.ok){
        alert('Service is already shortlisted')
      } else {
        alert('Service shortlisted')
      }
      await response
      setAddToShortlistModal(false)
    } catch (error) {
      alert("Service already shortlisted")
    }
  }

  const fetchUsers = async (name: string) => {
    setError('')
    try {
      const response = await fetch('http://localhost:3000/api/user-accounts/cleaners', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cleanerName: name }),
      })
      const json = await response.json()
      console.log(json)
      setCleanerServices(json)
    } catch (error) {
      console.error('Error loading cleaners:', error)
      setError('Could not load users. Please try again later.')
    }
  }

  // Load all cleaners on page load
  useEffect(() => {
    fetchUsers('')
  }, [])

  const handleSearch = () => {
    fetchUsers(cleanerName)
  }



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

      {addToShortlistModal && (
        <div className='modal-overlay'>
          <div className='modal'>
            <h3>Add to shortlist?</h3>

            <div className="modal-buttons">
              <button onClick={() => handleShortlist()}>Yes</button>
              <button onClick={() => setAddToShortlistModal(false)}>No</button>
            </div>
          </div>
        </div>
      )}

      {/* {showViewCleanerModal && (
        <div className='modal-overlay'>
          <div className='modal'>
            <p>This is empty for now, our user story is to view cleaner service, we already have a bce to view each service provided but its under cleaner should we do it?</p>

            <div className="modal-buttons">
              <button onClick={() => setShowViewCleanerModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )} */}

      <div className="body-container">
        <div className="card">
          <h2>Cleaners' Services</h2>

          {error && <div className="error-message">{error}</div>}

          <div className="top-bar">
            <input
              type="text"
              className="search-bar"
              placeholder="Search by cleaner name"
              value={cleanerName}
              onChange={(e) => setCleaner(e.target.value)}
            />
            <button onClick={handleSearch} className="search-button">Search</button>
          </div>


          <table>
            <thead>
              <tr>
                <th>Cleaner</th>
                <th>Type of Service</th>
                <th>Price</th>
                <th id="actionCol">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cleanerServices.length === 0 ? (
                <tr>
                  <td>No users found</td>
                </tr>
              ) : (
                cleanerServices.map((service, index) => (
                  <tr key={index}>
                    <td>{service.cleaner}</td>
                    <td>{service.service}</td>
                    <td>${service.price?.toFixed(2)}</td>
                    <td>
                      <div className="action-buttons">
                        {/* <button
                          className="view-btn"
                          onClick={() => {
                            setCurrentServiceID(service.serviceProvidedID)
                            setShowViewCleanerModal(true)
                          }}>
                          View
                        </button> */}
                        <button
                          className="shortlist-btn"
                          onClick={() => {
                            setCurrentServiceID(service.serviceProvidedID)
                            setAddToShortlistModal(true)
                          }}>
                          Shortlist
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="footer-container">
        <b>© Copyright 2025 Easy & Breezy - All Rights Reserved</b>
      </div>
    </div>
  )
}

export default ViewCleanersPage
