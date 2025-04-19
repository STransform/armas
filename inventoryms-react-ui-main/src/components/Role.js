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
import axiosInstance from "../../axiosConfig";

export default function Role() {
    const [roles, setRoles] = useState([]);
    const [privileges, setPrivileges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [filterText, setFilterText] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [openAdd, setOpenAdd] = useState(false);
    const [newRole, setNewRole] = useState({
        description: '',
        details: '',
        privileges: []
    });

    useEffect(() => {
        console.log("Role component mounted");
        const fetchData = async () => {
            try {
                console.log("Fetching roles...");
                const rolesResponse = await axiosInstance.get('/api/roles');
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

    const handleOpenAdd = () => {
        setNewRole({ description: '', details: '', privileges: [] });
        setOpenAdd(true);
    };

    const handleCloseAdd = () => {
        setOpenAdd(false);
    };

    const handleChangeAdd = (e) => {
        const { id, value } = e.target;
        setNewRole(prev => ({ ...prev, [id]: value }));
    };

    const handleAddRole = async () => {
        try {
            console.log("Adding role:", newRole);
            const response = await axiosInstance.post('/api/roles', newRole);
            console.log("Role added:", response.data);
            setRoles(prev => [...prev, response.data]);
            setSnackbarMessage('Role added successfully!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            handleCloseAdd();
        } catch (error) {
            console.error("Error adding role:", error);
            setSnackbarMessage('Failed to add role: ' + (error.response?.data || error.message));
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const handleFilterChange = (event) => {
        setFilterText(event.target.value);
        setPage(0);
    };

    const filteredRoles = roles.filter(role =>
        role.description.toLowerCase().includes(filterText.toLowerCase())
    );

    console.log("Rendering Role component, roles:", roles);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div>
            <CRow>
                <CCol xs={12}>
                    <CCard className="mb-4">
                        <CCardHeader><strong>Roles</strong></CCardHeader>
                        <CCardBody>
                            <Box display="flex" justifyContent="flex-start" sx={{ mb: 2 }}>
                                <Button variant="contained" onClick={handleOpenAdd}>New Role</Button>
                            </Box>
                            <TableContainer>
                                <Box display="flex" justifyContent="flex-end" sx={{ padding: '6px' }}>
                                    <TextField
                                        label="Search Roles"
                                        variant="outlined"
                                        value={filterText}
                                        onChange={handleFilterChange}
                                        sx={{ width: '40%' }}
                                    />
                                </Box>
                                {filteredRoles.length > 0 ? (
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>#</TableCell>
                                                <TableCell>Description</TableCell>
                                                <TableCell>Details</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredRoles.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((role, index) => (
                                                <TableRow key={role.id}>
                                                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                                                    <TableCell>{role.description}</TableCell>
                                                    <TableCell>{role.details}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div>No roles found.</div>
                                )}
                                <TablePagination
                                    component="div"
                                    count={filteredRoles.length}
                                    page={page}
                                    onPageChange={(e, newPage) => setPage(newPage)}
                                    rowsPerPage={rowsPerPage}
                                    onRowsPerPageChange={(e) => {
                                        setRowsPerPage(parseInt(e.target.value, 10));
                                        setPage(0);
                                    }}
                                    rowsPerPageOptions={[5, 10, 25]}
                                />
                            </TableContainer>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>

            <Dialog open={openAdd} onClose={handleCloseAdd} maxWidth="sm" fullWidth>
                <DialogTitle>Add New Role</DialogTitle>
                <DialogContent>
                    <CForm className="row g-3">
                        <CCol xs={12}>
                            <CFormLabel htmlFor="description">Description</CFormLabel>
                            <CFormInput
                                id="description"
                                value={newRole.description}
                                onChange={handleChangeAdd}
                                placeholder="e.g., MANAGER"
                            />
                        </CCol>
                        <CCol xs={12}>
                            <CFormLabel htmlFor="details">Details</CFormLabel>
                            <CFormInput
                                id="details"
                                value={newRole.details}
                                onChange={handleChangeAdd}
                                placeholder="e.g., Manager role with specific access"
                            />
                        </CCol>
                    </CForm>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAdd}>Cancel</Button>
                    <Button onClick={handleAddRole} variant="contained" disabled={!newRole.description}>
                        Add Role
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