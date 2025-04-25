import React, { useEffect, useState } from 'react';
import { CCard, CCardBody, CCardHeader, CCol, CRow, CForm, CFormLabel, CFormInput, CFormSelect } from '@coreui/react';
import { TextField, Dialog, Snackbar, Alert, Fade, DialogTitle, DialogContent, DialogActions, TablePagination, TableContainer, Box, Table, TableHead, TableRow, TableCell, TableBody, Button } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axiosInstance from "../../axiosConfig";

export default function Document() {
    const [documents, setDocuments] = useState([]);
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
    const [currentDocument, setCurrentDocument] = useState({ id: '', reportype: '', directoratename: '' });
    const [formMode, setFormMode] = useState('');

    useEffect(() => {
        console.log("Fetching data for Documents page...");
        setLoading(true);
        const fetchData = async () => {
            try {
                const directoratesResponse = await axiosInstance.get('/directorates');
                console.log("Directorates fetched:", directoratesResponse.data);
                setDirectorates(Array.isArray(directoratesResponse.data) ? directoratesResponse.data : []);

                const documentsResponse = await axiosInstance.get('/documents');
                console.log("Documents fetched:", documentsResponse.data);
                setDocuments(Array.isArray(documentsResponse.data) ? documentsResponse.data : []);

                setLoading(false);
            } catch (error) {
                const errorMessage = error.response
                    ? `Error ${error.response.status}: ${error.response.data?.message || error.response.data || error.response.statusText}`
                    : error.message;
                console.error('Error fetching data:', errorMessage);
                setError(errorMessage);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleConfirmDeleteOpen = (id) => { setDeleteId(id); setConfirmDeleteOpen(true); };
    const handleConfirmDeleteClose = () => { setDeleteId(null); setConfirmDeleteOpen(false); };
    const handleSnackbarClose = () => { setSnackbarOpen(false); };

    const handleDeleteDocument = async (id) => {
        try {
            await axiosInstance.delete(`/documents/${id}`);
            setDocuments(prev => prev.filter(doc => doc.id !== id));
            setSnackbarMessage('Document deleted successfully!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            handleConfirmDeleteClose();
        } catch (error) {
            const msg = error.response?.status === 403 ? 'You need admin privileges to delete a document' :
                        error.response?.status === 404 ? 'Document not found' :
                        error.response?.data || 'Error deleting document';
            console.error('Delete error:', error.response);
            setSnackbarMessage(msg);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const clearForm = () => { setCurrentDocument({ id: '', reportype: '', directoratename: '' }); };
    const handleOpenAddEdit = () => { setFormMode('new'); clearForm(); setOpenAddEdit(true); };
    const handleCloseAddEdit = () => { setOpenAddEdit(false); };
    const handleCloseDetails = () => { setOpenDetails(false); };
    const handleOpenEdit = (doc) => {
        setCurrentDocument({
            id: doc.id,
            reportype: doc.reportype,
            directoratename: doc.directoratename || ''
        });
        setFormMode('edit');
        setOpenAddEdit(true);
    };
    const handleOpenDetails = (doc) => {
        setCurrentDocument({
            id: doc.id,
            reportype: doc.reportype,
            directoratename: doc.directoratename || ''
        });
        setOpenDetails(true);
    };
    const handleChangeAdd = (e) => { setCurrentDocument({ ...currentDocument, [e.target.id]: e.target.value }); };

    const handleAddDocument = async () => {
        try {
            const payload = { 
                id: currentDocument.id.trim(), 
                reportype: currentDocument.reportype.trim(), 
                directoratename: currentDocument.directoratename.trim() 
            };
            console.log("Adding document with payload:", payload);
            const response = await axiosInstance.post('/documents', payload);
            setDocuments(prev => [...prev, response.data]);
            setSnackbarMessage('Document added successfully!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            clearForm();
            handleCloseAddEdit();
        } catch (error) {
            const status = error.response?.status;
            const msg = status === 403 ? 'You need admin privileges to add a document' :
                        status === 404 ? 'Directorate not found' :
                        status === 409 ? 'Document ID already exists' :
                        status === 400 ? error.response.data :
                        status === 500 ? 'Database error: Please check server logs' :
                        error.response?.data || 'Error adding document';
            console.error('Add error:', error.response);
            setSnackbarMessage(msg);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const handleEditDocument = async () => {
        try {
            const payload = { 
                id: currentDocument.id.trim(), 
                reportype: currentDocument.reportype.trim(), 
                directoratename: currentDocument.directoratename.trim() 
            };
            console.log("Updating document with payload:", payload);
            const response = await axiosInstance.put(`/documents/${currentDocument.id}`, payload);
            setDocuments(prev => prev.map(doc => doc.id === currentDocument.id ? response.data : doc));
            setSnackbarMessage('Document updated successfully!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            clearForm();
            handleCloseAddEdit();
        } catch (error) {
            const status = error.response?.status;
            const msg = status === 403 ? 'You need admin privileges to update a document' :
                        status === 404 ? 'Directorate not found' :
                        status === 400 ? error.response.data :
                        status === 500 ? 'Database error: Please check server logs' :
                        error.response?.data || 'Error updating document';
            console.error('Update error:', error.response);
            setSnackbarMessage(msg);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const handleChangePage = (event, newPage) => { setPage(newPage); };
    const handleChangeRowsPerPage = (event) => { setRowsPerPage(parseInt(event.target.value, 10)); setPage(0); };
    const handleFilterChange = (event) => { setFilterText(event.target.value); setPage(0); };

    const filteredDocuments = documents.filter(doc =>
        (doc.id || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (doc.reportype || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (doc.directoratename || '').toLowerCase().includes(filterText.toLowerCase())
    );

    return (
        <div>
            <CRow>
                <CCol xs={12}>
                    <CCard className="mb-4">
                        <CCardHeader><strong>Documents</strong></CCardHeader>
                        <CCardBody>
                            <Box display="flex" justifyContent="flex-start" sx={{ mb: 2 }}>
                                <Button variant="contained" onClick={handleOpenAddEdit} disabled={directorates.length === 0}>
                                    New Document {directorates.length === 0 && "(Add Directorates First)"}
                                </Button>
                            </Box>
                            {loading ? <div>Loading...</div> : error ? <div>{error}</div> : (
                                <TableContainer>
                                    <Box display="flex" justifyContent="flex-end" sx={{ padding: '6px' }}>
                                        <TextField label="Search Documents" variant="outlined" value={filterText} onChange={handleFilterChange} sx={{ width: '40%' }} />
                                    </Box>
                                    {filteredDocuments.length > 0 ? (
                                        <Table sx={{ '& td': { fontSize: '1rem' }, '& th': { fontWeight: 'bold', fontSize: '1rem', backgroundColor: '#f5f5f5' }, '& tr:nth-of-type(odd)': { backgroundColor: '#f9f9f9' } }}>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>#</TableCell>
                                                    <TableCell>Document ID</TableCell>
                                                    <TableCell>Report Type</TableCell>
                                                    <TableCell>Directorate</TableCell>
                                                    <TableCell></TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {filteredDocuments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((doc, index) => (
                                                    <TableRow key={doc.id}>
                                                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                                                        <TableCell>{doc.id}</TableCell>
                                                        <TableCell>{doc.reportype}</TableCell>
                                                        <TableCell>{doc.directoratename || 'N/A'}</TableCell>
                                                        <TableCell>
                                                            <Box display="flex" justifyContent="flex-end">
                                                                <Button variant="contained" color="success" size="small" startIcon={<VisibilityIcon />} onClick={() => handleOpenDetails(doc)} style={{ marginRight: '8px' }}>Details</Button>
                                                                <Button variant="contained" color="primary" size="small" startIcon={<EditIcon />} onClick={() => handleOpenEdit(doc)} style={{ marginRight: '8px' }}>Edit</Button>
                                                                <Button variant="contained" color="error" size="small" startIcon={<DeleteIcon />} onClick={() => handleConfirmDeleteOpen(doc.id)}>Delete</Button>
                                                            </Box>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    ) : <div>No documents found.</div>}
                                    <TablePagination
                                        component="div"
                                        count={filteredDocuments.length}
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
                <DialogContent>Are you sure you want to delete this document?</DialogContent>
                <DialogActions>
                    <Button onClick={handleConfirmDeleteClose} color="primary">Cancel</Button>
                    <Button onClick={() => handleDeleteDocument(deleteId)} color="warning" variant="contained">Delete</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openAddEdit} onClose={handleCloseAddEdit} TransitionComponent={Fade} TransitionProps={{ timeout: 800 }} maxWidth="md">
                <DialogTitle>{formMode === 'new' ? 'Add New Document' : 'Edit Document'}</DialogTitle>
                <hr />
                <DialogContent>
                    <CForm className="row g-3">
                        <CCol xs={12}>
                            <CFormLabel htmlFor="id">Document ID</CFormLabel>
                            <CFormInput id="id" onChange={handleChangeAdd} value={currentDocument.id} placeholder="Enter document ID" disabled={formMode === 'edit'} />
                        </CCol>
                        <CCol xs={12}>
                            <CFormLabel htmlFor="reportype">Report Type</CFormLabel>
                            <CFormInput id="reportype" value={currentDocument.reportype} onChange={handleChangeAdd} placeholder="Report Type" />
                        </CCol>
                        <CCol xs={12}>
                            <CFormLabel htmlFor="directoratename">Directorate</CFormLabel>
                            <CFormSelect id="directoratename" value={currentDocument.directoratename} onChange={handleChangeAdd}>
                                <option value="">Select a Directorate</option>
                                {directorates.map(dir => (
                                    <option key={dir.directoratename} value={dir.directoratename}>{dir.directoratename}</option>
                                ))}
                            </CFormSelect>
                        </CCol>
                    </CForm>
                </DialogContent>
                <hr />
                <DialogActions>
                    <Button onClick={handleCloseAddEdit} color="primary">Cancel</Button>
                    <Button onClick={formMode === 'new' ? handleAddDocument : handleEditDocument} color="primary" variant="contained" disabled={!currentDocument.id.trim() || !currentDocument.reportype.trim() || !currentDocument.directoratename.trim()}>
                        {formMode === 'edit' ? 'Update Document' : 'Add Document'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openDetails} onClose={handleCloseDetails} TransitionComponent={Fade} TransitionProps={{ timeout: 800 }} maxWidth="md">
                <DialogTitle>Document Details</DialogTitle>
                <hr />
                <DialogContent>
                    <CForm className="row g-3">
                        <CCol md={6}><CFormLabel>Document ID</CFormLabel><CFormInput value={currentDocument.id} readOnly /></CCol>
                        <CCol md={6}><CFormLabel>Report Type</CFormLabel><CFormInput value={currentDocument.reportype} readOnly /></CCol>
                        <CCol md={6}><CFormLabel>Directorate</CFormLabel><CFormInput value={currentDocument.directoratename || 'N/A'} readOnly /></CCol>
                    </CForm>
                </DialogContent>
                <hr />
                <DialogActions><Button onClick={handleCloseDetails} color="primary">Close</Button></DialogActions>
            </Dialog>

            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ minWidth: '250px', minHeight: '90px', boxShadow: '4px 4px 6px rgba(0, 0, 0, 0.1)', borderRadius: '8px' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </div>
    );
}