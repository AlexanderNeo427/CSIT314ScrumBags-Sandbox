import React, { useState, useEffect } from 'react';
import '../../css/HomeOwner/HomeOwnerViewHistory.css';
import { Link } from 'react-router-dom';
import LogoutModal from '../../components/LogoutModal';
import logo from '../../assets/logo.png';
import axios from 'axios';

interface UserAccountResponse {
  id: number;
  username: string;
  userProfile: string;
}

interface History {
  cleanerName: string | null;
  typeOfService: string | null;
  price: string | null;
  date: Date;
  status: string;
}

const HomeOwnerViewHistory: React.FC = () => {
  const sessionUser: UserAccountResponse = JSON.parse(localStorage.getItem('sessionObject') || '{}');

  const [services, setServices] = useState<{ serviceName: string }[]>([]);
  const [serviceName, setServiceName] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [history, setHistory] = useState<History[]>([]);
  const [search, setSearch] = useState('');

  const formatDate = (dateString: string) => {
    if (!dateString) return null;
    const [year, month, day] = dateString.split('-'); // ["2024", "04", "27"]
    return `${month}/${day}/${year}`; // "04/27/2024" => MM/DD/YYYY ✅
  };

  // Logout Modal State
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Fetch unique services from the backend
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/services/');
        setServices(response.data);
        console.log(response.data);
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };
    fetchServices();
  }, []);

  const fetchServiceHist = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/homeowner/servicehistory', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cleanerName: search,
          service: serviceName,
          fromDate: fromDate ? formatDate(fromDate) : null,
          toDate: toDate ? formatDate(toDate) : null,
        }),
      });

      if (!response.ok) {
        setHistory([])
        throw new Error('Failed to fetch service history');
      }

      const json = await response.json();

      const formatted: History[] = json.data.map((item: any) => ({
        cleanerName: item.cleanerName,
        typeOfService: item.serviceName,
        price: item.price,
        date: item.date,
        status: item.status,
      }));

      setHistory(formatted);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };


  // Fetch service history on page load
  useEffect(() => {
    fetchServiceHist();
  }, []);

  return (
    <div className="view-history-container">
      <div className="header_container">
        <img src={logo} alt="Logo" height={40} />
        <h2><Link to="/homeowner-dashboard">Home</Link></h2>
        <h2><Link to="/ViewCleanerService">View All Cleaners</Link></h2>
        <h2><Link to="/">My Bookings</Link></h2>
        <h2><Link to="/ViewServiceHistory">My History</Link></h2>
        <h2><Link to="/ViewShortlist">My Shortlist</Link></h2>
        <h2 id="logout_button" onClick={() => setShowLogoutModal(true)} style={{ cursor: 'pointer' }}>
          <span style={{ marginRight: '8px' }}>👤</span>{sessionUser.username}/Logout
        </h2>
      </div>
      {/* Logout Modal */}
      <LogoutModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} />
      <div className="content-center">
        <div className="card">
          <h1>View History</h1>

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
            <button onClick={fetchServiceHist}>Search</button>
          </div>

          <table>
            <thead>
              <tr>
                <th><b>Cleaner Name</b></th>
                <th><b>Type of Service</b></th>
                <th><b>Price</b></th>
                <th><b>Date</b></th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan={4}>No history found for the selected filters.</td>
                </tr>
              ) : (
                history.map((service, index) => (
                  <tr key={index}>
                    <td>{service.cleanerName}</td>
                    <td>{service.typeOfService}</td>
                    <td>${service.price}</td>
                    <td>{new Date(service.date).toLocaleDateString('en-GB')}</td>
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

export default HomeOwnerViewHistory;
