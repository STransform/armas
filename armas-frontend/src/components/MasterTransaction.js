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
    CFormSelect
} from '@coreui/react';
import {
    TextField,
    Dialog,
    Snackbar,
    Alert,
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

export default function MasterTransaction() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [filterText, setFilterText] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [openAddEdit, setOpenAddEdit] = useState(false);
    const [openDetails, setOpenDetails] = useState(false);
    const [currentTransaction, setCurrentTransaction] = useState({
        id: null,
        docname: '',
        reportstatus: '',
        remarks: '',
        response_needed: '',
        fiscal_year: '',
        reportcategory: '',
        filepath: '',
        theOrg_id: '',
        assigned_expert_user_id: '',
        transactiondocumentid: ''
    });
    const [file, setFile] = useState(null);
    const [formMode, setFormMode] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axiosInstance.get('/api/master-transactions');
                setTransactions(Array.isArray(response.data) ? response.data : []);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching transactions:', error);
                setError('Failed to load transactions.');
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleConfirmDeleteOpen = (id) => {
        setDeleteId(id);
        setConfirmDeleteOpen(true);
    };

    const handleConfirmDeleteClose = () => {
        setDeleteId(null);
        setConfirmDeleteOpen(false);
    };

    const handleDeleteTransaction = async () => {
        try {
            await axiosInstance.delete(`/api/master-transactions/${deleteId}`);
            setTransactions(transactions.filter(t => t.id !== deleteId));
            setSnackbarMessage('Transaction deleted successfully!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            handleConfirmDeleteClose();
        } catch (error) {
            setSnackbarMessage('Error deleting transaction!');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const handleOpenAddEdit = (mode, transaction = null) => {
        setFormMode(mode);
        setCurrentTransaction(transaction || {
            docname: '',
            reportstatus: '',
            remarks: '',
            response_needed: '',
            fiscal_year: '',
            reportcategory: '',
            filepath: '',
            theOrg_id: '',
            assigned_expert_user_id: '',
            transactiondocumentid: ''
        });
        setFile(null);
        setOpenAddEdit(true);
    };

    const handleCloseAddEdit = () => setOpenAddEdit(false);

    const handleOpenDetails = (transaction) => {
        setCurrentTransaction(transaction);
        setOpenDetails(true);
    };

    const handleCloseDetails = () => setOpenDetails(false);

    const handleChangeAdd = (e) => {
        setCurrentTransaction({ ...currentTransaction, [e.target.id]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        if (e.target.files[0]) {
            setCurrentTransaction({ ...currentTransaction, docname: e.target.files[0].name });
        }
    };

    const handleAddTransaction = async () => {
        try {
            const formData = new FormData();
            formData.append('transaction', new Blob([JSON.stringify(currentTransaction)], { type: 'application/json' }));
            if (file) {
                formData.append('file', file);
            }
            const response = await axiosInstance.post('/api/master-transactions', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setTransactions([...transactions, response.data]);
            setSnackbarMessage('Transaction added successfully!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            handleCloseAddEdit();
        } catch (error) {
            setSnackbarMessage('Error adding transaction: ' + (error.response?.data || error.message));
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const handleEditTransaction = async () => {
        try {
            const response = await axiosInstance.put(`/api/master-transactions/${currentTransaction.id}`, currentTransaction);
            setTransactions(transactions.map(t => t.id === currentTransaction.id ? response.data : t));
            setSnackbarMessage('Transaction updated successfully!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            handleCloseAddEdit();
        } catch (error) {
            setSnackbarMessage('Error updating transaction!');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const handleChangePage = (event, newPage) => setPage(newPage);

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleFilterChange = (event) => {
        setFilterText(event.target.value);
        setPage(0);
    };

    const filteredTransactions = transactions.filter(t =>
        (t.docname || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (t.reportstatus || '').toLowerCase().includes(filterText.toLowerCase())
    );

    return (
        <CRow>
            <CCol xs={12}>
                <CCard className="mb-4">
                    <CCardHeader><strong>Master Transactions</strong></CCardHeader>
                    <CCardBody>
                        <Box display="flex" justifyContent="flex-start" sx={{ mb: 2 }}>
                            <Button variant="contained" onClick={() => handleOpenAddEdit('new')}>New Transaction</Button>
                        </Box>
                        {loading ? (
                            <div>Loading...</div>
                        ) : error ? (
                            <div>{error}</div>
                        ) : (
                            <TableContainer>
                                <Box display="flex" justifyContent="flex-end" sx={{ padding: '6px' }}>
                                    <TextField
                                        label="Search Transactions"
                                        variant="outlined"
                                        value={filterText}
                                        onChange={handleFilterChange}
                                        sx={{ width: '40%' }}
                                    />
                                </Box>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>#</TableCell>
                                            <TableCell>Document Name</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Fiscal Year</TableCell>
                                            <TableCell>Organization</TableCell>
                                            <TableCell>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredTransactions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((t, index) => (
                                            <TableRow key={t.id}>
                                                <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                                                <TableCell>{t.docname}</TableCell>
                                                <TableCell>{t.reportstatus}</TableCell>
                                                <TableCell>{t.fiscal_year}</TableCell>
                                                <TableCell>{t.current_orgname}</TableCell>
                                                <TableCell>
                                                    <Button startIcon={<VisibilityIcon />} onClick={() => handleOpenDetails(t)}>Details</Button>
                                                    <Button startIcon={<EditIcon />} onClick={() => handleOpenAddEdit('edit', t)}>Edit</Button>
                                                    <Button startIcon={<DeleteIcon />} onClick={() => handleConfirmDeleteOpen(t.id)}>Delete</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                <TablePagination
                                    component="div"
                                    count={filteredTransactions.length}
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

            {/* Add/Edit Dialog */}
            <Dialog open={openAddEdit} onClose={handleCloseAddEdit} maxWidth="md" fullWidth>
                <DialogTitle>{formMode === 'new' ? 'Add New Transaction' : 'Edit Transaction'}</DialogTitle>
                <DialogContent>
                    <CForm className="row g-3">
                        {formMode === 'new' && (
                            <CCol xs={12}>
                                <CFormLabel htmlFor="file">Upload File</CFormLabel>
                                <input type="file" id="file" onChange={handleFileChange} />
                            </CCol>
                        )}
                        <CCol xs={12}>
                            <CFormLabel htmlFor="docname">Document Name</CFormLabel>
                            <CFormInput id="docname" value={currentTransaction.docname} onChange={handleChangeAdd} disabled={formMode === 'edit'} />
                        </CCol>
                        <CCol xs={12}>
                            <CFormLabel htmlFor="reportstatus">Status</CFormLabel>
                            <CFormSelect id="reportstatus" value={currentTransaction.reportstatus} onChange={handleChangeAdd}>
                                <option value="">Select Status</option>
                                <option value="Pending">Pending</option>
                                <option value="Approved">Approved</option>
                                <option value="Rejected">Rejected</option>
                            </CFormSelect>
                        </CCol>
                        <CCol xs={12}>
                            <CFormLabel htmlFor="fiscal_year">Fiscal Year</CFormLabel>
                            <CFormInput id="fiscal_year" value={currentTransaction.fiscal_year} onChange={handleChangeAdd} />
                        </CCol>
                        <CCol xs={12}>
                            <CFormLabel htmlFor="remarks">Remarks</CFormLabel>
                            <CFormInput id="remarks" value={currentTransaction.remarks} onChange={handleChangeAdd} />
                        </CCol>
                    </CForm>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAddEdit}>Cancel</Button>
                    <Button onClick={formMode === 'new' ? handleAddTransaction : handleEditTransaction} variant="contained">
                        {formMode === 'new' ? 'Add' : 'Update'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Details Dialog */}
            <Dialog open={openDetails} onClose={handleCloseDetails} maxWidth="md" fullWidth>
                <DialogTitle>Transaction Details</DialogTitle>
                <DialogContent>
                    <CForm className="row g-3">
                        <CCol md={6}><CFormLabel>ID</CFormLabel><CFormInput value={currentTransaction.id} readOnly /></CCol>
                        <CCol md={6}><CFormLabel>Document Name</CFormLabel><CFormInput value={currentTransaction.docname} readOnly /></CCol>
                        <CCol md={6}><CFormLabel>Status</CFormLabel><CFormInput value={currentTransaction.reportstatus} readOnly /></CCol>
                        <CCol md={6}><CFormLabel>Fiscal Year</CFormLabel><CFormInput value={currentTransaction.fiscal_year} readOnly /></CCol>
                        <CCol md={6}><CFormLabel>File Path</CFormLabel><CFormInput value={currentTransaction.filepath} readOnly /></CCol>
                    </CForm>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDetails}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={confirmDeleteOpen} onClose={handleConfirmDeleteClose}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>Are you sure you want to delete this transaction?</DialogContent>
                <DialogActions>
                    <Button onClick={handleConfirmDeleteClose}>Cancel</Button>
                    <Button onClick={handleDeleteTransaction} color="error">Delete</Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)}>
                <Alert severity={snackbarSeverity}>{snackbarMessage}</Alert>
            </Snackbar>
        </CRow>
    );
}