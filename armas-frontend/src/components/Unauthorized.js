import React from 'react';
import { CContainer, CButton } from '@coreui/react';
import { Link } from 'react-router-dom';

const Unauthorized = () => (
    <CContainer>
        <h2>Unauthorized</h2>
        <p>You do not have permission to access this page.</p>
        <Link to="/login">
            <CButton color="primary">Back to Login</CButton>
        </Link>
    </CContainer>
);

export default Unauthorized;