import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import LogoutModal from '../../components/LogoutModal'
import logo from '../../assets/logo.png'
import axios from 'axios'

interface UserAccountResponse {
  id: number
  username: string
  userProfile: string
}

interface History {
  bookingId: number
  cleanerName: string | null
  typeOfService: string | null
  homeowner: string | null
  date: Date
}

const ViewCleanerServiceHistoryPage: React.FC = () => {
  const sessionUser: UserAccountResponse = JSON.parse(localStorage.getItem('sessionObject') || '{}')

  // Variables
  const [history, setHistory] = useState<History[]>([]) // Array of service history
  const [services, setServices] = useState<{ serviceName: string }[]>([]) // Array of services available

  // Filter variables
  const [serviceName, setServiceName] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [search, setSearch] = useState('')

  // Popup modals
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-')
    return `${month}/${day}/${year}` // MM/DD/YYYY
  }

  // Fetching list of services this cleaner has
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.post(`http://localhost:3000/api/services/${sessionUser.id}`, {
          serviceName: ''
        })
        setServices(response.data)
        console.log(response.data) // Log services returned from the API
      } catch (error) {
        console.error('Error fetching cleaner services:', error)
      }
    }
    fetchServices()
  }, [sessionUser.id])

  // Fetch service history for the logged-in cleaner
  const fetchServiceHist = async () => {
    try {
      // Make the request with session cookie handling
      const response = await axios.post(
        'http://localhost:3000/api/cleaners/serviceHistory',
        {
          cleanerID: sessionUser.id,
          service: serviceName,
          homeownerName: search,
          startDate: fromDate ? formatDate(fromDate) : null,
          endDate: toDate ? formatDate(toDate) : null,
        },
        {
          withCredentials: true, // Ensure session cookies are included with the request
        }
      )

      // Log the response to see its structure
      console.log('Service History Response:', response.data)

      // Assuming the array is inside the 'data' property of the response
      if (Array.isArray(response.data)) {
        const formatted: History[] = response.data.map((item: any) => ({
          bookingId: item.bookingid,
          cleanerName: item.cleanerName,
          typeOfService: item.serviceName,
          homeowner: item.homeOwnerName,
          date: item.date
        }))

        setHistory(formatted) // Update the history state
      } else {
        setHistory([])
        console.error('Failed to fetch service history: response data is not an array')
      }
    } catch (error) {
      console.error('Error fetching service history:', error)
    }
  }

  useEffect(() => {
    fetchServiceHist()
  }, [sessionUser.id])

  return (
    <div className="page-container">
      <div className="header-container">
        <div>
          <img src={logo} alt="Logo" height={40} />
          <h2><Link to="/cleaner-dashboard">Home</Link></h2>
          <h2><Link to="/cleaner-view-services">My Services</Link></h2>
          <h2><Link to="/cleaner-view-bookings">My Bookings</Link></h2>
        </div>

        <div>
          <h2 id="logout-button" onClick={() => setShowLogoutModal(true)} style={{ cursor: 'pointer' }}>
            <span style={{ marginRight: '8px' }}>👤</span>{sessionUser.username}/Logout
          </h2>
        </div>

      </div>

      <LogoutModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} />

      <div className="body-container">
        <div className="card">
          <h1>My Bookings</h1>

          {/* Top Bar Filters */}
          <div className="top-bar2">
            <select
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
            >
              <option value="">Select Service</option>
              {services.map((service, index) => (
                <option key={index} value={service.serviceName}>
                  {service.serviceName}
                </option>
              ))}
            </select>

            <div className="date-range">
              <label>From:</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
              <label>To:</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>

            <input
              type="text"
              placeholder="🔍 Search...."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button onClick={() => fetchServiceHist()}>Search</button>
          </div>

          {/* Table */}
          <table>
            <thead>
              <tr>
                <th><b>ID</b></th>
                <th><b>Services</b></th>
                <th><b>Date</b></th>
                <th><b>Homeowner Name</b></th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td>No history found for the selected filters.</td>
                </tr>
              ) : (
                history.map((service, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{service.typeOfService}</td>
                    <td>{new Date(service.date).toLocaleDateString('en-GB')}</td>
                    <td>{service.homeowner}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <footer className="footer-container">
        © Copyright 2025 Easy & Breezy - All Rights Reserved
      </footer>
    </div>
  )
}

export default ViewCleanerServiceHistoryPage
