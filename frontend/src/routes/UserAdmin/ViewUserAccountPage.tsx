import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import LogoutModal from '../../components/LogoutModal'
import logo from '../../assets/logo.png'

interface UserAccountResponse {
  id: number | null
  username: string
  userProfile: string
  isSuspended: boolean
}

interface UserProfile {
  id: number
  label: string
  isSuspended: boolean
}

const ViewUserAccountPage: React.FC = () => {
  const sessionUser = localStorage.getItem('sessionUser') || 'defaultUser'
  const [suspendUserAccountModal, setSuspendUserAccountModal] = useState<{ show: boolean; user: UserAccountResponse | null }>({
    show: false,
    user: null
  })
  const [roles, setRoles] = useState<UserProfile[]>([]); // Correct for array of strings
  const [newStatus, setNewStatus] = useState<'Active' | 'Suspended'>('Active')
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [updateUserAccountModal, setUpdateUserAccountModal] = useState(false)
  const [editingUser, setEditingUser] = useState<{
    id: number | null
    username: string
    role: string
    password: string
    confirmPassword: string
  }>({
    id: null,
    username: '',
    role: '',
    password: '',
    confirmPassword: ''
  })

  const [users, setUsers] = useState<UserAccountResponse[]>([])
  const [error, setError] = useState<string>('')
  const [search, setSearch] = useState<string>('')

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/user-accounts', { withCredentials: true })
      const data: UserAccountResponse[] = response.data
      if (Array.isArray(data)) setUsers(data)
      else setError('Unexpected server response.')
    } catch (err) {
      console.error('Failed to fetch users:', err)
      setError('Could not load users. Please try again later.')
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const confirmSuspendAction = async () => {
    if (!suspendUserAccountModal.user?.id) return

    try {
      await axios.post(
        `http://localhost:3000/api/user-accounts/${newStatus === 'Active' ? 'unsuspend' : 'suspend'}`,
        { id: suspendUserAccountModal.user.id },
        { withCredentials: true }
      )
      setSuspendUserAccountModal({ show: false, user: null })
      await fetchUsers()
    } catch (error) {
      console.error('Failed to toggle suspension:', error)
      setError('Action failed!')
    }
  }

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/user-profiles/', {
          withCredentials: true,
        });

        const data = response.data; // ✅ this is already the array of roles
        if (Array.isArray(data)) {
          setRoles(data); // ✅ use directly
        } else {
          console.error('Expected array of roles but got:', data);
          setRoles([]);
          setError('Unexpected server response.');
        }
      } catch (err) {
        console.error('Failed to fetch roles:', err);
        setError('Could not load roles. Please try again later.');
      }
    };

    fetchRoles();
  }, []); 

  return (
    <div className="page-container">
      <div className="header-container">
        <div>
          <img src={logo} alt="Logo" height={40} />
          <h2><Link to="/admin-dashboard">Home</Link></h2>
          <h2><Link to="/user-account-management">User Account</Link></h2>
          <h2><Link to="/ViewUserProfile">User Profile</Link></h2>
        </div>

        <div>
          <h2 id="logout_button" onClick={() => setShowLogoutModal(true)} style={{ cursor: 'pointer' }}>
            <span style={{ marginRight: '8px' }}>👤</span>{sessionUser}/Logout
          </h2>
        </div>
      </div>

      <LogoutModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} />

      <div className="body-container">
        <div className="card">
          <h2>User Accounts</h2>
          <div className="top-bar">
            <input
              type="text"
              className="search-bar"
              placeholder="Search by username"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={async (e) => {
                if (e.key === 'Enter') {
                  if (!search.trim()) {
                    fetchUsers()
                    return
                  }
                  try {
                    const res = await axios.get(`http://localhost:3000/api/user-accounts/search?search=${search}`, {
                      withCredentials: true
                    })
                    setUsers([res.data])
                  } catch (err: any) {
                    if (err.response?.status === 404) setUsers([])
                    else {
                      console.error('Search failed:', err)
                      setError('Search failed. Try again.')
                    }
                  }
                }
              }}
            />
            <button className="create-btn">
              <Link to="/create" className="create-btn">Create Account</Link>
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Profile</th>
                <th>Status</th>
                <th id="actionCol">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? users.map((user, index) => (
                <tr key={index}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.userProfile}</td>
                  <td style={{ color: user.isSuspended ? 'red' : 'green', fontWeight: 'bold' }}>
                    {user.isSuspended ? 'Suspended' : 'Active'}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="edit-btn"
                        onClick={() => {
                          setEditingUser({
                            id: user.id,
                            username: user.username,
                            role: user.userProfile || '',
                            password: '',
                            confirmPassword: ''
                          })
                          setUpdateUserAccountModal(true)
                        }}
                      >Edit</button>
                      <button
                        className={user.isSuspended ? "unsuspend-btn" : "suspend-btn"}
                        onClick={() => {
                          setSuspendUserAccountModal({ show: true, user })
                          setNewStatus(user.isSuspended ? 'Active' : 'Suspended')
                        }}
                      >
                        {user.isSuspended ? '🚫' : '🗑️'}
                      </button>
                    </div>
                  </td>
                </tr>
              )) : <tr><td colSpan={5}>No users available.</td></tr>}
            </tbody>
          </table>

          {/* Suspend Modal */}
          {suspendUserAccountModal.show && suspendUserAccountModal.user && (
            <div className="modal-overlay">
              <div className="modal">
                <h2>
                  Are you sure you want to {newStatus === 'Active' ? 'unsuspend' : 'suspend'} user account
                  "<b>{suspendUserAccountModal.user.username}</b>"?
                </h2>

                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as 'Active' | 'Suspended')}
                  style={{ width: '100%', marginTop: '1rem' }}
                >
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                </select>

                <div className="modal-buttons" style={{ marginTop: '1.5rem' }}>
                  <button onClick={() => setSuspendUserAccountModal({ show: false, user: null })}>Cancel</button>
                  <button onClick={confirmSuspendAction} className="submit-btn">Update Status</button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Modal remains unchanged */}
          {updateUserAccountModal && (
            <div className="modal-overlay">
              <div className="modal">
                <h2>Update User Account</h2>
                <label>Update As:</label>
                <select
                  value={editingUser.role}
                  onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}
                  required
                >
                  <option value="" disabled>Select Role</option>

                  {roles.length === 0 ? (
                    <option disabled>Loading roles...</option>
                  ) : (
                    roles.map(r => (
                      <option key={r.id} value={r.label}>
                        {r.label.charAt(0).toUpperCase() + r.label.slice(1)}
                      </option>
                    ))
                  )}
                </select>
                <label>Username:</label>
                <input type="text" value={editingUser.username} onChange={e => setEditingUser({ ...editingUser, username: e.target.value })} required />
                <label>Password:</label>
                <input type="password" value={editingUser.password} onChange={e => setEditingUser({ ...editingUser, password: e.target.value })} required />
                <label>Confirm Password:</label>
                <input type="password" value={editingUser.confirmPassword} onChange={e => setEditingUser({ ...editingUser, confirmPassword: e.target.value })} required />

                <div className="modal-buttons">
                  <button className="cancel-btn" onClick={() => setUpdateUserAccountModal(false)}>Cancel</button>
                  <button className="submit-btn" onClick={async () => {
                    if (editingUser.password !== editingUser.confirmPassword) {
                      return alert("Passwords do not match!")
                    }
                    try {
                      await axios.post('http://localhost:3000/api/user-accounts/update', {
                        userId: editingUser.id,
                        updatedAs: editingUser.role,
                        updatedUsername: editingUser.username,
                        updatedPassword: editingUser.password
                      }, { withCredentials: true })
                      alert('User updated successfully')
                      await fetchUsers()
                      setUpdateUserAccountModal(false)
                    } catch (error) {
                      console.error('Failed to update user:', error)
                      alert('Failed to update user. Please try again.')
                    }
                  }}>Update Account</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="footer-container">
        <b>© Copyright 2025 Easy & Breezy - All Rights Reserved</b>
      </div>
    </div>
  )
}

export default ViewUserAccountPage