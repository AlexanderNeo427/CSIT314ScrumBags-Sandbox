import React, { useState, useEffect } from 'react';
import '../../css/HomeOwner/HomeOwnerViewHistory.css';
import { Link } from 'react-router-dom';
import LogoutModal from '../../components/LogoutModal';
import logo from '../../assets/logo.png';

interface UserAccountResponse {
  id: number
  username: string
  userProfile: string
}

interface History {
  cleanerName: string
  typeOfService: string
  price: number
  date: Date
  status: string
}

const HomeOwnerViewHistory: React.FC = () => {
  const sessionUser: UserAccountResponse = JSON.parse(localStorage.getItem('sessionObject') || '{}');

  const [history, setHistory] = useState<History[]>([])
  const [search, setSearch] = useState('');
  // Logout Modal State
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/homeowner/allservicehistory`, {
          method: 'GET',
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Failed to fetch services history');
        }

        const json = await response.json();
        // console.log('Fetched service history:', data); // Debugging log

        const formatted: History[] = json.data.map((item: any) => ({
          cleanerName: item.cleanerName,
          typeOfService: item.serviceName,
          price: item.price,
          date: item.date,
          status: item.status
        }));

        setHistory(formatted);
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };

    fetchServices();
  }, [sessionUser.id]);



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
            <input
              type="text"
              placeholder="🔍 Search...."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />

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
              {history
                .filter(h =>
                  h.cleanerName.toLowerCase().includes(search.toLowerCase()) ||
                  h.typeOfService.toLowerCase().includes(search.toLowerCase())
                )
                .map((service, index) => (
                  <tr key={index}>
                    <td>{service.cleanerName}</td>
                    <td>{service.typeOfService}</td>
                    <td>${service.price.toFixed(2)}</td>
                    <td>{new Date(service.date).toLocaleDateString()}</td>
                  </tr>
                ))}
            </tbody>
          </table>

        </div>
      </div>

      <footer className="footer">
        © Copyright 2025 Easy & Breezy - All Rights Reserved
      </footer>
    </div>
  )
}

export default HomeOwnerViewHistory