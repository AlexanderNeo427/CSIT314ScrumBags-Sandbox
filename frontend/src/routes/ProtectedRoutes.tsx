import React from 'react'
import { Navigate } from 'react-router-dom'

interface Props {
  children: React.ReactNode
}

const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const sessionUser = localStorage.getItem('sessionUser')

  if (!sessionUser) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute