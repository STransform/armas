import React from 'react';
import { Link } from 'react-router-dom';
import { CCard, CCardBody, CCardHeader, CCol, CRow, CButton } from '@coreui/react';
import { useAuth } from './AuthProvider';
import { Navigate } from 'react-router-dom';

const Register = () => {
    const { hasRole } = useAuth();

    if (!hasRole('ADMIN')) {
        return <Navigate to="/dashboard" />;
    }

    return (
        <CRow>
            <CCol xs={12}>
                <CCard className="mb-4">
                    <CCardHeader>
                        <strong>Admin Register</strong>
                    </CCardHeader>
                    <CCardBody>
                        <p>Select a management option below:</p>
                        <CRow>
                            <CCol md={3}>
                                <Link to="/buttons/organizations">
                                    <CButton color="primary">Manage Organizations</CButton>
                                </Link>
                            </CCol>
                            <CCol md={3}>
                                <Link to="/buttons/directorates">
                                    <CButton color="primary">Manage Directorates</CButton>
                                </Link>
                            </CCol>
                            <CCol md={3}>
                                <Link to="/buttons/documents">
                                    <CButton color="primary">Manage Documents</CButton>
                                </Link>
                            </CCol>
                            <CCol md={3}>
                                <Link to="/buttons/users">
                                    <CButton color="primary">Manage Users</CButton>
                                </Link>
                            </CCol>
                            <CCol md={3} className="mt-3">
                                <Link to="/buttons/roles">
                                    <CButton color="primary">Manage Roles</CButton>
                                </Link>
                            </CCol>
                            <CCol md={3} className="mt-3">
                                <Link to="/buttons/assign">
                                    <CButton color="primary">Assign Roles</CButton>
                                </Link>
                            </CCol>
                        </CRow>
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    );
};

export default Register;