import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

const LogoutPage: React.FC = () => {
    const navigate = useNavigate()

    const handleLogout = async () => {
        try {
            await axios.post(
                'http://localhost:3000/api/user-accounts/logout', 
                {}, { withCredentials: true }
            )

            localStorage.clear()
            
            navigate('/login', { replace: true }) // redirect to login after logout
        } catch (error: any) {
            console.error('Logout failed:', error)
            alert('Logout failed. Please try again.')
        }
    }

    const handleCancel = () => {
        navigate(-1) // Go back to the previous page
    }

    return (
        <div className="page_container">
            <div className="header_container">
                <h2><Link to="/">Home</Link></h2>
                <h2><Link to="/">Profiles</Link></h2>
                <h2><Link to="/">Accounts</Link></h2>
                <h2 id="logout_button">Logout</h2>
            </div>
            <div className="logout_container">
                <h2>Log out</h2>
                <p>Are you sure?</p>
                <button onClick={handleLogout}>Logout</button>
                <button onClick={handleCancel}>Cancel</button>
            </div>
            <div className="footer_container">
                <p>© Copyright 2025 Easy & Breezy - All Rights Reserved</p>
            </div>
        </div>
    )
}

export default LogoutPage