import React, { useEffect, useState } from 'react';
import {
    CCard, CCardBody, CCardHeader, CCol, CRow, CForm, CFormLabel, CFormInput
} from '@coreui/react';
import {
    TextField, Dialog, Snackbar, Alert, Fade, DialogTitle, DialogContent, DialogActions,
    TablePagination, TableContainer, Box, Table, TableHead, TableRow, TableCell, TableBody, Button
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axiosInstance from "../../axiosConfig";

export default function Directorate() {
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
    const [currentDirectorate, setCurrentDirectorate] = useState({
        directoratename: '', telephone: '', email: ''
    });
    const [formMode, setFormMode] = useState('');

    useEffect(() => {
        console.log("Fetching data for Directorates page...");
        setLoading(true);
        const fetchData = async () => {
            try {
                const response = await axiosInstance.get('/directorates');
                console.log("Directorates fetched:", response.data);
                setDirectorates(Array.isArray(response.data) ? response.data : []);
                setLoading(false);
            } catch (error) {
                const errorMessage = error.response
                    ? `Error ${error.response.status}: ${error.response.data?.message || error.response.data || error.response.statusText}`
                    : error.message;
                console.error('Error fetching directorates:', errorMessage);
                setError(errorMessage);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleConfirmDeleteOpen = (directoratename) => { setDeleteId(directoratename); setConfirmDeleteOpen(true); };
    const handleConfirmDeleteClose = () => { setDeleteId(null); setConfirmDeleteOpen(false); };
    const handleSnackbarClose = () => { setSnackbarOpen(false); };

    const handleDeleteDirectorate = async (directoratename) => {
        try {
            await axiosInstance.delete(`/directorates/${directoratename}`);
            setDirectorates(prev => prev.filter(dir => dir.directoratename !== directoratename));
            setSnackbarMessage('Directorate deleted successfully!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            handleConfirmDeleteClose();
        } catch (error) {
            const msg = error.response?.data || 'Error deleting directorate';
            console.error('Delete error:', error.response);
            setSnackbarMessage(msg);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const clearForm = () => { setCurrentDirectorate({ directoratename: '', telephone: '', email: '' }); };
    const handleOpenAddEdit = () => { setFormMode('new'); clearForm(); setOpenAddEdit(true); };
    const handleCloseAddEdit = () => { setOpenAddEdit(false); };
    const handleCloseDetails = () => { setOpenDetails(false); };
    const handleOpenEdit = (directorate) => { setCurrentDirectorate(directorate); setFormMode('edit'); setOpenAddEdit(true); };
    const handleOpenDetails = (directorate) => { setCurrentDirectorate(directorate); setOpenDetails(true); };
    const handleChangeAdd = (e) => { setCurrentDirectorate({ ...currentDirectorate, [e.target.id]: e.target.value }); };

    const handleAddDirectorate = async () => {
        try {
            console.log("Adding directorate with payload:", currentDirectorate);
            const response = await axiosInstance.post('/directorates', currentDirectorate);
            setDirectorates(prev => [...prev, response.data]);
            setSnackbarMessage('Directorate added successfully!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            clearForm();
            handleCloseAddEdit();
        } catch (error) {
            const msg = error.response?.status === 409 ? 'Directorate name already exists' :
                        error.response?.status === 400 ? error.response.data :
                        error.response?.data || 'Error adding directorate';
            console.error('Add error:', error.response);
            setSnackbarMessage(msg);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const handleEditDirectorate = async () => {
        try {
            console.log("Updating directorate with payload:", currentDirectorate);
            const response = await axiosInstance.put(`/directorates/${currentDirectorate.directoratename}`, currentDirectorate);
            setDirectorates(prev => prev.map(dir => dir.directoratename === currentDirectorate.directoratename ? response.data : dir));
            setSnackbarMessage('Directorate updated successfully!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            clearForm();
            handleCloseAddEdit();
        } catch (error) {
            const msg = error.response?.data || 'Error updating directorate';
            console.error('Update error:', error.response);
            setSnackbarMessage(msg);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const handleChangePage = (event, newPage) => { setPage(newPage); };
    const handleChangeRowsPerPage = (event) => { setRowsPerPage(parseInt(event.target.value, 10)); setPage(0); };
    const handleFilterChange = (event) => { setFilterText(event.target.value); setPage(0); };

    const filteredDirectorates = directorates.filter(dir =>
        (dir.directoratename || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (dir.email || '').toLowerCase().includes(filterText.toLowerCase())
    );

    const isAddButtonDisabled = !currentDirectorate.directoratename.trim();

    return (
        <div>
            <CRow>
                <CCol xs={12}>
                    <CCard className="mb-4">
                        <CCardHeader><strong>Directorates</strong></CCardHeader>
                        <CCardBody>
                            {loading ? <div>Loading...</div> : error ? <div>{error}</div> : (
                                <TableContainer>
                                    <Box display="flex" justifyContent="flex-start">
                                        <Button variant="contained" onClick={handleOpenAddEdit}>New Directorate</Button>
                                    </Box>
                                    <Box display="flex" justifyContent="flex-end" sx={{ padding: '6px' }}>
                                        <TextField label="Search Directorates" variant="outlined" value={filterText} onChange={handleFilterChange} sx={{ width: '40%' }} />
                                    </Box>
                                    {filteredDirectorates.length > 0 ? (
                                        <Table sx={{ '& td': { fontSize: '1rem' }, '& th': { fontWeight: 'bold', fontSize: '1rem', backgroundColor: '#f5f5f5' }, '& tr:nth-of-type(odd)': { backgroundColor: '#f9f9f9' } }}>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>#</TableCell>
                                                    <TableCell>Directorate Name</TableCell>
                                                    <TableCell>Telephone</TableCell>
                                                    <TableCell>Email</TableCell>
                                                    <TableCell></TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {filteredDirectorates.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((dir, index) => (
                                                    <TableRow key={dir.directoratename}>
                                                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                                                        <TableCell>{dir.directoratename}</TableCell>
                                                        <TableCell>{dir.telephone}</TableCell>
                                                        <TableCell>{dir.email}</TableCell>
                                                        <TableCell>
                                                            <Box display="flex" justifyContent="flex-end">
                                                                <Button variant="contained" color="success" size="small" startIcon={<VisibilityIcon />} onClick={() => handleOpenDetails(dir)} style={{ marginRight: '8px' }}>Details</Button>
                                                                <Button variant="contained" color="primary" size="small" startIcon={<EditIcon />} onClick={() => handleOpenEdit(dir)} style={{ marginRight: '8px' }}>Edit</Button>
                                                                <Button variant="contained" color="error" size="small" startIcon={<DeleteIcon />} onClick={() => handleConfirmDeleteOpen(dir.directoratename)}>Delete</Button>
                                                            </Box>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    ) : <div>No directorates found.</div>}
                                    <TablePagination
                                        component="div"
                                        count={filteredDirectorates.length}
                                        page={page}
                                        onPageChange={handleChangePage}
                                        rowsPerPage={rowsPerPage}
                                        onRowsPerPageChange={handleChangeRowsPerPage}
                                        rowsPerPageOptions={[5, 10, 25]}
                                    />
                                </TableContainer>
                            )}
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>

            <Dialog maxWidth="sm" fullWidth open={confirmDeleteOpen} onClose={handleConfirmDeleteClose} TransitionComponent={Fade} TransitionProps={{ timeout: 800 }}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>Are you sure you want to delete this directorate?</DialogContent>
                <DialogActions>
                    <Button onClick={handleConfirmDeleteClose} color="primary">Cancel</Button>
                    <Button onClick={() => handleDeleteDirectorate(deleteId)} color="warning" variant="contained">Delete</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openAddEdit} onClose={handleCloseAddEdit} TransitionComponent={Fade} TransitionProps={{ timeout: 800 }} maxWidth="md">
                <DialogTitle>{formMode === 'new' ? 'Add New Directorate' : 'Edit Directorate'}</DialogTitle>
                <hr />
                <DialogContent>
                    <CForm className="row g-3">
                        <CCol xs={12}>
                            <CFormLabel htmlFor="directoratename">Directorate Name</CFormLabel>
                            <CFormInput id="directoratename" onChange={handleChangeAdd} value={currentDirectorate.directoratename} placeholder="Enter directorate name" disabled={formMode === 'edit'} />
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
                    <Button onClick={handleCloseAddEdit} color="primary">Cancel</Button>
                    <Button 
                        onClick={formMode === 'new' ? handleAddDirectorate : handleEditDirectorate} 
                        color="primary" 
                        variant="contained"
                        disabled={formMode === 'new' && isAddButtonDisabled}
                    >
                        {formMode === 'edit' ? 'Update Directorate' : 'Add Directorate'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openDetails} onClose={handleCloseDetails} TransitionComponent={Fade} TransitionProps={{ timeout: 800 }} maxWidth="md">
                <DialogTitle>Directorate Details</DialogTitle>
                <hr />
                <DialogContent>
                    <CForm className="row g-3">
                        <CCol md={6}><CFormLabel>Directorate Name</CFormLabel><CFormInput value={currentDirectorate.directoratename} readOnly /></CCol>
                        <CCol md={6}><CFormLabel>Telephone</CFormLabel><CFormInput value={currentDirectorate.telephone} readOnly /></CCol>
                        <CCol md={6}><CFormLabel>Email</CFormLabel><CFormInput value={currentDirectorate.email} readOnly /></CCol>
                    </CForm>
                </DialogContent>
                <hr />
                <DialogActions><Button onClick={handleCloseDetails} color="primary">Close</Button></DialogActions>
            </Dialog>

            <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ minWidth: '250px', minHeight: '90px', boxShadow: '4px 4px 6px rgba(0, 0, 0, 0.1)', borderRadius: '8px' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </div>
    );
}