import React from 'react'
import { useAuth } from './AuthProvider'
import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({children}) => {
    const {isAuthenticated} = useAuth()
    if(!isAuthenticated) {
        return <Navigate to="/login"></Navigate>
    } else {
        return children
    }
}

export default ProtectedRoute
