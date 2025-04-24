import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const Login: React.FC = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await axios.post(
        'http://localhost:3000/api/user-accounts/login',
        { username, password }, {
          withCredentials: true,
        }
      )

      // Assuming server returns: { username: "john", role: "homeowner" }
      const { userProfile } = response.data
      console.log(response.data);

      // // Simulate session in localStorage
      localStorage.setItem('sessionUser', username)
      localStorage.setItem('sessionRole', userProfile)
      // After successful login
      localStorage.setItem('sessionObject', JSON.stringify(response.data)); // `data` is UserAccountResponse
      console.log('sessionUser')
      console.log('sessionRole')
      console.log('sessionObject')

      // Redirect based on user role
      if (userProfile === 'cleaner') {
        navigate('/cleaner-dashboard')
      } else if (userProfile === 'user admin') {
        navigate('/admin-dashboard')
      } else if (userProfile === 'homeowner') {
        navigate('/homeowner-dashboard')
      } else if (userProfile === 'platform manager') {
        navigate('/platformManager-dashboard')
      } else {
        alert('Unknown role: ' + userProfile)
      }

    } catch (error: any) {
      if (error.response) {
        console.error('Login failed:', error.response.data?.message)
        alert('Login failed: ' + error.response.data?.message)
      } else {
        console.error('Network or server error:', error.message)
        alert('Something went wrong. Please try again.')
      }
    }
  }

  return (
    <div className="login_container">
      <div className="login_left">
        <img
          src="src/assets/login_image.jpg"
          alt="Cleaning"
          className="login_image"
        />
      </div>

      <div className="login_right">
        <div className="login_form_h2"><b>Welcome</b></div>
        <div className="login_form_p">Please enter your details</div>
        <form className="login_form" onSubmit={handleSubmit}>
          <label><b>Enter Username:</b></label>
          <div className="input_group">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>

          <label><b>Enter Password:</b></label>
          <div className="input_group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login_button">Login</button>
        </form>
      </div>
    </div>
  )
}

export default Login
