import React, { useState, useEffect } from 'react';
import '../../css/Cleaner/CleanerViewMyBookings.css';
import { Link } from 'react-router-dom';
import LogoutModal from '../../components/LogoutModal';
import logo from '../../assets/logo.png';
import axios from 'axios';

interface UserAccountResponse {
  id: number;
  username: string;
  userProfile: string;
}

//testing
interface History {
  bookingId: number;
  cleanerName: string | null;
  typeOfService: string | null;
  homeowner: string | null;
  date: Date;
  status: string;
}

const CleanerViewMyBookings: React.FC = () => {
  const sessionUser: UserAccountResponse = JSON.parse(localStorage.getItem('sessionObject') || '{}');

  const [services, setServices] = useState<{ serviceName: string }[]>([]);
  const [serviceName, setServiceName] = useState('');
  const [homeowner, sethomeowner] = useState('');
  const [bookingId, setbookingId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [history, setHistory] = useState<History[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Confirmed' | 'Cancelled'>('All');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.post(`http://localhost:3000/api/services/${sessionUser.id}`, {
          serviceName: ''
        });
        setServices(response.data);
        console.log(response.data); // Log services returned from the API
      } catch (error) {
        console.error('Error fetching cleaner services:', error);
      }
    };
    fetchServices();
  }, [sessionUser.id]);

  // Fetch service history for the logged-in cleaner
  const fetchServiceHist = async (statusFilter?: string) => {
    try {
      // Make the request with session cookie handling
      const response = await axios.post(
        'http://localhost:3000/api/cleaners/servicehistory',
        {
          cleanerId: sessionUser.id,
          bookingid: bookingId,
          service: serviceName || search,
          homeOwnerName: homeowner,
          fromDate: fromDate ? formatDate(fromDate) : null,
          toDate: toDate ? formatDate(toDate) : null,
          status: statusFilter ?? null,
        },
        {
          withCredentials: true, // Ensure session cookies are included with the request
        }
      );

      // Log the response to see its structure
      console.log('Service History Response:', response.data);

      // Assuming the array is inside the 'data' property of the response
      if (Array.isArray(response.data)) {
        const formatted: History[] = response.data.map((item: any) => ({
          bookingId: item.bookingid,
          cleanerName: item.cleanerName,
          typeOfService: item.serviceName,
          homeowner: item.homeOwnerName,
          date: item.date,
          status: item.status,
        }));

        setHistory(formatted); // Update the history state
      } else if (Array.isArray(response.data.data)) {
        // Handle case where the array is inside response.data.data
        const formatted: History[] = response.data.data.map((item: any) => ({
          bookingId: item.bookingid,
          cleanerName: item.cleanerName,
          typeOfService: item.serviceName,
          homeowner: item.homeOwnerName,
          price: item.price,
          date: item.date,
          status: item.status,
        }));

        setHistory(formatted); // Update the history state
      } else {
        setHistory([]);
        console.error('Failed to fetch service history: response data is not an array');
      }
    } catch (error) {
      console.error('Error fetching service history:', error);
    }
  };

  useEffect(() => {
    fetchServiceHist();
  }, [sessionUser.id]);

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-');
    return `${month}/${day}/${year}`; // MM/DD/YYYY
  };

  const filteredHistory = filterStatus === 'All'
    ? history
    : history.filter(item => item.status?.toLowerCase() === filterStatus.toLowerCase());

  const countStatus = (status: 'Pending' | 'Confirmed' | 'Cancelled') =>
    history.filter(item => item.status?.toLowerCase() === status.toLowerCase()).length;

  return (
    <div className="view-mybooking-container">
      <div className="header_container">
        <img src={logo} alt="Logo" height={40} />
        <h2><Link to="/cleaner-dashboard">Home</Link></h2>
        <h2><Link to="/cleaner-view-services">My Services</Link></h2>
        <h2><Link to="/cleaner-view-bookings">My Bookings</Link></h2>
        <h2 id="logout_button" onClick={() => setShowLogoutModal(true)} style={{ cursor: 'pointer' }}>
          <span style={{ marginRight: '8px' }}>👤</span>{sessionUser.username}/Logout
        </h2>
      </div>

      <LogoutModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} />

      <div className="content-center">
        <div className="card">
          <h1>My Bookings</h1>

          {/* Status Tabs */}
          <div className="status-tabs">
            <span className={`tab ${filterStatus === 'All' ? 'active' : ''}`} onClick={() => setFilterStatus('All')}>
              All Bookings ({history.length})
            </span>
            <span className={`tab ${filterStatus === 'Pending' ? 'active' : ''}`} onClick={() => setFilterStatus('Pending')}>
              Pending ({countStatus('Pending')})
            </span>
            <span className={`tab ${filterStatus === 'Confirmed' ? 'active' : ''}`} onClick={() => setFilterStatus('Confirmed')}>
              Confirmed ({countStatus('Confirmed')})
            </span>
            <span className={`tab ${filterStatus === 'Cancelled' ? 'active' : ''}`} onClick={() => setFilterStatus('Cancelled')}>
              Cancelled ({countStatus('Cancelled')})
            </span>
          </div>

          {/* Top Bar Filters */}
          <div className="top-bar">
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
                <th><b>Status</b></th>
                <th><b>Date</b></th>
                <th><b>Home Owner</b></th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center' }}>No history found for the selected filters.</td>
                </tr>
              ) : (
                filteredHistory.map((service, index) => (
                  <tr key={index}>
                    <td>{service.bookingId}</td>
                    <td>{service.typeOfService}</td>
                    <td>{service.status}</td>
                    <td>{new Date(service.date).toLocaleDateString('en-GB')}</td>
                    <td>{service.homeowner}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <footer className="footer">
        © Copyright 2025 Easy & Breezy - All Rights Reserved
      </footer>
    </div>
  );
};

export default CleanerViewMyBookings;
