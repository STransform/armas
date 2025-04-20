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
    const [currentDocument, setCurrentDocument] = useState({
        id: '',
        reportype: '',
        directoratename: '' // Changed from directorname to directoratename
    });
    const [formMode, setFormMode] = useState('');

    useEffect(() => {
        console.log("Fetching data for Documents page...");
        setLoading(true);

        const fetchData = async () => {
            try {
                console.log("Fetching directorates...");
                const directoratesResponse = await axiosInstance.get('/directorates');
                console.log("Directorates fetched:", directoratesResponse.data);
                setDirectorates(Array.isArray(directoratesResponse.data) ? directoratesResponse.data : []);

                console.log("Fetching documents...");
                const documentsResponse = await axiosInstance.get('/documents');
                console.log("Documents fetched:", documentsResponse.data);
                setDocuments(Array.isArray(documentsResponse.data) ? documentsResponse.data : []);

                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error.response ? error.response.data : error.message);
                setError('Failed to load data. Check the console for details.');
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

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const handleDeleteDocument = async (id) => {
        try {
            setSnackbarOpen(true);
            await axiosInstance.delete(`/documents/${id}`);
            setDocuments((prevDocuments) => prevDocuments.filter((doc) => doc.id !== id));
            setSnackbarMessage('The selected document has been deleted successfully!');
            setSnackbarSeverity('success');
            handleConfirmDeleteClose();
        } catch (error) {
            console.error('Error occurred deleting the document:', error);
            setSnackbarMessage('There was an error deleting the document! Please try again.');
            setSnackbarSeverity('warning');
            setSnackbarOpen(true);
        }
    };

    const clearForm = () => {
        setCurrentDocument({
            id: '',
            reportype: '',
            directoratename: '' // Changed from directorname to directoratename
        });
    };

    const handleOpenAddEdit = () => {
        setFormMode('new');
        clearForm();
        console.log("Opening Add/Edit dialog, current directorates:", directorates);
        setOpenAddEdit(true);
    };

    const handleCloseAddEdit = () => {
        setOpenAddEdit(false);
    };

    const handleCloseDetails = () => {
        setOpenDetails(false);
    };

    const handleOpenEdit = (document) => {
        setCurrentDocument({
            id: document.id,
            reportype: document.reportype,
            directoratename: document.directoratename || (document.directorate ? document.directorate.directoratename : '')
        });
        setFormMode('edit');
        setOpenAddEdit(true);
    };

    const handleOpenDetails = (document) => {
        setCurrentDocument({
            id: document.id,
            reportype: document.reportype,
            directoratename: document.directoratename || (document.directorate ? document.directorate.directoratename : '')
        });
        setOpenDetails(true);
    };

    const handleChangeAdd = (e) => {
        setCurrentDocument({ ...currentDocument, [e.target.id]: e.target.value });
    };

    const handleAddDocument = async () => {
        try {
            setSnackbarOpen(true);
            const payload = {
                id: currentDocument.id,
                reportype: currentDocument.reportype,
                directoratename: currentDocument.directoratename // This should match the directorate ID/name
            };
            
            console.log("Sending payload:", payload);
            const response = await axiosInstance.post('/documents', payload);
            
            // Fetch the newly created document with its relations
            const fullDocument = await axiosInstance.get(`/documents/${response.data.id}`);
            
            setDocuments((prevDocuments) => [...prevDocuments, fullDocument.data]);
            clearForm();
            setSnackbarMessage('Document was added successfully!');
            setSnackbarSeverity('success');
            handleCloseAddEdit();
        } catch (error) {
            console.error('Failed to add document:', error);
            setSnackbarMessage(
                error.response?.data?.message || 
                `Failed to add document: ${error.message}`
            );
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const handleEditDocument = async () => {
        try {
            setSnackbarOpen(true);
            const payload = {
                id: currentDocument.id,
                reportype: currentDocument.reportype,
                directoratename: currentDocument.directoratename
            };
            
            const response = await axiosInstance.put(`/documents/${currentDocument.id}`, payload);
            
            // Fetch the updated document with relations
            const updatedDocument = await axiosInstance.get(`/documents/${currentDocument.id}`);
            
            setDocuments((prevDocuments) =>
                prevDocuments.map((doc) => (doc.id === currentDocument.id ? updatedDocument.data : doc))
            );
            clearForm();
            setSnackbarMessage('Document was updated successfully!');
            setSnackbarSeverity('success');
            handleCloseAddEdit();
        } catch (error) {
            console.error('Failed to update document:', error);
            setSnackbarMessage('There was an error updating the document! Please try again.');
            setSnackbarSeverity('error');
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

    const filteredDocuments = documents.filter(doc =>
        (doc.id || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (doc.reportype || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (doc.directoratename || (doc.directorate ? doc.directorate.directoratename : '') || '').toLowerCase().includes(filterText.toLowerCase())
    );

    return (
        <div>
            <CRow>
                <CCol xs={12}>
                    <CCard className="mb-4">
                        <CCardHeader>
                            <strong>Documents</strong>
                        </CCardHeader>
                        <CCardBody>
                            <Box display="flex" justifyContent="flex-start" sx={{ mb: 2 }}>
                                <Button variant="contained" onClick={handleOpenAddEdit}>New Document</Button>
                            </Box>
                            {loading ? (
                                <div>Loading...</div>
                            ) : error ? (
                                <div>{error}</div>
                            ) : (
                                <TableContainer>
                                    <Box display="flex" justifyContent="flex-end" sx={{ padding: '6px' }}>
                                        <TextField
                                            label="Search Documents"
                                            variant="outlined"
                                            value={filterText}
                                            onChange={handleFilterChange}
                                            sx={{ width: '40%' }}
                                        />
                                    </Box>
                                    {filteredDocuments.length > 0 ? (
                                        <Table sx={{
                                            fontSize: '2rem',
                                            '& td': { fontSize: '1rem' },
                                            '& th': { fontWeight: 'bold', fontSize: '1rem', backgroundColor: '#f5f5f5' },
                                            '& tr:nth-of-type(odd)': { backgroundColor: '#f9f9f9' }
                                        }}>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell scope="col">#</TableCell>
                                                    <TableCell scope="col">Document ID</TableCell>
                                                    <TableCell scope="col">Report Type</TableCell>
                                                    <TableCell scope="col">Directorate</TableCell>
                                                    <TableCell scope="col"></TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {filteredDocuments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((doc, index) => (
                                                    <TableRow key={doc.id}>
                                                        <TableCell scope="row">{page * rowsPerPage + index + 1}</TableCell>
                                                        <TableCell>{doc.id}</TableCell>
                                                        <TableCell>{doc.reportype}</TableCell>
                                                        <TableCell>{doc.directoratename || (doc.directorate ? doc.directorate.directoratename : '')}</TableCell>
                                                        <TableCell>
                                                            <Box display="flex" justifyContent="flex-end">
                                                                <Button
                                                                    variant="contained"
                                                                    color="success"
                                                                    size="small"
                                                                    startIcon={<VisibilityIcon />}
                                                                    onClick={() => handleOpenDetails(doc)}
                                                                    style={{ marginRight: '8px' }}
                                                                >
                                                                    Details
                                                                </Button>
                                                                <Button
                                                                    variant="contained"
                                                                    color="primary"
                                                                    size="small"
                                                                    startIcon={<EditIcon />}
                                                                    onClick={() => handleOpenEdit(doc)}
                                                                    style={{ marginRight: '8px' }}
                                                                >
                                                                    Edit
                                                                </Button>
                                                                <Button
                                                                    variant="contained"
                                                                    color="error"
                                                                    size="small"
                                                                    startIcon={<DeleteIcon />}
                                                                    onClick={() => handleConfirmDeleteOpen(doc.id)}
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
                                        <div>No documents found.</div>
                                    )}
                                    {filteredDocuments.length > 0 && (
                                        <TablePagination
                                            sx={{
                                                ".MuiTablePagination-displayedRows, .MuiTablePagination-selectLabel": {
                                                    "marginTop": "1em",
                                                    "marginBottom": "1em"
                                                }
                                            }}
                                            component="div"
                                            count={filteredDocuments.length}
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
                    Are you sure you want to delete this document?
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleConfirmDeleteClose} color="primary">
                        Cancel
                    </Button>
                    <Button
                        onClick={() => handleDeleteDocument(deleteId)}
                        color="warning"
                        variant="contained"
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal Dialog for Add and Edit Document */}
            <Dialog
                open={openAddEdit}
                onClose={handleCloseAddEdit}
                TransitionComponent={Fade}
                TransitionProps={{ timeout: 800 }}
                maxWidth="md"
            >
                <DialogTitle>{formMode === 'new' ? 'Add New Document' : 'Edit Document'}</DialogTitle>
                <hr />
                <DialogContent>
                    <CForm className="row g-3">
                        <CCol xs={12}>
                            <CFormLabel htmlFor="id">Document ID</CFormLabel>
                            <CFormInput 
                                id="id" 
                                onChange={handleChangeAdd} 
                                value={currentDocument.id} 
                                placeholder="Enter document ID" 
                                disabled={formMode === 'edit'}
                            />
                        </CCol>
                        <CCol xs={12}>
                            <CFormLabel htmlFor="reportype">Report Type</CFormLabel>
                            <CFormInput 
                                id="reportype" 
                                value={currentDocument.reportype} 
                                onChange={handleChangeAdd} 
                                placeholder="Report Type" 
                            />
                        </CCol>
                        <CCol xs={12}>
                            <CFormLabel htmlFor="directoratename">Directorate</CFormLabel>
                            <CFormSelect 
                                id="directoratename" 
                                value={currentDocument.directoratename} 
                                onChange={handleChangeAdd}
                            >
                                <option value="">Select a Directorate</option>
                                {directorates.map(dir => (
                                    <option key={dir.directoratename} value={dir.directoratename}>
                                        {dir.directoratename}
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
                    <Button 
                        onClick={formMode === 'new' ? handleAddDocument : handleEditDocument} 
                        color="primary" 
                        variant="contained"
                        disabled={!currentDocument.id || !currentDocument.reportype || !currentDocument.directoratename}
                    >
                        {formMode === 'edit' ? 'Update Document' : 'Add Document'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal Dialog for Viewing Details of a Document */}
            <Dialog
                open={openDetails}
                onClose={handleCloseDetails}
                TransitionComponent={Fade}
                TransitionProps={{ timeout: 800 }}
                maxWidth="md"
            >
                <DialogTitle>Document Details</DialogTitle>
                <hr />
                <DialogContent>
                    <CForm className="row g-3">
                        <CCol md={6}>
                            <CFormLabel htmlFor="id">Document ID</CFormLabel>
                            <CFormInput value={currentDocument.id} readOnly={true} />
                        </CCol>
                        <CCol md={6}>
                            <CFormLabel htmlFor="reportype">Report Type</CFormLabel>
                            <CFormInput value={currentDocument.reportype} readOnly={true} />
                        </CCol>
                        <CCol md={6}>
                            <CFormLabel htmlFor="directoratename">Directorate</CFormLabel>
                            <CFormInput value={currentDocument.directoratename} readOnly={true} />
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