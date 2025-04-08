import React, { useEffect, useState } from 'react';
import {
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CRow,
    CForm,
    CFormLabel,
    CFormInput,
    CFormSelect, // Added for dropdowns
} from '@coreui/react';
import {
    TextField,
    Dialog,
    Snackbar,
    Alert,
    Fade,
    DialogTitle,
    DialogContent,
    DialogActions,
    TablePagination,
    TableContainer,
    Box,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Button,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axiosInstance from "../../axiosConfig"; // Assuming you have this configured

export default function User() {
    const [users, setUsers] = useState([]);
    const [organizations, setOrganizations] = useState([]); // Store organization options
    const [directorates, setDirectorates] = useState([]);   // Store directorate options
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
        id: '',
        firstName: '',
        lastName: '',
        username: '',
        password: '',
        organization: null,  // Changed from org_id
        directorate: null    // Changed from user_dir_name
    });
    const [formMode, setFormMode] = useState('');

    // Fetch users, organizations, and directorates on component mount
    useEffect(() => {
        // Fetch users
        axiosInstance.get('/api/users')
            .then((response) => {
                setUsers(response.data);
            })
            .catch((error) => {
                console.error('There was an error fetching the Users:', error);
            });

        // Fetch organizations
        axiosInstance.get('/api/organizations')
            .then((response) => {
                setOrganizations(response.data); // Expecting [{id: '', name: ''}, ...]
            })
            .catch((error) => {
                console.error('There was an error fetching the Organizations:', error);
            });

        // Fetch directorates
        axiosInstance.get('/api/directorates')
            .then((response) => {
                setDirectorates(response.data); // Expecting [{name: ''}, ...]
            })
            .catch((error) => {
                console.error('There was an error fetching the Directorates:', error);
            });
    }, []);

    const handleConfirmDeleteOpen = (id) => {
        setDeleteId(id);
        setConfirmDeleteOpen(true);
    };

    const handleConfirmDeleteClose = () => {
        setDeleteId(null);
        setConfirmDeleteOpen(false);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const handleDeleteUser = async (id) => {
        try {
            await axiosInstance.delete(`/api/users/${id}`);
            setUsers((users) => users.filter((user) => user.id !== id));
            setSnackbarMessage('The selected user has been deleted successfully!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            handleConfirmDeleteClose();
        } catch (error) {
            console.error('Error occurred deleting the user: ', error);
            setSnackbarMessage('There was an error deleting the user! Please try again.');
            setSnackbarSeverity('warning');
            setSnackbarOpen(true);
        }
    };

    const clearForm = () => {
        setCurrentUser({
            id: '',
            firstName: '',
            lastName: '',
            username: '',
            password: '',
            org_id: '',
            user_dir_name: '',
        });
    };

    const handleOpenAddEdit = () => {
        setFormMode('new');
        clearForm();
        setOpenAddEdit(true);
    };

    const handleCloseAddEdit = () => {
        setOpenAddEdit(false);
    };

    const handleCloseDetails = () => {
        setOpenDetails(false);
    };

    const handleOpenEdit = (user) => {
        setCurrentUser(user);
        setFormMode('edit');
        setOpenAddEdit(true);
    };

    const handleOpenDetails = (user) => {
        setCurrentUser(user);
        setOpenDetails(true);
    };

    const handleChangeAdd = (e) => {
        setCurrentUser({ ...currentUser, [e.target.id]: e.target.value });
    };

    const handleAddUser = async () => {
        try {
            const response = await axiosInstance.post('/api/users', currentUser);
            setUsers([...users, response.data]);
            clearForm();
            setSnackbarMessage('User was added successfully!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            handleCloseAddEdit();
        } catch (error) {
            console.log('There was an error adding the user!', error);
            setSnackbarMessage('There was an error adding the user! Please try again.');
            setSnackbarSeverity('warning');
            setSnackbarOpen(true);
        }
    };

    const handleEditUser = async () => {
        try {
            const response = await axiosInstance.put(`/api/users/${currentUser.id}`, currentUser);
            setUsers(users.map(user =>
                user.id === currentUser.id ? response.data : user
            ));
            clearForm();
            setSnackbarMessage('User was updated successfully!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            handleCloseAddEdit();
        } catch (error) {
            console.log('There was an error updating the user!', error);
            setSnackbarMessage('There was an error updating the user! Please try again.');
            setSnackbarSeverity('warning');
            setSnackbarOpen(true);
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleFilterChange = (event) => {
        setFilterText(event.target.value);
        setPage(0);
    };

    const filteredUsers = users.filter(user =>
        (user.username || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (user.firstName || '').toLowerCase().includes(filterText.toLowerCase())
    );

    return (
        <div>
            <CRow>
                <CCol xs={12}>
                    <CCard className="mb-4">
                        <CCardHeader>
                            <strong>Users</strong>
                        </CCardHeader>
                        <CCardBody>
                            {filteredUsers != null ? (
                                <TableContainer>
                                    <Box display="flex" justifyContent="flex-start">
                                        <Button variant='contained' onClick={handleOpenAddEdit}>New User</Button>
                                    </Box>
                                    <Box display="flex" justifyContent="flex-end" sx={{ padding: '6px' }}>
                                        <TextField
                                            label="Search Users"
                                            variant="outlined"
                                            value={filterText}
                                            onChange={handleFilterChange}
                                            sx={{ padding: '0px', width: '40%' }}
                                        />
                                    </Box>
                                    <Table sx={{
                                        fontSize: '2rem',
                                        '& td': { fontSize: '1rem' },
                                        '& th': { fontWeight: 'bold', fontSize: '1rem', backgroundColor: '#f5f5f5' },
                                        '& tr:nth-of-type(odd)': { backgroundColor: '#f9f9f9' }
                                    }}>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell scope="col">#</TableCell>
                                                <TableCell scope="col">First Name</TableCell>
                                                <TableCell scope="col">Last Name</TableCell>
                                                <TableCell scope="col">Username</TableCell>
                                                <TableCell scope="col">Organization</TableCell>
                                                <TableCell scope="col">Directorate</TableCell>
                                                <TableCell scope="col"></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user, index) => (
                                                <TableRow key={user.id}>
                                                    <TableCell scope="row">{page * rowsPerPage + index + 1}</TableCell>
                                                    <TableCell>{user.firstName}</TableCell>
                                                    <TableCell>{user.lastName}</TableCell>
                                                    <TableCell>{user.username}</TableCell>
                                                    <TableCell>{user.organization?.name || 'N/A'}</TableCell> {/* Could display organization name if joined */}
                                                    <TableCell>{user.directorate?.name || 'N/A'}</TableCell>
                                                    <TableCell>
                                                        <Box display="flex" justifyContent="flex-end">
                                                            <Button
                                                                variant="contained"
                                                                color="success"
                                                                size="small"
                                                                startIcon={<VisibilityIcon />}
                                                                onClick={() => handleOpenDetails(user)}
                                                                style={{ marginRight: '8px' }}
                                                            >
                                                                Details
                                                            </Button>
                                                            <Button
                                                                variant="contained"
                                                                color="primary"
                                                                size="small"
                                                                startIcon={<EditIcon />}
                                                                onClick={() => handleOpenEdit(user)}
                                                                style={{ marginRight: '8px' }}
                                                            >
                                                                Edit
                                                            </Button>
                                                            <Button
                                                                variant="contained"
                                                                color="error"
                                                                size="small"
                                                                startIcon={<DeleteIcon />}
                                                                onClick={() => handleConfirmDeleteOpen(user.id)}
                                                            >
                                                                Delete
                                                            </Button>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    <TablePagination
                                        sx={{
                                            ".MuiTablePagination-displayedRows, .MuiTablePagination-selectLabel": {
                                                "marginTop": "1em",
                                                "marginBottom": "1em"
                                            }
                                        }}
                                        component="div"
                                        count={filteredUsers.length}
                                        page={page}
                                        onPageChange={handleChangePage}
                                        rowsPerPage={rowsPerPage}
                                        onRowsPerPageChange={handleChangeRowsPerPage}
                                        rowsPerPageOptions={[5, 10, 25]}
                                    />
                                </TableContainer>
                            ) : (
                                <div>Loading...</div>
                            )}
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>

            {/* Confirmation Dialog for Deletion */}
            <Dialog
                maxWidth="sm"
                fullWidth
                open={confirmDeleteOpen}
                onClose={handleConfirmDeleteClose}
                TransitionComponent={Fade}
                TransitionProps={{ timeout: 800 }}
            >
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete this user?
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleConfirmDeleteClose} color="primary">
                        Cancel
                    </Button>
                    <Button
                        onClick={() => handleDeleteUser(deleteId)}
                        color="warning"
                        variant="contained"
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal Dialog for Add and Edit User */}
            <Dialog
                open={openAddEdit}
                onClose={handleCloseAddEdit}
                TransitionComponent={Fade}
                TransitionProps={{ timeout: 800 }}
                maxWidth="md"
            >
                <DialogTitle>{formMode === 'new' ? 'Add New User' : 'Edit User'}</DialogTitle>
                <hr />
                <DialogContent>
                    <CForm className="row g-3">
                        <CCol xs={12}>
                            <CFormLabel htmlFor="firstName">First Name</CFormLabel>
                            <CFormInput id="firstName" value={currentUser.firstName} onChange={handleChangeAdd} placeholder="First Name" />
                        </CCol>
                        <CCol xs={12}>
                            <CFormLabel htmlFor="lastName">Last Name</CFormLabel>
                            <CFormInput id="lastName" value={currentUser.lastName} onChange={handleChangeAdd} placeholder="Last Name" />
                        </CCol>
                        <CCol xs={12}>
                            <CFormLabel htmlFor="username">Username</CFormLabel>
                            <CFormInput id="username" value={currentUser.username} onChange={handleChangeAdd} placeholder="Username" />
                        </CCol>
                        {formMode === 'new' && (
                            <CCol xs={12}>
                                <CFormLabel htmlFor="password">Password</CFormLabel>
                                <CFormInput id="password" type="password" value={currentUser.password} onChange={handleChangeAdd} placeholder="Password" />
                            </CCol>
                        )}
                        <CCol xs={12}>
                            <CFormLabel htmlFor="org_id">Organization</CFormLabel>
                            <CFormSelect
                                id="organization"
                                value={currentUser.organization?.id || ''}
                                onChange={(e) => {
                                    const orgId = e.target.value;
                                    setCurrentUser({
                                        ...currentUser,
                                        organization: organizations.find(o => o.id === orgId) || null
                                    });
                                }}
                            >
                                <option value="">Select Organization</option>
                                {organizations.map((org) => (
                                    <option key={org.id} value={org.id}>
                                        {org.name}
                                    </option>
                                ))}
                            </CFormSelect>
                        </CCol>
                        <CCol xs={12}>
                            <CFormLabel htmlFor="user_dir_name">Directorate</CFormLabel>
                            <CFormSelect
                                id="directorate"
                                value={currentUser.directorate?.name || ''}
                                onChange={(e) => {
                                    const dirName = e.target.value;
                                    setCurrentUser({
                                        ...currentUser,
                                        directorate: directorates.find(d => d.name === dirName) || null
                                    });
                                }}
                            >
                                <option value="">Select Directorate</option>
                                {directorates.map((dir) => (
                                    <option key={dir.name} value={dir.name}>
                                        {dir.name}
                                    </option>
                                ))}
                            </CFormSelect>

                        </CCol>
                    </CForm>
                </DialogContent>
                <hr />
                <DialogActions>
                    <Button onClick={handleCloseAddEdit} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={formMode === 'new' ? handleAddUser : handleEditUser} color="primary" variant="contained">
                        {formMode === 'edit' ? 'Update User' : 'Add User'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal Dialog for Viewing Details of a User */}
            <Dialog
                open={openDetails}
                onClose={handleCloseDetails}
                TransitionComponent={Fade}
                TransitionProps={{ timeout: 800 }}
                maxWidth="md"
            >
                <DialogTitle>User Details</DialogTitle>
                <hr />
                <DialogContent>
                    <CForm className="row g-3">
                        <CCol md={6}>
                            <CFormLabel htmlFor="id">User ID</CFormLabel>
                            <CFormInput value={currentUser.id} readOnly={true} />
                        </CCol>
                        <CCol md={6}>
                            <CFormLabel htmlFor="firstName">First Name</CFormLabel>
                            <CFormInput value={currentUser.firstName} readOnly={true} />
                        </CCol>
                        <CCol md={6}>
                            <CFormLabel htmlFor="lastName">Last Name</CFormLabel>
                            <CFormInput value={currentUser.lastName} readOnly={true} />
                        </CCol>
                        <CCol md={6}>
                            <CFormLabel htmlFor="username">Username</CFormLabel>
                            <CFormInput value={currentUser.username} readOnly={true} />
                        </CCol>
                        <CCol md={6}>
                            <CFormLabel htmlFor="org_id">Organization</CFormLabel>
                            <CFormInput
                                value={organizations.find(org => org.id === currentUser.org_id)?.name || currentUser.org_id}
                                readOnly={true}
                            />
                        </CCol>
                        <CCol md={6}>
                            <CFormLabel htmlFor="user_dir_name">Directorate</CFormLabel>
                            <CFormInput value={currentUser.user_dir_name} readOnly={true} />
                        </CCol>
                    </CForm>
                </DialogContent>
                <hr />
                <DialogActions>
                    <Button onClick={handleCloseDetails} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar Notification */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={snackbarSeverity}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        minWidth: '250px',
                        minHeight: '90px',
                        boxShadow: '4px 4px 6px rgba(0, 0, 0, 0.1)',
                        borderRadius: '8px',
                        overflow: 'hidden',
                    }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </div>
    );
}