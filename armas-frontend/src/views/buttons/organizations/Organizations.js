import React, { useState, useEffect } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CButton,
  CForm,
  CFormInput,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CAlert,
} from '@coreui/react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthProvider';

const Organizations = () => {
  const [organizations, setOrganizations] = useState([]);
  const [newOrg, setNewOrg] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const baseURL = import.meta.env.VITE_REACT_APP_API_BASE_URL || 'http://localhost:8080/api';
        const response = await axios.get(`${baseURL}/organizations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrganizations(response.data);
      } catch (err) {
        setError('Failed to load organizations');
        console.error(err);
      }
    };
    if (token) {
      fetchOrganizations();
    }
  }, [token]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const baseURL = import.meta.env.VITE_REACT_APP_API_BASE_URL || 'http://localhost:8080/api';
      const response = await axios.post(`${baseURL}/organizations`, newOrg, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrganizations([...organizations, response.data]);
      setNewOrg({ name: '', description: '' });
      setError('');
    } catch (err) {
      setError('Failed to create organization');
      console.error(err);
    }
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    setNewOrg((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Organizations</strong>
          </CCardHeader>
          <CCardBody>
            {error && <CAlert color="danger">{error}</CAlert>}
            <CForm onSubmit={handleCreate} className="mb-4">
              <CRow className="mb-3">
                <CCol>
                  <CFormInput
                    type="text"
                    name="name"
                    placeholder="Organization Name"
                    value={newOrg.name}
                    onChange={handleInput}
                    required
                  />
                </CCol>
                <CCol>
                  <CFormInput
                    type="text"
                    name="description"
                    placeholder="Description"
                    value={newOrg.description}
                    onChange={handleInput}
                  />
                </CCol>
                <CCol xs="auto">
                  <CButton type="submit" color="primary">
                    Create
                  </CButton>
                </CCol>
              </CRow>
            </CForm>
            <CTable hover>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Name</CTableHeaderCell>
                  <CTableHeaderCell>Description</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {organizations.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan="2">No organizations found</CTableDataCell>
                  </CTableRow>
                ) : (
                  organizations.map((org) => (
                    <CTableRow key={org.id}>
                      <CTableDataCell>{org.name}</CTableDataCell>
                      <CTableDataCell>{org.description || '-'}</CTableDataCell>
                    </CTableRow>
                  ))
                )}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default Organizations;