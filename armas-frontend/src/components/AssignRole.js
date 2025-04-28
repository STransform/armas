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
    const [selectedRoleIds, setSelectedRoleIds] = useState([]); // Changed to array for multiple roles

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
        setSelectedRoleIds([]); // Reset to empty array
        setOpenAssign(true);
    };

    const handleCloseAssign = () => {
        setOpenAssign(false);
        setSelectedUser(null);
    };

    const handleRoleChange = (e) => {
        const options = e.target.selectedOptions;
        const values = Array.from(options).map(option => option.value);
        setSelectedRoleIds(values); // Store selected role IDs as an array
    };

    const handleAssignRole = async () => {
        if (!selectedUser || selectedRoleIds.length === 0) return;
        try {
            console.log(`Assigning roles ${selectedRoleIds} to user ${selectedUser.id}`);
            const roleIds = selectedRoleIds.map(id => parseInt(id, 10)); // Convert strings to numbers
            const response = await axiosInstance.post(`/roles/assign/user/${selectedUser.id}`, roleIds);
            const updatedUser = response.data; // Backend returns UserDTO
            setUsers(prev => prev.map(u => (u.id === updatedUser.id ? updatedUser : u)));
            setSnackbarMessage(`Role(s) assigned to ${selectedUser.username} successfully!`);
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
                <DialogTitle>Assign Role(s) to {selectedUser?.username || 'User'}</DialogTitle>
                <DialogContent>
                    <CForm className="row g-3">
                        <CCol xs={12}>
                            <CFormLabel htmlFor="role">Select Role(s)</CFormLabel>
                            <CFormSelect
                                id="role"
                                multiple // Enable multiple selections
                                value={selectedRoleIds}
                                onChange={handleRoleChange}
                            >
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
                        disabled={selectedRoleIds.length === 0} // Disable if no roles selected
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