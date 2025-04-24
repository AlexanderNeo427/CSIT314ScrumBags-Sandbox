import '../../css/PlatformManager/platformManagerViewReport.css'
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import LogoutModal from '../../components/LogoutModal';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';
const PlatformManagerViewReports: React.FC = () => {
  const sessionUser = localStorage.getItem('sessionUser') || 'Platform Manager';

  const [reportData, setReportData] = useState<any[]>([]);
  const [filter, setFilter] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleDownloadCSV = () => {
    const csvRows = [
      ['Booking ID', 'Services', 'Cleaners', 'Price', 'Date'],
      ...reportData.map(row => [
        `#${row.bookingid}`,
        row.serviceName,
        row.cleanerName,
        `$${row.price.toFixed(2)}`,
        new Date(row.date).toLocaleDateString()
      ])
    ];

    const csvContent = csvRows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${filter}_report.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const today = selectedDate ? new Date(selectedDate) : new Date();
        const chosenDate = today.toISOString();

        const response = await axios.post(`http://localhost:3000/api/platform-manager/${filter}`, {
          chosenDate
        }, {
          withCredentials: true
        });

        setReportData(response.data);
      } catch (err) {
        console.error(`Failed to fetch ${filter} report:`, err);
      }
    };

    fetchReport();
  }, [filter, selectedDate]);

  const filteredData = reportData.filter(entry =>
    entry.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.cleanerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="report-page">
      {/* Navbar */}
      <div className="header_container">
        <img src={logo} alt="Logo" height={40} />
        <h2><Link to="/platformManager-dashboard">Home</Link></h2>
        <h2><Link to="/ViewServiceCategories">Services Categorizes</Link></h2>
        <h2><Link to="/platformManager-view-report">Report</Link></h2>
        <h2 id="logout_button" onClick={() => setShowLogoutModal(true)} style={{ cursor: 'pointer' }}>
          <span style={{ marginRight: '8px' }}>👤</span>{sessionUser}/Logout
        </h2>
      </div>

      {/* Logout Modal */}
      <LogoutModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} />

      {/* Report Container */}
      <div className="report-container">
        <h2>Report</h2>

        <div className="report-controls">
          <input
            type="text"
            placeholder="🔍 Search...."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ marginLeft: '1rem' }}
          />

          <div className="filter-options">
            <label><input type="radio" value="daily" checked={filter === 'daily'} onChange={() => setFilter('daily')} /> Daily</label>
            <label><input type="radio" value="weekly" checked={filter === 'weekly'} onChange={() => setFilter('weekly')} /> Weekly</label>
            <label><input type="radio" value="monthly" checked={filter === 'monthly'} onChange={() => setFilter('monthly')} /> Monthly</label>
          </div>
        </div>

        <table className="report-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Services</th>
              <th>Cleaners</th>
              <th>Price</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <tr key={index}>
                  <td>#{item.bookingid}</td>
                  <td>{item.serviceName}</td>
                  <td>{item.cleanerName}</td>
                  <td>${item.price.toFixed(2)}</td>
                  <td>{new Date(item.date).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5}>No data available</td></tr>
            )}
          </tbody>
        </table>

        <button className="download-btn" onClick={handleDownloadCSV} disabled={reportData.length === 0}>Download</button>
      </div>

      <div className="footer">
        <b>© Copyright 2025 Easy & Breezy - All Rights Reserved</b>
      </div>
    </div>
  );
};

export default PlatformManagerViewReports;