import React, { useEffect, useState } from 'react';
import {
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CRow,
    CFormLabel,
    CFormCheck,
} from '@coreui/react';
import {
    Dialog,
    Snackbar,
    Alert,
    DialogTitle,
    DialogContent,
    DialogActions,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Button,
} from '@mui/material';
import axiosInstance from '../../axiosConfig';

export default function AssignPrivilege() {
    const [roles, setRoles] = useState([]);
    const [privileges, setPrivileges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [openAssign, setOpenAssign] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const [privilegeAssignments, setPrivilegeAssignments] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [rolesResponse, privilegesResponse] = await Promise.all([
                    axiosInstance.get('/roles'),
                    axiosInstance.get('/privileges'),
                ]);
                setRoles(Array.isArray(rolesResponse.data) ? rolesResponse.data : []);
                setPrivileges(Array.isArray(privilegesResponse.data) ? privilegesResponse.data : []);
                setLoading(false);
            } catch (error) {
                setError('Failed to load data: ' + (error.response?.data || error.message));
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleOpenAssign = async (role) => {
        setSelectedRole(role);
        try {
            const response = await axiosInstance.get(`/role-privileges/${role.id}/assignments`);
            const assignments = response.data;
            const privilegeMap = privileges.map(privilege => {
                const assignment = assignments.find(a => a.privilegeid === privilege.id);
                return {
                    privilegeId: privilege.id,
                    description: privilege.description,
                    isActive: assignment ? assignment.isActive : false,
                };
            });
            setPrivilegeAssignments(privilegeMap);
            setOpenAssign(true);
        } catch (error) {
            setSnackbarMessage('Failed to load assignments: ' + (error.response?.data || error.message));
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const handleCloseAssign = () => {
        setOpenAssign(false);
        setSelectedRole(null);
        setPrivilegeAssignments([]);
    };

    const handlePrivilegeToggle = (privilegeId) => {
        setPrivilegeAssignments(prev =>
            prev.map(assignment =>
                assignment.privilegeId === privilegeId
                    ? { ...assignment, isActive: !assignment.isActive }
                    : assignment
            )
        );
    };

    const handleAssignPrivileges = async () => {
        if (!selectedRole) return;
        try {
            const payload = privilegeAssignments.map(assignment => ({
                privilegeId: assignment.privilegeId,
                isActive: assignment.isActive,
            }));
            await axiosInstance.post(`/role-privileges/${selectedRole.id}/assign`, payload);
            setSnackbarMessage(`Privileges assigned to ${selectedRole.description} successfully!`);
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            handleCloseAssign();
        } catch (error) {
            setSnackbarMessage('Failed to assign privileges: ' + (error.response?.data || error.message));
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
                        <CCardHeader><strong>Assign Privileges</strong></CCardHeader>
                        <CCardBody>
                            <TableContainer>
                                {roles.length > 0 ? (
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>#</TableCell>
                                                <TableCell>Description</TableCell>
                                                <TableCell>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {roles.map((role, index) => (
                                                <TableRow key={role.id}>
                                                    <TableCell>{index + 1}</TableCell>
                                                    <TableCell>{role.description}</TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="contained"
                                                            onClick={() => handleOpenAssign(role)}
                                                        >
                                                            Assign Privileges
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div>No roles found.</div>
                                )}
                            </TableContainer>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>

            <Dialog open={openAssign} onClose={handleCloseAssign} maxWidth="sm" fullWidth>
                <DialogTitle>Assign Privileges to {selectedRole?.description || 'Role'}</DialogTitle>
                <DialogContent>
                    <CForm className="row g-3">
                        {privilegeAssignments.map(assignment => (
                            <CCol xs={12} key={assignment.privilegeId}>
                                <CFormLabel>{assignment.description}</CFormLabel>
                                <CFormCheck
                                    label={assignment.isActive ? 'On' : 'Off'}
                                    checked={assignment.isActive}
                                    onChange={() => handlePrivilegeToggle(assignment.privilegeId)}
                                />
                            </CCol>
                        ))}
                    </CForm>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAssign}>Cancel</Button>
                    <Button onClick={handleAssignPrivileges} variant="contained">
                        Assign
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
            >
                <Alert severity={snackbarSeverity} onClose={() => setSnackbarOpen(false)}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </div>
    );
}