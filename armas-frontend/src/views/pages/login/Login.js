import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilLockLocked, cilUser } from '@coreui/icons';
import { useAuth } from '../AuthProvider';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';

const Login = () => {
  const [input, setInput] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { loginAction } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!input.username || !input.password) {
      setError('Please enter both username and password');
      return;
    }

    try {
      const roles = await loginAction(input);
      console.log('User roles after login:', roles);

      if (roles.includes('ADMIN')) {
        navigate('/charts');
      } else if (roles.includes('USER')) {
        navigate('/charts/');
      } else if (roles.includes('SENIOR_AUDITOR')) {
        navigate('/charts/');
      } else if (roles.includes('ARCHIVER')) {
        navigate('/charts/');
      } 
      else if (roles.includes('APPROVER')) {
        navigate('/charts/');
      } 
      else if (roles.includes('MANAGER')) {
        navigate('/charts/');
      } 
      else {
        navigate('/#');
      }
    } catch (error) {
      const errorMessage = error.message || 'Login failed. Please try again.';
      setError(errorMessage);
      console.error('Login error:', error);
    }
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div style={{ backgroundColor: '#2B547E', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <style>
        {`
          .login-form {
            width: 700px;
            margin: 100px auto;
            background-image: linear-gradient(30deg, #13223f, #0e1a30);
            border-radius: 50%;
            position: relative;
          }
          .login-form::before {
            content: "";
            background-color: gold;
            position: absolute;
            display: block;
            height: 100%;
            width: 100%;
            border-radius: 50%;
            z-index: -1;
            animation: 3.2s cresent linear infinite alternate;
          }
          .login-card {
            margin-bottom: 15px;
            background: linear-gradient(DarkSlateGray, red);
            box-shadow: none;
            padding: 30px;
            border: 20px outset rgba(51, 153, 0, 0.65);
            border-radius: 100%;
            color: white;
            -webkit-box-shadow: -10px 10px 20px rgba(255, 255, 255, 0.9);
          }
          .login-btn {
            font-size: 15px;
            font-weight: bold;
            min-height: 40px;
            width: 120px;
            border-top-right-radius: 100px;
            border-bottom-left-radius: 100px;
            border-top-left-radius: 100px;
            border-bottom-right-radius: 100px;
            background-color: green;
          }
          .form-control {
            border-bottom-left-radius: 100px;
            border-top-right-radius: 100px;
          }
          .form-control.password {
            border-top-left-radius: 100px;
            border-bottom-right-radius: 100px;
            border-bottom-left-radius: 0;
            border-top-right-radius: 0;
          }
          .ocean {
            height: 120px;
            width: 100%;
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            overflow-x: hidden;
          }
          .wave {
            background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 88.7'%3E%3Cpath d='M800 56.9c-155.5 0-204.9-50-405.5-49.9-200 0-250 49.9-394.5 49.9v31.8h800v-.2-31.6z' fill='white'/%3E%3C/svg%3E");
            position: absolute;
            width: 200%;
            height: 100%;
            animation: wave 10s -3s linear infinite;
            transform: translate3d(0, 0, 0);
            opacity: 0.8;
          }
          .wave:nth-of-type(2) {
            bottom: 0;
            animation: wave 18s linear reverse infinite;
            opacity: 0.5;
          }
          .wave:nth-of-type(3) {
            bottom: 0;
            animation: wave 20s -1s linear infinite;
            opacity: 0.5;
          }
          @keyframes wave {
            0% { transform: translateX(0); }
            50% { transform: translateX(-25%); }
            100% { transform: translateX(-50%); }
          }
          @keyframes cresent {
            0% {
              transform: translate(-30px, 30px) scale(0.9);
              box-shadow: -20px 20px 20px rgba(255, 0, 0, 1);
            }
            50% {
              transform: translate(0px, 0px) scale(1.02);
              box-shadow: 0 0 10px #f9f3f2, 0 0 80px 8px #c7938b;
              background-color: #efdbd8;
            }
            100% {
              transform: translate(30px, -30px) scale(0.9);
              box-shadow: -20px 20px 20px rgba(255, 0, 0, 1);
            }
          }
          @media (max-width: 400px) {
            .login-form {
              width: 360px;
            }
            .login-card {
              padding: 20px;
            }
          }
        `}
      </style>
      <CContainer className="login-form">
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCard className="login-card">
              <CCardBody>
                <CForm onSubmit={handleLogin}>
                  <h4 className="text-center">ARMAS</h4>
                  {error && (
                    <p className="text-danger text-center" style={{ marginLeft: '40px' }}>
                      {error}
                    </p>
                  )}
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <i className="fa fa-user"></i>
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Enter Email Here"
                      name="username"
                      value={input.username}
                      onChange={handleInput}
                      autoComplete="username"
                      className="form-control"
                      required
                    />
                  </CInputGroup>
                  <CInputGroup className="mb-4">
                    <CInputGroupText>
                      <i className="fa fa-lock"></i>
                    </CInputGroupText>
                    <CFormInput
                      name="password"
                      value={input.password}
                      onChange={handleInput}
                      type="password"
                      placeholder="Enter Password Here"
                      autoComplete="current-password"
                      className="form-control password"
                      required
                    />
                  </CInputGroup>
                  <CRow>
                    <CCol xs={6}>
                      <CButton type="submit" className="login-btn">
                        <i className="fas fa-sign-in-alt"></i> Login
                      </CButton>
                    </CCol>
                    <CCol xs={6} className="text-right">
                      <Link to="/login">
                        <CButton color="link" className="px-0" style={{ color: 'white' }}>
                          Forgot password?
                        </CButton>
                      </Link>
                    </CCol>
                  </CRow>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
      <div className="ocean">
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
      </div>
    </div>
  );
};

export default Login;