import React, { useEffect, useState } from 'react';
import {
    CCard, CCardBody, CCardHeader, CCol, CRow,
} from '@coreui/react';
import {
    TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Switch,
    Snackbar, Alert,
} from '@mui/material';
import axiosInstance from "../../axiosConfig";

export default function ManageRolePrivileges() {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await axiosInstance.get('/roles');
                setRoles(response.data);
                setLoading(false);
            } catch (error) {
                setError(error.response?.data?.message || error.message);
                setLoading(false);
            }
        };
        fetchRoles();
    }, []);

    const handleTogglePrivilege = async (rolePrivilegeId, currentStatus) => {
        try {
            const newStatus = !currentStatus;
            await axiosInstance.put(`/roles/role-privileges/${rolePrivilegeId}/toggle`, newStatus, {
                headers: { 'Content-Type': 'application/json' }
            });
            setRoles(prevRoles =>
                prevRoles.map(role => ({
                    ...role,
                    rolePrivileges: role.rolePrivileges.map(rp =>
                        rp.id === rolePrivilegeId ? { ...rp, enabled: newStatus } : rp
                    )
                }))
            );
            setSnackbarMessage('Privilege status updated successfully!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
        } catch (error) {
            setSnackbarMessage('Error updating privilege status: ' + (error.response?.data?.message || error.message));
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div>
            <CRow>
                <CCol xs={12}>
                    <CCard className="mb-4">
                        <CCardHeader><strong>Manage Role Privileges</strong></CCardHeader>
                        <CCardBody>
                            {roles.map(role => (
                                <div key={role.id}>
                                    <h5>{role.description}</h5>
                                    <TableContainer>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Privilege</TableCell>
                                                    <TableCell>Status</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {role.rolePrivileges.map(rp => (
                                                    <TableRow key={rp.id}>
                                                        <TableCell>{rp.privilege.description}</TableCell>
                                                        <TableCell>
                                                            <Switch
                                                                checked={rp.enabled}
                                                                onChange={() => handleTogglePrivilege(rp.id, rp.enabled)}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </div>
                            ))}
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>
            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
                <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </div>
    );
}