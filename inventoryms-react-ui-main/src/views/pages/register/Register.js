import React, { useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const Register = () => {

  const [accountData, setAccountData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: ''
  })

  const navigate = useNavigate()

  const handleChange = (e) => {
    setAccountData({
      ...accountData, 
      [e.target.id]: e.target.value });
  }

  const handleAccountCreation = async (e) => {
    e.preventDefault()
    console.log(accountData)
    try {
      const baseURL = import.meta.env.VITE_REACT_APP_API_BASE_URL
      const response =  await axios.post(`${baseURL}/register`, accountData)

      if(response.status == 201 || response.status == 200){
        navigate('/registrationSuccessful')
      }
  } catch(error){
    console.log(error);
  }
}

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={9} lg={7} xl={6}>
            <CCard className="mx-4">
              <CCardBody className="p-4">
                <CForm>
                  <h1>Register</h1>
                  <p className="text-body-secondary">Create your account</p>
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilUser} />
                    </CInputGroupText>
                    <CFormInput placeholder="Firstname" 
                      autoComplete="firstName"                       
                      id="firstName" 
                      onChange={handleChange}  
                      value={accountData.firstName}  
                      />
                  </CInputGroup>
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilUser} />
                    </CInputGroupText>
                    <CFormInput placeholder="Lastname" autoComplete="lastName"
                                          id="lastName" 
                                          onChange={handleChange}  
                                          value={accountData.lastName}  
                     />
                  </CInputGroup>                                    
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilUser} />
                    </CInputGroupText>
                    <CFormInput placeholder="Username" 
                    autoComplete="username"
                    id="username" 
                    onChange={handleChange}  
                    value={accountData.username}                       
                    />
                  </CInputGroup>
                  <CInputGroup className="mb-3">
                    <CInputGroupText>@</CInputGroupText>
                    <CFormInput placeholder="Email" autoComplete="email" 
                                                              id="email" 
                                                              onChange={handleChange}  
                                                              value={accountData.email}  
                    />
                  </CInputGroup>
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                      type="password"
                      placeholder="Password"
                      autoComplete="new-password"
                      id="password" 
                      onChange={handleChange}  
                      value={accountData.password}  
                    />
                  </CInputGroup>
                  <CInputGroup className="mb-4">
                    <CInputGroupText>
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                      type="password"
                      placeholder="Repeat password"
                      autoComplete="new-password"
                    />
                  </CInputGroup>
                  <div className="d-grid">
                    <CButton color="success" onClick={handleAccountCreation}>
                      Create Account</CButton>
                  </div>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Register
