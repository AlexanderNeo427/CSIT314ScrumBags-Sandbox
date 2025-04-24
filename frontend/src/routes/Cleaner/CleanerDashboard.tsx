import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import '../../css/Cleaner/CleanerDashboardRoute.css';
import 'react-calendar/dist/Calendar.css';
import logo from '../../assets/logo.png';
import { Link } from 'react-router-dom'
import LogoutModal from '../../components/LogoutModal';

interface CleaningJob {
  id: number;
  cleanerName: string;
  jobDate: string;
  location: string;
}

const CleanerDashboardRoute: React.FC = () => {
  const sessionUser = localStorage.getItem('sessionUser') || 'defaultUser';
  const [dateRange, setDateRange] = useState<Date | null>(new Date());
  const [jobs, setJobs] = useState<CleaningJob[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [jobsOnSelectedDate, setJobsOnSelectedDate] = useState<CleaningJob[]>([]);

  // Logout Modal State
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    // Dummy data with locations
    const dummyJobs: CleaningJob[] = [
      { id: 1, cleanerName: 'Cleaner 1', jobDate: '2025-04-20', location: 'Location A' },
      { id: 2, cleanerName: 'Cleaner 1', jobDate: '2025-04-22', location: 'Location B' },
      { id: 3, cleanerName: 'Cleaner 1', jobDate: '2025-04-25', location: 'Location C' },
      { id: 4, cleanerName: 'Cleaner 1', jobDate: '2025-04-22', location: 'Location D' },
    ];
    setJobs(dummyJobs);
    filterJobs(new Date()); // Show today's jobs by default
  }, []);

  const hasJobOnDate = (date: Date) => {
    return jobs.some(job => {
      const jobDate = new Date(job.jobDate);
      return (
        jobDate.getFullYear() === date.getFullYear() &&
        jobDate.getMonth() === date.getMonth() &&
        jobDate.getDate() === date.getDate()
      );
    });
  };

  const filterJobs = (date: Date) => {
    setSelectedDate(date);
    const filtered = jobs.filter(job => {
      const jobDate = new Date(job.jobDate);
      return (
        jobDate.getFullYear() === date.getFullYear() &&
        jobDate.getMonth() === date.getMonth() &&
        jobDate.getDate() === date.getDate()
      );
    });
    setJobsOnSelectedDate(filtered);
  };

  return (
    <div className="dashboard-container">
      <div className="header_container">
        <img src={logo} alt="Logo" height={40} />
        <h2><Link to="/cleaner-dashboard">Home</Link></h2>
        <h2><Link to="/cleaner-view-services">View My Services</Link></h2>
        <h2 id="logout_button" onClick={() => setShowLogoutModal(true)} style={{ cursor: 'pointer' }}>
          <span style={{ marginRight: '8px' }}>👤</span>{sessionUser}/Logout
        </h2>
      </div>
      {/* Logout Modal */}
      <LogoutModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} />
      <div className="welcome-message">
        <h2>Welcome back, {sessionUser}!!</h2>
        <p>Manage your cleaning services.</p>
      </div>

      <div className="dashboard-grid">
        <div className="calendar-container">
          <h3 className="calendar-header">Your Calendar</h3>
          <Calendar
            onClickDay={(value) => {
              setDateRange(value);
              filterJobs(value);
            }}
            value={dateRange}
            tileContent={({ date, view }) =>
              view === 'month' && hasJobOnDate(date) ? (
                <div className="job-dot" title="You have a job today!"></div>
              ) : null
            }
          />

          {/* 👇 Jobs info shown directly below the calendar */}
          {selectedDate && (
            <div className="job-info">
              <h4 style={{ marginTop: '1rem' }}>
                Jobs on {selectedDate.toDateString()}
              </h4>
              {jobsOnSelectedDate.length > 0 ? (
                <ul>
                  {jobsOnSelectedDate.map(job => (
                    <li key={job.id} style={{ marginBottom: '1rem' }}>
                      <strong>Job #{job.id}</strong><br />
                      Assigned to: {job.cleanerName}<br />
                      Location: {job.location}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No jobs on this date.</p>
              )}
            </div>
          )}
        </div>

        <div className="sidebar">
          <button></button>
          <select></select>
          <select></select>
          <button></button>
        </div>
      </div>

      <footer className="footer">
        © Copyright 2025 Easy & Breezy - All Rights Reserved
      </footer>
    </div>
  );
};

export default CleanerDashboardRoute;
