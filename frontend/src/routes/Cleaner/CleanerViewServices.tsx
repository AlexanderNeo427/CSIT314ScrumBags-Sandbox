import React, { useState, useEffect } from 'react';
import '../../css/Cleaner/CleanerViewServices.css';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';
import LogoutModal from '../../components/LogoutModal';

interface UserAccountResponse {
  id: number;
  username: string;
  userProfile: string;
}

interface Service {
  id: number;
  type: string;
  price: number;
  status?: 'Active' | 'Deactivate';
}

interface NewServiceInput {
  service: string;
  description: string;
  price: string;
}

const CleanerViewServicesRoute: React.FC = () => {
  const sessionUser: UserAccountResponse = JSON.parse(localStorage.getItem('sessionObject') || '{}');

  const [availableServices, setAvailableServices] = useState<string[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [search, setSearch] = useState('');

  const [showPopup, setShowPopup] = useState(false);
  const [newService, setNewService] = useState<NewServiceInput>({
    service: '',
    description: '',
    price: '',
  });

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Fetch available services
  useEffect(() => {
    const fetchAvailableServices = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/services/categories/');
        if (!response.ok) throw new Error('Failed to fetch available services');
        const data = await response.json();
        console.log('Fetched available services:', data);
        setAvailableServices(data);
      } catch (error) {
        console.error('Error fetching available services:', error);
      }
    };
    fetchAvailableServices();
  }, []);

  // Fetch current services
  const fetchServices = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/services/${sessionUser.id}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceName: search,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }
      const data = await response.json();
      console.log('Fetched services:', data);

      const formatted: Service[] = data.map((item: any) => ({
        id: item.id,
        type: item.serviceName,
        price: item.price,
      }));

      setServices(formatted);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [sessionUser.id]); // Only on mount or user ID change

  const handleCreateService = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/services/me', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service: newService.service,
          category: newService.service,
          description: newService.description,
          price: Number(newService.price),
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create service');
      }

      setShowPopup(false);
      setNewService({ service: '', description: '', price: '' });
      await fetchServices(); // re-fetch without refreshing
    } catch (error) {
      console.error('Error creating service:', error);
      alert('Failed to create service.');
    }
  };

  return (
    <div className="dashboard-container">
      <div className="header_container">
        <img src={logo} alt="Logo" height={40} />
        <h2><Link to="/cleaner-dashboard">Home</Link></h2>
        <h2><Link to="/cleaner-view-services">My Services</Link></h2>
        <h2><Link to="/cleaner-view-bookings">My Bookings</Link></h2>
        <h2 id="logout_button" onClick={() => setShowLogoutModal(true)} style={{ cursor: 'pointer' }}>
          <span style={{ marginRight: '8px' }}>👤</span>{sessionUser.username}/Logout
        </h2>
      </div>

      {/* Logout Modal */}
      <LogoutModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} />

      {/* Popup for Create Service */}
      {showPopup && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Create New Service</h2>

            <label>Service Categories</label>
            <select
              id="serviceDropdown"
              value={newService.service}
              onChange={(e) => setNewService({ ...newService, service: e.target.value })}
            >
              <option value="">Select a service</option>
              {availableServices.map((serviceName, index) => (
                <option key={index} value={serviceName}>
                  {serviceName}
                </option>
              ))}
            </select>

            <label>Type of service</label>
            <textarea
              placeholder="e.g Sweep and mopping of floor"
              value={newService.description}
              onChange={(e) => setNewService({ ...newService, description: e.target.value })}
              rows={4}
              style={{
                resize: 'none',
                width: '100%',
                padding: '8px',
                fontSize: '1rem',
                lineHeight: '1.5',
              }}
            />

            <label>Price</label>
            <input
              id="serviceInput"
              type="number"
              placeholder="e.g 20"
              min="0"
              value={newService.price}
              onChange={(e) => setNewService({ ...newService, price: e.target.value })}
            />

            <div className="modal-buttons">
              <button onClick={() => setShowPopup(false)}>Cancel</button>
              <button onClick={handleCreateService}>Add</button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="content-center">
        <div className="card">
          <h1>View Services</h1>

          <div className="top-bar">
            <input
              type="text"
              placeholder="🔍 Search...."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') fetchServices();
              }}
            />
            <button className="search-btn" onClick={fetchServices}>Search</button>
            <button className="create-btn" onClick={() => setShowPopup(true)}>Create New Services</button>
          </div>

          <table>
            <thead>
              <tr>
                <th><b>Type of Service</b></th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service, index) => (
                <tr key={service.id || index}>
                  <td>{service.type}</td>
                  <td>${service.price}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="view-btn">View</button>
                      <button className="edit-btn">Edit</button>
                      <button className="delete-btn">Delete</button>
                    </div>
                  </td>
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
  );
};

export default CleanerViewServicesRoute;
