import React, { useEffect, useState } from 'react';
import {
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CRow,
    CForm,
    CFormLabel,
    CFormInput
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
    Button
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axiosInstance from "../../axiosConfig";

export default function Directorate() {
    const [directorates, setDirectorates] = useState([]);
    const [loading, setLoading] = useState(true); // Add loading state
    const [error, setError] = useState(null); // Add error state
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
    const [currentDirectorate, setCurrentDirectorate] = useState({
        directoratename: '',
        telephone: '',
        email: ''
    });
    const [formMode, setFormMode] = useState('');

    useEffect(() => {
        console.log("Fetching directorates...");
        setLoading(true); // Set loading to true when fetch starts
        axiosInstance.get('/directorates')
            .then((response) => {
                console.log("Directorates fetched:", response.data);
                setDirectorates(response.data || []); // Ensure empty array if null
                setLoading(false); // Set loading to false on success
            })
            .catch((error) => {
                console.error('There was an error fetching the Directorates:', error);
                setError('Failed to load directorates. Please try again later.');
                setLoading(false); // Set loading to false on error
            });
    }, []);

    const handleConfirmDeleteOpen = (directoratename) => {
        setDeleteId(directoratename);
        setConfirmDeleteOpen(true);
    };

    const handleConfirmDeleteClose = () => {
        setDeleteId(null);
        setConfirmDeleteOpen(false);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const handleDeleteDirectorate = async (directoratename) => {
        try {
            setSnackbarOpen(true);
            await axiosInstance.delete(`/directorates/${directoratename}`);
            setDirectorates((directorates) => directorates.filter((dir) => dir.directoratename !== directoratename));
            setSnackbarMessage('The selected directorate has been deleted successfully!');
            setSnackbarSeverity('success');
            handleConfirmDeleteClose();
        } catch (error) {
            console.error('Error occurred deleting the directorate: ', error);
            setSnackbarMessage('There was an error deleting the directorate! Please try again.');
            setSnackbarSeverity('warning');
            setSnackbarOpen(true);
        }
    };

    const clearForm = () => {
        setCurrentDirectorate({
            directoratename: '',
            telephone: '',
            email: ''
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

    const handleOpenEdit = (directorate) => {
        setCurrentDirectorate(directorate);
        setFormMode('edit');
        setOpenAddEdit(true);
    };

    const handleOpenDetails = (directorate) => {
        setCurrentDirectorate(directorate);
        setOpenDetails(true);
    };

    const handleChangeAdd = (e) => {
        setCurrentDirectorate({ ...currentDirectorate, [e.target.id]: e.target.value });
    };

    const handleAddDirectorate = async () => {
        try {
            setSnackbarOpen(true);
            const response = await axiosInstance.post('/directorates', currentDirectorate);
            setDirectorates([...directorates, response.data]);
            clearForm();
            setSnackbarMessage('Directorate was added successfully!');
            setSnackbarSeverity('success');
            handleCloseAddEdit();
        } catch (error) {
            console.log('There was an error adding the directorate!', error);
            setSnackbarMessage('There was an error adding the directorate! Please try again.');
            setSnackbarSeverity('warning');
            setSnackbarOpen(true);
        }
    };

    const handleEditDirectorate = async () => {
        setSnackbarOpen(true);
        try {
            const response = await axiosInstance.put(`/directorates/${currentDirectorate.directoratename}`, currentDirectorate);
            setDirectorates(directorates.map(dir =>
                dir.directoratename === currentDirectorate.directoratename ? response.data : dir
            ));
            clearForm();
            setSnackbarMessage('Directorate was updated successfully!');
            setSnackbarSeverity('success');
            handleCloseAddEdit();
        } catch (error) {
            console.log('There was an error updating the directorate!', error);
            setSnackbarMessage('There was an error updating the directorate! Please try again.');
            setSnackbarSeverity('warning');
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

    const filteredDirectorates = directorates.filter(dir =>
        dir.directoratename.toLowerCase().includes(filterText.toLowerCase()) ||
        dir.email.toLowerCase().includes(filterText.toLowerCase())
    );

    return (
        <div>
            <CRow>
                <CCol xs={12}>
                    <CCard className="mb-4">
                        <CCardHeader>
                            <strong>Directorates</strong>
                        </CCardHeader>
                        <CCardBody>
                            <Box display="flex" justifyContent="flex-start" sx={{ mb: 2 }}>
                                <Button variant="contained" onClick={handleOpenAddEdit}>New Directorate</Button>
                            </Box>
                            {loading ? (
                                <div>Loading...</div>
                            ) : error ? (
                                <div>{error}</div>
                            ) : (
                                <TableContainer>
                                    <Box display="flex" justifyContent="flex-end" sx={{ padding: '6px' }}>
                                        <TextField
                                            width="40%"
                                            label="Search Directorates"
                                            variant="outlined"
                                            value={filterText}
                                            onChange={handleFilterChange}
                                            sx={{ padding: '0px' }}
                                        />
                                    </Box>
                                    {filteredDirectorates.length > 0 ? (
                                        <Table sx={{
                                            fontSize: '2rem',
                                            '& td': { fontSize: '1rem' },
                                            '& th': { fontWeight: 'bold', fontSize: '1rem', backgroundColor: '#f5f5f5' },
                                            '& tr:nth-of-type(odd)': { backgroundColor: '#f9f9f9' }
                                        }}>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell scope="col">#</TableCell>
                                                    <TableCell scope="col">Directorate Name</TableCell>
                                                    <TableCell scope="col">Telephone</TableCell>
                                                    <TableCell scope="col">Email</TableCell>
                                                    <TableCell scope="col"></TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {filteredDirectorates.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((dir, index) => (
                                                    <TableRow key={dir.directoratename}>
                                                        <TableCell scope="row">{page * rowsPerPage + index + 1}</TableCell>
                                                        <TableCell>{dir.directoratename}</TableCell>
                                                        <TableCell>{dir.telephone}</TableCell>
                                                        <TableCell>{dir.email}</TableCell>
                                                        <TableCell>
                                                            <Box display="flex" justifyContent="flex-end">
                                                                <Button
                                                                    variant="contained"
                                                                    color="success"
                                                                    size="small"
                                                                    startIcon={<VisibilityIcon />}
                                                                    onClick={() => handleOpenDetails(dir)}
                                                                    style={{ marginRight: '8px' }}
                                                                >
                                                                    Details
                                                                </Button>
                                                                <Button
                                                                    variant="contained"
                                                                    color="primary"
                                                                    size="small"
                                                                    startIcon={<EditIcon />}
                                                                    onClick={() => handleOpenEdit(dir)}
                                                                    style={{ marginRight: '8px' }}
                                                                >
                                                                    Edit
                                                                </Button>
                                                                <Button
                                                                    variant="contained"
                                                                    color="error"
                                                                    size="small"
                                                                    startIcon={<DeleteIcon />}
                                                                    onClick={() => handleConfirmDeleteOpen(dir.directoratename)}
                                                                >
                                                                    Delete
                                                                </Button>
                                                            </Box>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <div>No directorates found.</div>
                                    )}
                                    {filteredDirectorates.length > 0 && (
                                        <TablePagination
                                            sx={{
                                                ".MuiTablePagination-displayedRows, .MuiTablePagination-selectLabel": {
                                                    "marginTop": "1em",
                                                    "marginBottom": "1em"
                                                }
                                            }}
                                            component="div"
                                            count={filteredDirectorates.length}
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
                    Are you sure you want to delete this directorate?
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleConfirmDeleteClose} color="primary">
                        Cancel
                    </Button>
                    <Button
                        onClick={() => handleDeleteDirectorate(deleteId)}
                        color="warning"
                        variant="contained"
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal Dialog for Add and Edit Directorate */}
            <Dialog
                open={openAddEdit}
                onClose={handleCloseAddEdit}
                TransitionComponent={Fade}
                TransitionProps={{ timeout: 800 }}
                maxWidth="md"
            >
                <DialogTitle>{formMode === 'new' ? 'Add New Directorate' : 'Edit Directorate'}</DialogTitle>
                <hr />
                <DialogContent>
                    <CForm className="row g-3">
                        <CCol xs={12}>
                            <CFormLabel htmlFor="directoratename">Directorate Name</CFormLabel>
                            <CFormInput id="directoratename" onChange={handleChangeAdd} type="text" value={currentDirectorate.directoratename} placeholder="Enter directorate name" />
                        </CCol>
                        <CCol xs={12}>
                            <CFormLabel htmlFor="telephone">Telephone</CFormLabel>
                            <CFormInput id="telephone" value={currentDirectorate.telephone} onChange={handleChangeAdd} placeholder="Telephone" />
                        </CCol>
                        <CCol xs={12}>
                            <CFormLabel htmlFor="email">Email</CFormLabel>
                            <CFormInput id="email" value={currentDirectorate.email} onChange={handleChangeAdd} placeholder="Email" />
                        </CCol>
                    </CForm>
                </DialogContent>
                <hr />
                <DialogActions>
                    <Button onClick={handleCloseAddEdit} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={formMode === 'new' ? handleAddDirectorate : handleEditDirectorate} color="primary" variant="contained">
                        {formMode === 'edit' ? 'Update Directorate' : 'Add Directorate'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal Dialog for Viewing Details of a Directorate */}
            <Dialog
                open={openDetails}
                onClose={handleCloseDetails}
                TransitionComponent={Fade}
                TransitionProps={{ timeout: 800 }}
                maxWidth="md"
            >
                <DialogTitle>Directorate Details</DialogTitle>
                <hr />
                <DialogContent>
                    <CForm className="row g-3">
                        <CCol md={6}>
                            <CFormLabel htmlFor="directoratename">Directorate Name</CFormLabel>
                            <CFormInput value={currentDirectorate.directoratename} readOnly={true} />
                        </CCol>
                        <CCol md={6}>
                            <CFormLabel htmlFor="telephone">Telephone</CFormLabel>
                            <CFormInput value={currentDirectorate.telephone} readOnly={true} />
                        </CCol>
                        <CCol md={6}>
                            <CFormLabel htmlFor="email">Email</CFormLabel>
                            <CFormInput value={currentDirectorate.email} readOnly={true} />
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