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

export default function BudgetYear() {
    const [budgetYears, setBudgetYears] = useState([]);
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
    const [openAddEdit, setOpenAddEdit] = useState(true);
    const [openDetails, setOpenDetails] = useState(false);
    const [currentBudgetYear, setCurrentBudgetYear] = useState({
        id: null,
        fiscal_year: ''
    });
    const [formMode, setFormMode] = useState('');

    useEffect(() => {
        console.log("Fetching data for Budget Years page...");
        setLoading(true);
        const fetchData = async () => {
            try {
                const response = await axiosInstance.get('/budgetyears/');
                console.log("Budget Years response data:", response.data);
                setBudgetYears(Array.isArray(response.data) ? response.data : []);
                setLoading(false);
            } catch (error) {
                const errorMessage = error.response
                    ? `Error ${error.response.status}: ${error.response.data?.message || error.response.data || error.response.statusText}`
                    : error.message;
                console.error('Error fetching budget years:', errorMessage);
                setError(errorMessage);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleConfirmDeleteOpen = (id) => { setDeleteId(id); setConfirmDeleteOpen(true); };
    const handleConfirmDeleteClose = () => { setDeleteId(null); setConfirmDeleteOpen(false); };
    const handleSnackbarClose = () => { setSnackbarOpen(false); };

    const handleDeleteBudgetYear = async (id) => {
        try {
            await axiosInstance.delete(`/budgetyears/${id}`);
            setBudgetYears(prev => prev.filter(year => year.id !== id));
            setSnackbarMessage('Budget Year deleted successfully!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            handleConfirmDeleteClose();
        } catch (error) {
            const msg = error.response?.data || 'Error deleting budget year';
            console.error('Delete error:', error.response);
            setSnackbarMessage(msg);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const clearForm = () => { setCurrentBudgetYear({ id: null, fiscal_year: '' }); };
    const handleOpenAddEdit = () => { setFormMode('new'); clearForm(); setOpenAddEdit(true); };
    const handleCloseAddEdit = () => { setOpenAddEdit(false); };
    const handleCloseDetails = () => { setOpenDetails(false); };
    const handleOpenEdit = (budgetYear) => { 
        console.log("Opening edit for budget year:", budgetYear);
        setCurrentBudgetYear(budgetYear); 
        setFormMode('edit'); 
        setOpenAddEdit(true); 
    };
    const handleOpenDetails = (budgetYear) => { 
        console.log("Opening details for budget year:", budgetYear);
        setCurrentBudgetYear(budgetYear); 
        setOpenDetails(true); 
    };
    const handleChangeAdd = (e) => { 
        console.log("Form input changed:", e.target.id, e.target.value);
        setCurrentBudgetYear({ ...currentBudgetYear, [e.target.id]: e.target.value }); 
    };

    const handleAddBudgetYear = async () => {
        try {
            console.log("Adding budget year with payload:", { fiscal_year: currentBudgetYear.fiscal_year });
            const response = await axiosInstance.post('/budgetyears/', { fiscal_year: currentBudgetYear.fiscal_year });
            console.log("Add response data:", response.data);
            const fetchResponse = await axiosInstance.get('/budgetyears/');
            console.log("Refetched budget years:", fetchResponse.data);
            setBudgetYears(Array.isArray(fetchResponse.data) ? fetchResponse.data : []);
            setSnackbarMessage('Budget Year added successfully!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            clearForm();
            handleCloseAddEdit();
        } catch (error) {
            const msg = error.response?.data?.message || error.response?.data || 'Error adding budget year';
            console.error('Add error:', error.response || error);
            setSnackbarMessage(msg);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const handleEditBudgetYear = async () => {
        try {
            console.log("Updating budget year with payload:", { fiscal_year: currentBudgetYear.fiscal_year });
            const response = await axiosInstance.put(`/budgetyears/${currentBudgetYear.id}`, { fiscal_year: currentBudgetYear.fiscal_year });
            console.log("Update response data:", response.data);
            setBudgetYears(prev => prev.map(year => year.id === currentBudgetYear.id ? response.data : year));
            setSnackbarMessage('Budget Year updated successfully!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            clearForm();
            handleCloseAddEdit();
        } catch (error) {
            const msg = error.response?.data || 'Error updating budget year';
            console.error('Update error:', error.response);
            setSnackbarMessage(msg);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const handleChangePage = (event, newPage) => { setPage(newPage); };
    const handleChangeRowsPerPage = (event) => { setRowsPerPage(parseInt(event.target.value, 10)); setPage(0); };
    const handleFilterChange = (event) => { setFilterText(event.target.value); setPage(0); };

    const filteredBudgetYears = budgetYears.filter(year =>
        (year.id || '').toString().toLowerCase().includes(filterText.toLowerCase()) ||
        (year.fiscal_year || '').toLowerCase().includes(filterText.toLowerCase())
    );

    const isAddButtonDisabled = !currentBudgetYear.fiscal_year.trim();

    return (
        <div>
            <CRow>
                <CCol xs={12}>
                    <CCard className="mb-4">
                        <CCardHeader><strong>Budget Years</strong></CCardHeader>
                        <CCardBody>
                            {loading ? <div>Loading...</div> : error ? <div>{error}</div> : (
                                <TableContainer>
                                    <Box display="flex" justifyContent="flex-start">
                                        <Button variant="contained" onClick={handleOpenAddEdit}>New Budget Year</Button>
                                    </Box>
                                    <Box display="flex" justifyContent="flex-end" sx={{ padding: '6px' }}>
                                        <TextField label="Search Budget Years" variant="outlined" value={filterText} onChange={handleFilterChange} sx={{ width: '40%' }} />
                                    </Box>
                                    {filteredBudgetYears.length > 0 ? (
                                        <Table sx={{ '& td': { fontSize: '1rem' }, '& th': { fontWeight: 'bold', fontSize: '1rem', backgroundColor: '#f5f5f5' }, '& tr:nth-of-type(odd)': { backgroundColor: '#f9f9f9' } }}>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Fiscal Year</TableCell>
                                                    <TableCell></TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {filteredBudgetYears.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((year, index) => (
                                                    <TableRow key={year.id}>
                                                        <TableCell>{year.fiscal_year || 'N/A'}</TableCell>
                                                        <TableCell>
                                                            <Box display="flex" justifyContent="flex-end">
                                                                <Button variant="contained" color="success" size="small" startIcon={<VisibilityIcon />} onClick={() => handleOpenDetails(year)} style={{ marginRight: '8px' }}>Details</Button>
                                                                <Button variant="contained" color="primary" size="small" startIcon={<EditIcon />} onClick={() => handleOpenEdit(year)} style={{ marginRight: '8px' }}>Edit</Button>
                                                                <Button variant="contained" color="error" size="small" startIcon={<DeleteIcon />} onClick={() => handleConfirmDeleteOpen(year.id)}>Delete</Button>
                                                            </Box>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    ) : <div>No budget years found.</div>}
                                    <TablePagination
                                        component="div"
                                        count={filteredBudgetYears.length}
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
                <DialogContent>Are you sure you want to delete this budget year?</DialogContent>
                <DialogActions>
                    <Button onClick={handleConfirmDeleteClose} color="primary">Cancel</Button>
                    <Button onClick={() => handleDeleteBudgetYear(deleteId)} color="warning" variant="contained">Delete</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openAddEdit} onClose={handleCloseAddEdit} TransitionComponent={Fade} TransitionProps={{ timeout: 800 }} maxWidth="md">
                <DialogTitle>{formMode === 'new' ? 'Add New Budget Year' : 'Edit Budget Year'}</DialogTitle>
                <hr />
                <DialogContent>
                    <CForm className="row g-3">
                        <CCol xs={12}>
                            <CFormLabel htmlFor="fiscal_year">Fiscal Year</CFormLabel>
                            <CFormInput id="fiscal_year" value={currentBudgetYear.fiscal_year || ''} onChange={handleChangeAdd} placeholder="Enter fiscal year" />
                        </CCol>
                    </CForm>
                </DialogContent>
                <hr />
                <DialogActions>
                    <Button onClick={handleCloseAddEdit} color="primary">Cancel</Button>
                    <Button 
                        onClick={formMode === 'new' ? handleAddBudgetYear : handleEditBudgetYear} 
                        color="primary" 
                        variant="contained"
                        disabled={formMode === 'new' && isAddButtonDisabled}
                    >
                        {formMode === 'edit' ? 'Update Budget Year' : 'Add Budget Year'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openDetails} onClose={handleCloseDetails} TransitionComponent={Fade} TransitionProps={{ timeout: 800 }} maxWidth="md">
                <DialogTitle>Budget Year Details</DialogTitle>
                <hr />
                <DialogContent>
                    <CForm className="row g-3">
                        <CCol md={6}><CFormLabel>ID</CFormLabel><CFormInput value={currentBudgetYear.id || ''} readOnly /></CCol>
                        <CCol md={6}><CFormLabel>Fiscal Year</CFormLabel><CFormInput value={currentBudgetYear.fiscal_year || ''} readOnly /></CCol>
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