import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import LogoutModal from '../../components/LogoutModal';
import logo from '../../assets/logo.png';

// Updated interface to match the actual response structure
interface ServicesResponse {
  id: number;
  category: string;
  label: string;
}

interface newServiceCategory {
  serviceName: string;
}

const ViewServiceCategories: React.FC = () => {
  const sessionUser = localStorage.getItem('sessionUser') || 'defaultUser';
  const sessionRole = localStorage.getItem('sessionRole') || 'defaultRole';
  const [services, setServices] = useState<string[]>([]);  // Change to array of strings
  const [error, setError] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  // Logout Modal State
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [newServiceCategory, setNewServiceCategory] = useState<{ serviceName: string }>({
    serviceName: ''
  });

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/Services/categories', {
          withCredentials: true,
        });

        const data: string[] = response.data;  // Change to array of strings
        console.log("Fetched services:", data);

        if (Array.isArray(data)) {
          setServices(data);
        } else {
          console.error('Unexpected server response:', data);
          setError('Unexpected server response.');
        }
      } catch (err) {
        console.error('Failed to fetch services:', err);
        setError('Could not load services. Please try again later.');
      }
    };

    fetchServices();
  }, []);

  // Filter services based on search input
  const filteredServices = services.filter((service) =>
    service.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="user-account-page">
      {/* Navbar */}
      <div className="header_container">
        <img src={logo} alt="Logo" height={40} />
        <h2><Link to="/platformManager-dashboard">Home</Link></h2>
        <h2><Link to="/ViewServiceCategories">Service Categories</Link></h2>
        <h2><Link to="/platformManager-view-report">Report</Link></h2>
        <h2 id="logout_button" onClick={() => setShowLogoutModal(true)} style={{ cursor: 'pointer' }}>
          <span style={{ marginRight: '8px' }}>👤</span>{sessionUser}/Logout
        </h2>
      </div>
      {/* Logout Modal */}
      <LogoutModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} />

      {/* Modal for creating new category */}
      {showPopup && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Create New Service Category</h2>
            <label>Category Name:</label>
            <input
              id="categoryInput"
              type="text"
              placeholder="e.g. Floor cleaning"
              value={newServiceCategory.serviceName}
              onChange={(e) => setNewServiceCategory({ ...newServiceCategory, serviceName: e.target.value })}
            />
            <div className="modal-buttons">
              <button onClick={() => setShowPopup(false)}>Cancel</button>
              <button onClick={async () => {
                try {
                  const response = await fetch('http://localhost:3000/api/services/categories', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      category: newServiceCategory.serviceName
                    }),
                    credentials: 'include',
                  });

                  if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to create service category');
                  }

                  setShowPopup(false);
                  setNewServiceCategory({ serviceName: '' });
                  window.location.reload(); // Or re-fetch services instead of reloading
                } catch (error) {
                  console.error('Error creating service category:', error);
                  alert('Failed to create service category.');
                }
              }}>
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Services Section */}
      <div className="account-container">
        <h2>List of Service Categories</h2>
        <div className="top-row">
          <input
            type="text"
            className="search-bar"
            placeholder="Search by category name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="create-btn" onClick={() => setShowPopup(true)}>Create New Category</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <table className="user-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredServices.length > 0 ? (
              filteredServices.map((service, index) => (
                <tr key={index}>
                  <td>{service}</td>  {/* Displaying category directly */}
                  <td>
                    <div className="action-buttons">
                      <button className="edit-btn">Edit</button>
                      <button className="delete-btn">Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2}>No services available.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="footer">
        <b>© Copyright 2025 Easy & Breezy - All Rights Reserved</b>
      </div>
    </div>
  );
};

export default ViewServiceCategories;
