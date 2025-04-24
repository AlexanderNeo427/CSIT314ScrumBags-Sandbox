import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "./LogoutModal.css"

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:3000/api/user-accounts/logout', {}, { withCredentials: true });
      localStorage.clear();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Logout failed. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="logout-modal-overlay">
      <div className="logout-modal">
        <h2>Log out</h2>
        <p>Are you sure ?</p>
        <div className="modal-buttons">
          <button onClick={handleLogout} className="confirm-btn">Logout</button>
          <button onClick={onClose} className="cancel-btn">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
