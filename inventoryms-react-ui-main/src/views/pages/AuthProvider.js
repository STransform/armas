import axios from 'axios';
import React, { createContext, useContext, useState } from 'react'
const AuthContext = createContext();

const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(localStorage.getItem('token')|| '')

    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return localStorage.getItem('isAuthenticated') === 'true'
    })

    const loginAction = async (data) => {
        try {
            const baseURL = import.meta.env.VITE_REACT_APP_API_BASE_URL
            const response = await axios.post(`${baseURL}/login`, data)
            if (response.status = 201 || response.status == 200) {
                localStorage.setItem('isAuthenticated', true)
                setIsAuthenticated(true)
                setUser(response.data.user)
                setToken(response.data)
                localStorage.setItem('token', response.data)
                return          
            }
            throw new Error(response.message)
        } catch (err) {
            console.log(err)
        }
    }

    const logOut = () => {
        setUser(null)
        setToken('')
        localStorage.removeItem('token')
        localStorage.removeItem('isAuthenticated')
        setIsAuthenticated(false)
    }

    return <AuthContext.Provider value={{isAuthenticated, token, user, loginAction, logOut}}>
        {children}
    </AuthContext.Provider>
}

export default AuthProvider

export const useAuth = () => {
    return useContext(AuthContext)
}
