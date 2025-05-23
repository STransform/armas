import React, { useEffect, useState } from 'react';
import {
    CCard, CCardBody, CCardHeader, CCol, CRow, CForm, CFormLabel, CFormInput, CFormSelect,
} from '@coreui/react';
import {
    TextField, Dialog, Snackbar, Alert, Fade, DialogTitle, DialogContent, DialogActions,
    TablePagination, TableContainer, Box, Table, TableHead, TableRow, TableCell, TableBody, Button,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axiosInstance from "../../axiosConfig";

export default function User() {
    const [users, setUsers] = useState([]);
    const [organizations, setOrganizations] = useState([]);
    const [directorates, setDirectorates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [filterText, setFilterText] = useState('');
    const [deleteId, setDeleteId] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [openAddEdit, setOpenAddEdit] = useState(false);
    const [openDetails, setOpenDetails] = useState(false);
    const [currentUser, setCurrentUser] = useState({
        id: '', firstName: '', lastName: '', username: '', password: '',
        organizationId: '', directorateId: ''
    });
    const [formMode, setFormMode] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersResponse, orgsResponse, dirsResponse] = await Promise.all([
                    axiosInstance.get('/users'),
                    axiosInstance.get('/organizations'),
                    axiosInstance.get('/directorates')
                ]);
                setUsers(Array.isArray(usersResponse.data) ? usersResponse.data : []);
                setOrganizations(Array.isArray(orgsResponse.data) ? orgsResponse.data : []);
                setDirectorates(Array.isArray(dirsResponse.data) ? dirsResponse.data : []);
                setLoading(false);
            } catch (error) {
                setError(error.response?.data?.message || error.message);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleConfirmDeleteOpen = (id) => { setDeleteId(id); setConfirmDeleteOpen(true); };
    const handleConfirmDeleteClose = () => { setDeleteId(null); setConfirmDeleteOpen(false); };
    const handleSnackbarClose = () => { setSnackbarOpen(false); };

    const handleDeleteUser = async (id) => {
        try {
            await axiosInstance.delete(`/users/${id}`);
            setUsers(users.filter(user => user.id !== id));
            setSnackbarMessage('User deleted successfully!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            handleConfirmDeleteClose();
        } catch (error) {
            setSnackbarMessage('Error deleting user: ' + (error.response?.data?.message || error.message));
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const clearForm = () => {
        setCurrentUser({ id: '', firstName: '', lastName: '', username: '', password: '', organizationId: '', directorateId: '' });
    };

    const handleOpenAddEdit = () => { setFormMode('new'); clearForm(); setOpenAddEdit(true); };
    const handleCloseAddEdit = () => { setOpenAddEdit(false); };
    const handleCloseDetails = () => { setOpenDetails(false); };

    const handleOpenEdit = (user) => {
        setCurrentUser({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            password: '',
            organizationId: user.organization?.id || '',
            directorateId: user.directorate?.id || ''
        });
        setFormMode('edit');
        setOpenAddEdit(true);
    };

    const handleOpenDetails = (user) => {
        setCurrentUser({
            id: user.id, firstName: user.firstName, lastName: user.lastName, username: user.username,
            organizationId: user.organization?.id || '', directorateId: user.directorate?.id || ''
        });
        setOpenDetails(true);
    };

    const handleChangeAdd = (e) => {
        const { id, value } = e.target;
        setCurrentUser(prev => ({ ...prev, [id]: value }));
    };

    const handleOrganizationChange = (e) => { setCurrentUser(prev => ({ ...prev, organizationId: e.target.value })); };
    const handleDirectorateChange = (e) => { setCurrentUser(prev => ({ ...prev, directorateId: e.target.value })); };

    const handleAddUser = async () => {
        try {
            const payload = {
                firstName: currentUser.firstName,
                lastName: currentUser.lastName,
                username: currentUser.username,
                password: currentUser.password,
                confirmPassword: currentUser.password,
                organizationId: currentUser.organizationId || null,
                directorateId: currentUser.directorateId || null,
                role: "USER"
            };
            const response = await axiosInstance.post('/users', payload);
            const fullUser = await axiosInstance.get(`/users/${response.data.id}`);
            setUsers(prev => [...prev, fullUser.data]);
            clearForm();
            setSnackbarMessage('User added successfully!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            handleCloseAddEdit();
        } catch (error) {
            setSnackbarMessage('Error adding user: ' + (error.response?.data || error.message));
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const handleEditUser = async () => {
        try {
            const payload = {
                firstName: currentUser.firstName,
                lastName: currentUser.lastName,
                username: currentUser.username,
                organization: currentUser.organizationId ? { id: currentUser.organizationId } : null,
                directorate: currentUser.directorateId ? { id: currentUser.directorateId } : null
            };
            if (currentUser.password) payload.password = currentUser.password;
            const response = await axiosInstance.put(`/users/${currentUser.id}`, payload);
            const updatedUser = await axiosInstance.get(`/users/${currentUser.id}`);
            setUsers(prev => prev.map(user => user.id === currentUser.id ? updatedUser.data : user));
            clearForm();
            setSnackbarMessage('User updated successfully!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            handleCloseAddEdit();
        } catch (error) {
            setSnackbarMessage('Error updating user: ' + (error.response?.data?.message || error.message));
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const handleChangePage = (event, newPage) => { setPage(newPage); };
    const handleChangeRowsPerPage = (event) => { setRowsPerPage(parseInt(event.target.value, 10)); setPage(0); };
    const handleFilterChange = (event) => { setFilterText(event.target.value); setPage(0); };

    const filteredUsers = users.filter(user =>
        (user.username?.toLowerCase() || '').includes(filterText.toLowerCase()) ||
        (user.firstName?.toLowerCase() || '').includes(filterText.toLowerCase()) ||
        (user.lastName?.toLowerCase() || '').includes(filterText.toLowerCase()) ||
        (user.organization?.orgname?.toLowerCase() || user.orgname?.toLowerCase() || '').includes(filterText.toLowerCase()) ||
        (user.directorate?.directoratename?.toLowerCase() || user.directoratename?.toLowerCase() || '').includes(filterText.toLowerCase())
    );

    return (
        <div>
            <CRow>
                <CCol xs={12}>
                    <CCard className="mb-4">
                        <CCardHeader><strong>Users</strong></CCardHeader>
                        <CCardBody>
                            <Box display="flex" justifyContent="flex-start" sx={{ mb: 2 }}>
                                <Button variant="contained" onClick={handleOpenAddEdit}>New User</Button>
                            </Box>
                            {loading ? <div>Loading...</div> : error ? <div>{error}</div> : (
                                <TableContainer>
                                    <Box display="flex" justifyContent="flex-end" sx={{ padding: '6px' }}>
                                        <TextField label="Search Users" variant="outlined" value={filterText} onChange={handleFilterChange} sx={{ width: '40%' }} />
                                    </Box>
                                    {filteredUsers.length > 0 ? (
                                        <Table sx={{ '& td': { fontSize: '1rem' }, '& th': { fontWeight: 'bold', fontSize: '1rem', backgroundColor: '#f5f5f5' }, '& tr:nth-of-type(odd)': { backgroundColor: '#f9f9f9' } }}>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>#</TableCell>
                                                    <TableCell>First Name</TableCell>
                                                    <TableCell>Last Name</TableCell>
                                                    <TableCell>Username</TableCell>
                                                    <TableCell>Organization</TableCell>
                                                    <TableCell>Directorate</TableCell>
                                                    <TableCell></TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user, index) => (
                                                    <TableRow key={user.id}>
                                                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                                                        <TableCell>{user.firstName}</TableCell>
                                                        <TableCell>{user.lastName}</TableCell>
                                                        <TableCell>{user.username}</TableCell>
                                                        <TableCell>{user.organization?.orgname || user.orgname || 'N/A'}</TableCell>
                                                        <TableCell>{user.directorate?.directoratename || user.directoratename || 'N/A'}</TableCell>
                                                        <TableCell>
                                                            <Box display="flex" justifyContent="flex-end">
                                                                <Button variant="contained" color="success" size="small" startIcon={<VisibilityIcon />} onClick={() => handleOpenDetails(user)} style={{ marginRight: '8px' }}>Details</Button>
                                                                <Button variant="contained" color="primary" size="small" startIcon={<EditIcon />} onClick={() => handleOpenEdit(user)} style={{ marginRight: '8px' }}>Edit</Button>
                                                                <Button variant="contained" color="error" size="small" startIcon={<DeleteIcon />} onClick={() => handleConfirmDeleteOpen(user.id)}>Delete</Button>
                                                            </Box>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    ) : <div>No users found.</div>}
                                    {filteredUsers.length > 0 && (
                                        <TablePagination
                                            sx={{ ".MuiTablePagination-displayedRows, .MuiTablePagination-selectLabel": { "marginTop": "1em", "marginBottom": "1em" } }}
                                            component="div"
                                            count={filteredUsers.length}
                                            page={page}
                                            onPageChange={handleChangePage}
                                            rowsPerPage={rowsPerPage}
                                            onRowsPerPageChange={handleChangeRowsPerPage}
                                            rowsPerPageOptions={[5, 10, 25]}
                                        />
                                    )}
                                </TableContainer>
                            )}
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>

            <Dialog maxWidth="sm" fullWidth open={confirmDeleteOpen} onClose={handleConfirmDeleteClose} TransitionComponent={Fade} TransitionProps={{ timeout: 800 }}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>Are you sure you want to delete this user?</DialogContent>
                <DialogActions>
                    <Button onClick={handleConfirmDeleteClose} color="primary">Cancel</Button>
                    <Button onClick={() => handleDeleteUser(deleteId)} color="warning" variant="contained">Delete</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openAddEdit} onClose={handleCloseAddEdit} TransitionComponent={Fade} TransitionProps={{ timeout: 800 }} maxWidth="md">
                <DialogTitle>{formMode === 'new' ? 'Add New User' : 'Edit User'}</DialogTitle>
                <hr />
                <DialogContent>
                    <CForm className="row g-3">
                        <CCol xs={12}><CFormLabel htmlFor="firstName">First Name</CFormLabel><CFormInput id="firstName" value={currentUser.firstName} onChange={handleChangeAdd} placeholder="First Name" /></CCol>
                        <CCol xs={12}><CFormLabel htmlFor="lastName">Last Name</CFormLabel><CFormInput id="lastName" value={currentUser.lastName} onChange={handleChangeAdd} placeholder="Last Name" /></CCol>
                        <CCol xs={12}><CFormLabel htmlFor="username">Username</CFormLabel><CFormInput id="username" value={currentUser.username} onChange={handleChangeAdd} placeholder="Username" /></CCol>
                        {formMode === 'new' && (
                            <CCol xs={12}><CFormLabel htmlFor="password">Password</CFormLabel><CFormInput id="password" type="password" value={currentUser.password} onChange={handleChangeAdd} placeholder="Password" /></CCol>
                        )}
                        <CCol xs={12}>
                            <CFormLabel htmlFor="organization">Organization</CFormLabel>
                            <CFormSelect id="organization" value={currentUser.organizationId || ''} onChange={handleOrganizationChange}>
                                <option value="">Select Organization</option>
                                {organizations.map(org => <option key={org.id} value={org.id}>{org.orgname}</option>)}
                            </CFormSelect>
                        </CCol>
                        <CCol xs={12}>
                            <CFormLabel htmlFor="directorate">Directorate</CFormLabel>
                            <CFormSelect id="directorate" value={currentUser.directorateId || ''} onChange={handleDirectorateChange}>
                                <option value="">Select Directorate</option>
                                {directorates.map(dir => <option key={dir.id} value={dir.id}>{dir.directoratename}</option>)}
                            </CFormSelect>
                        </CCol>
                    </CForm>
                </DialogContent>
                <hr />
                <DialogActions>
                    <Button onClick={handleCloseAddEdit} color="primary">Cancel</Button>
                    <Button onClick={formMode === 'new' ? handleAddUser : handleEditUser} color="primary" variant="contained" disabled={!currentUser.firstName || !currentUser.lastName || !currentUser.username || (formMode === 'new' && !currentUser.password)}>
                        {formMode === 'edit' ? 'Update User' : 'Add User'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openDetails} onClose={handleCloseDetails} TransitionComponent={Fade} TransitionProps={{ timeout: 800 }} maxWidth="md">
                <DialogTitle>User Details</DialogTitle>
                <hr />
                <DialogContent>
                    <CForm className="row g-3">
                        <CCol md={6}><CFormLabel htmlFor="id">User ID</CFormLabel><CFormInput value={currentUser.id} readOnly={true} /></CCol>
                        <CCol md={6}><CFormLabel htmlFor="firstName">First Name</CFormLabel><CFormInput value={currentUser.firstName} readOnly={true} /></CCol>
                        <CCol md={6}><CFormLabel htmlFor="lastName">Last Name</CFormLabel><CFormInput value={currentUser.lastName} readOnly={true} /></CCol>
                        <CCol md={6}><CFormLabel htmlFor="username">Username</CFormLabel><CFormInput value={currentUser.username} readOnly={true} /></CCol>
                        <CCol md={6}><CFormLabel htmlFor="organization">Organization</CFormLabel><CFormInput value={organizations.find(org => org.id === currentUser.organizationId)?.orgname || 'N/A'} readOnly={true} /></CCol>
                        <CCol md={6}><CFormLabel htmlFor="directorate">Directorate</CFormLabel><CFormInput value={directorates.find(dir => dir.id === currentUser.directorateId)?.directoratename || 'N/A'} readOnly={true} /></CCol>
                    </CForm>
                </DialogContent>
                <hr />
                <DialogActions><Button onClick={handleCloseDetails} color="primary">Close</Button></DialogActions>
            </Dialog>

            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ minWidth: '250px', minHeight: '90px', boxShadow: '4px 4px 6px rgba(0, 0, 0, 0.1)', borderRadius: '8px' }}>
                    <div><strong>{snackbarSeverity === 'error' ? 'Error' : 'Success'}</strong><div>{snackbarMessage}</div></div>
                </Alert>
            </Snackbar>
        </div>
    );
}