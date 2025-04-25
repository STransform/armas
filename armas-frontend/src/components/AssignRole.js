import React, { useEffect, useState } from 'react';
import {
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CRow,
    CForm,
    CFormLabel,
    CFormSelect,
} from '@coreui/react';
import {
    Dialog,
    Snackbar,
    Alert,
    Fade,
    DialogTitle,
    DialogContent,
    DialogActions,
    TableContainer,
    Box,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Button,
} from '@mui/material';
import axiosInstance from "../../axiosConfig";

export default function AssignRole() {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [openAssign, setOpenAssign] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedRoleId, setSelectedRoleId] = useState('');

    useEffect(() => {
        console.log("AssignRole component mounted");
        const fetchData = async () => {
            try {
                console.log("Fetching users...");
                const usersResponse = await axiosInstance.get('/users');
                console.log("Users response:", usersResponse.data);
                setUsers(Array.isArray(usersResponse.data) ? usersResponse.data : []);

                console.log("Fetching roles...");
                const rolesResponse = await axiosInstance.get('/roles');
                console.log("Roles response:", rolesResponse.data);
                setRoles(Array.isArray(rolesResponse.data) ? rolesResponse.data : []);

                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                setError('Failed to load data: ' + (error.response?.data || error.message));
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleOpenAssign = (user) => {
        console.log("Opening assign dialog for user:", user);
        setSelectedUser(user);
        setSelectedRoleId('');
        setOpenAssign(true);
    };

    const handleCloseAssign = () => {
        setOpenAssign(false);
        setSelectedUser(null);
    };

    const handleRoleChange = (e) => {
        setSelectedRoleId(e.target.value);
    };

    const handleAssignRole = async () => {
        if (!selectedUser || !selectedRoleId) return;
        try {
            console.log(`Assigning role ${selectedRoleId} to user ${selectedUser.id}`);
            await axiosInstance.post(`/users/${selectedUser.id}/roles/${selectedRoleId}`);
            setUsers(prev => prev.map(u => 
                u.id === selectedUser.id 
                    ? { ...u, roles: [...(u.roles || []), roles.find(r => r.id === parseInt(selectedRoleId))] } 
                    : u
            ));
            setSnackbarMessage(`Role assigned to ${selectedUser.username} successfully!`);
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            handleCloseAssign();
        } catch (error) {
            console.error("Error assigning role:", error);
            setSnackbarMessage('Failed to assign role: ' + (error.response?.data || error.message));
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    console.log("Rendering AssignRole component, users:", users, "roles:", roles);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div>
            <CRow>
                <CCol xs={12}>
                    <CCard className="mb-4">
                        <CCardHeader><strong>Assign Roles</strong></CCardHeader>
                        <CCardBody>
                            <TableContainer>
                                {users.length > 0 ? (
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>#</TableCell>
                                                <TableCell>Username</TableCell>
                                                <TableCell>Current Roles</TableCell>
                                                <TableCell>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {users.map((user, index) => (
                                                <TableRow key={user.id}>
                                                    <TableCell>{index + 1}</TableCell>
                                                    <TableCell>{user.username}</TableCell>
                                                    <TableCell>
                                                        {user.roles && user.roles.length > 0 
                                                            ? user.roles.map(r => r.description).join(', ') 
                                                            : 'None'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="contained"
                                                            onClick={() => handleOpenAssign(user)}
                                                        >
                                                            Assign Role
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div>No users found.</div>
                                )}
                            </TableContainer>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>

            <Dialog open={openAssign} onClose={handleCloseAssign} maxWidth="sm" fullWidth>
                <DialogTitle>Assign Role to {selectedUser?.username || 'User'}</DialogTitle>
                <DialogContent>
                    <CForm className="row g-3">
                        <CCol xs={12}>
                            <CFormLabel htmlFor="role">Select Role</CFormLabel>
                            <CFormSelect
                                id="role"
                                value={selectedRoleId}
                                onChange={handleRoleChange}
                            >
                                <option value="">Select a Role</option>
                                {roles.map(role => (
                                    <option key={role.id} value={role.id}>
                                        {role.description}
                                    </option>
                                ))}
                            </CFormSelect>
                        </CCol>
                    </CForm>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAssign}>Cancel</Button>
                    <Button 
                        onClick={handleAssignRole} 
                        variant="contained" 
                        disabled={!selectedRoleId}
                    >
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