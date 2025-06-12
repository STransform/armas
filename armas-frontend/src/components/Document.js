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
  CFormSelect,
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
  IconButton,
  InputAdornment,
  Typography,
  Paper,
  CircularProgress,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import axiosInstance from '../../axiosConfig';

// Styled components for enhanced UI
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  backgroundColor: theme.palette.background.paper,
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '6px',
  textTransform: 'none',
  padding: '8px 16px',
  fontWeight: 500,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  },
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '12px',
    padding: theme.spacing(2),
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontSize: '0.9rem',
  padding: theme.spacing(1.5),
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.8rem',
    padding: theme.spacing(1),
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    transition: 'background-color 0.3s ease',
  },
}));

export default function Document() {
  const [documents, setDocuments] = useState([]);
  const [directorates, setDirectorates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
    directoratename: '',
  });
  const [formMode, setFormMode] = useState('');

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [directoratesResponse, documentsResponse] = await Promise.all([
          axiosInstance.get('/directorates'),
          axiosInstance.get('/documents'),
        ]);
        setDirectorates(Array.isArray(directoratesResponse.data) ? directoratesResponse.data : []);
        setDocuments(Array.isArray(documentsResponse.data) ? documentsResponse.data : []);
        if (documentsResponse.data.length === 0) {
          setError('No documents available.');
        }
      } catch (error) {
        const errorMessage = error.response
          ? `Error ${error.response.status}: ${
              error.response.data?.message || error.response.statusText
            }`
          : error.message;
        setError(errorMessage);
        setSnackbarMessage(errorMessage);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handlers
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
    setError('');
    setSuccess('');
  };

  const handleDeleteDocument = async (id) => {
    try {
      await axiosInstance.delete(`/documents/${id}`);
      setDocuments(documents.filter((doc) => doc.id !== id));
      setSnackbarMessage('Document deleted successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      handleConfirmDeleteClose();
    } catch (error) {
      const status = error.response?.status;
      const msg =
        status === 403
          ? 'You need admin privileges to delete a document'
          : status === 404
          ? 'Document not found'
          : error.response?.data?.message || 'Error deleting document';
      setSnackbarMessage(msg);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const clearForm = () => {
    setCurrentDocument({ id: '', reportype: '', directoratename: '' });
  };

  const handleOpenAddEdit = (mode = 'new', doc = null) => {
    setFormMode(mode);
    if (mode === 'edit' && doc) {
      setCurrentDocument({
        id: doc.id || '',
        reportype: doc.reportype || '',
        directoratename: doc.directoratename || '',
      });
    } else {
      clearForm();
    }
    setOpenAddEdit(true);
  };

  const handleCloseAddEdit = () => {
    setOpenAddEdit(false);
    clearForm();
  };

  const handleCloseDetails = () => {
    setOpenDetails(false);
    clearForm();
  };

  const handleOpenEdit = (doc) => {
    handleOpenAddEdit('edit', doc);
  };

  const handleOpenDetails = (doc) => {
    setCurrentDocument({
      id: doc.id || '',
      reportype: doc.reportype || '',
      directoratename: doc.directoratename || '',
    });
    setOpenDetails(true);
  };

  const handleChangeAdd = (e) => {
    setCurrentDocument({ ...currentDocument, [e.target.id]: e.target.value });
  };

  const handleAddDocument = async () => {
    try {
      const payload = {
        id: currentDocument.id.trim(),
        reportype: currentDocument.reportype.trim(),
        directoratename: currentDocument.directoratename.trim(),
      };
      const response = await axiosInstance.post('/documents', payload);
      setDocuments([...documents, response.data]);
      setSnackbarMessage('Document added successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      handleCloseAddEdit();
    } catch (error) {
      const status = error.response?.status;
      const msg =
        status === 403
          ? 'You need admin privileges to add a document'
          : status === 404
          ? 'Directorate not found'
          : status === 409
          ? 'Document ID already exists'
          : status === 400
          ? error.response?.data?.message
          : error.response?.data?.message || 'Error adding document';
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
        directoratename: currentDocument.directoratename.trim(),
      };
      const response = await axiosInstance.put(`/documents/${currentDocument.id}`, payload);
      setDocuments(documents.map((doc) => (doc.id === currentDocument.id ? response.data : doc)));
      setSnackbarMessage('Document updated successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      handleCloseAddEdit();
    } catch (error) {
      const status = error.response?.status;
      const msg =
        status === 403
          ? 'You need admin privileges to update a document'
          : status === 404
          ? 'Directorate not found'
          : status === 400
          ? error.response?.data?.message
          : error.response?.data?.message || 'Error updating document';
      setSnackbarMessage(msg);
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

  const filteredDocuments = documents.filter(
    (doc) =>
      (doc.id || '').toLowerCase().includes(filterText.toLowerCase()) ||
      (doc.reportype || '').toLowerCase().includes(filterText.toLowerCase()) ||
      (doc.directoratename || '').toLowerCase().includes(filterText.toLowerCase())
  );

  const isAddButtonDisabled =
    !currentDocument.id.trim() ||
    !currentDocument.reportype.trim() ||
    !currentDocument.directoratename.trim();

  return (
    <Box sx={{ padding: { xs: 2, md: 4 } }}>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4" style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
            <CCardHeader>
              <Typography variant="h6" fontWeight="bold">
                Documents
              </Typography>
            </CCardHeader>
            <CCardBody>
              {loading ? (
                <Box display="flex" justifyContent="center" my={2}>
                  <CircularProgress />
                </Box>
              ) : error && !documents.length ? (
                <Typography color="error">{error}</Typography>
              ) : (
                <StyledTableContainer component={Paper}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                    <StyledButton
                      variant="contained"
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={() => handleOpenAddEdit('new')}
                      disabled={directorates.length === 0}
                    >
                      {directorates.length === 0 ? 'Add Directorates First' : 'New Document'}
                    </StyledButton>
                    <TextField
                      label="Search Documents"
                      variant="outlined"
                      value={filterText}
                      onChange={handleFilterChange}
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ width: { xs: '100%', sm: '40%' } }}
                    />
                  </Box>
                  {filteredDocuments.length > 0 ? (
                    <Table stickyHeader>
                      <TableHead>
                        <StyledTableRow>
                          <StyledTableCell>#</StyledTableCell>
                          <StyledTableCell>Document ID</StyledTableCell>
                          <StyledTableCell>Report Type</StyledTableCell>
                          <StyledTableCell>Directorate</StyledTableCell>
                          <StyledTableCell align="right">Actions</StyledTableCell>
                        </StyledTableRow>
                      </TableHead>
                      <TableBody>
                        {filteredDocuments
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((doc, index) => (
                            <StyledTableRow key={doc.id}>
                              <StyledTableCell>{page * rowsPerPage + index + 1}</StyledTableCell>
                              <StyledTableCell>{doc.id || 'N/A'}</StyledTableCell>
                              <StyledTableCell>{doc.reportype || 'N/A'}</StyledTableCell>
                              <StyledTableCell>{doc.directoratename || 'N/A'}</StyledTableCell>
                              <StyledTableCell align="right">
                                <IconButton
                                  color="primary"
                                  onClick={() => handleOpenDetails(doc)}
                                  size="small"
                                  sx={{ mr: 1 }}
                                >
                                  <VisibilityIcon />
                                </IconButton>
                                <IconButton
                                  color="primary"
                                  onClick={() => handleOpenEdit(doc)}
                                  size="small"
                                  sx={{ mr: 1 }}
                                >
                                  <EditIcon />
                                </IconButton>
                                <IconButton
                                  color="error"
                                  onClick={() => handleConfirmDeleteOpen(doc.id)}
                                  size="small"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </StyledTableCell>
                            </StyledTableRow>
                          ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <Typography sx={{ p: 2, textAlign: 'center' }}>
                      {filterText ? 'No documents found for the current filter.' : 'No documents available.'}
                    </Typography>
                  )}
                  <TablePagination
                    component="div"
                    count={filteredDocuments.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25]}
                  />
                </StyledTableContainer>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <StyledDialog
        maxWidth="sm"
        fullWidth
        open={confirmDeleteOpen}
        onClose={handleConfirmDeleteClose}
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 800 }}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this document?</Typography>
        </DialogContent>
        <DialogActions>
          <StyledButton onClick={handleConfirmDeleteClose} color="primary">
            Cancel
          </StyledButton>
          <StyledButton
            onClick={() => handleDeleteDocument(deleteId)}
            color="error"
            variant="contained"
          >
            Delete
          </StyledButton>
        </DialogActions>
      </StyledDialog>

      <StyledDialog
        maxWidth="md"
        fullWidth
        open={openAddEdit}
        onClose={handleCloseAddEdit}
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 800 }}
      >
        <DialogTitle>{formMode === 'new' ? 'Add New Document' : 'Edit Document'}</DialogTitle>
        <DialogContent>
          <CForm className="row g-3">
            <CCol xs={12}>
              <CFormLabel htmlFor="id">Document ID</CFormLabel>
              <CFormInput
                id="id"
                value={currentDocument.id}
                onChange={handleChangeAdd}
                placeholder="Enter document ID (e.g., DOC123)"
                disabled={formMode === 'edit'}
              />
            </CCol>
            <CCol xs={12}>
              <CFormLabel htmlFor="reportype">Report Type</CFormLabel>
              <CFormInput
                id="reportype"
                value={currentDocument.reportype}
                onChange={handleChangeAdd}
                placeholder="Enter report type (e.g., Annual Report)"
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
                {directorates.map((dir) => (
                  <option key={dir.directoratename} value={dir.directoratename}>
                    {dir.directoratename}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
          </CForm>
        </DialogContent>
        <DialogActions>
          <StyledButton onClick={handleCloseAddEdit} color="primary">
            Cancel
          </StyledButton>
          <StyledButton
            onClick={formMode === 'new' ? handleAddDocument : handleEditDocument}
            color="primary"
            variant="contained"
            disabled={isAddButtonDisabled}
          >
            {formMode === 'new' ? 'Add Document' : 'Update Document'}
          </StyledButton>
        </DialogActions>
      </StyledDialog>

      <StyledDialog
        maxWidth="md"
        fullWidth
        open={openDetails}
        onClose={handleCloseDetails}
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 800 }}
      >
        <DialogTitle>Document Details</DialogTitle>
        <DialogContent>
          <CForm className="row g-3">
            <CCol md={6}>
              <CFormLabel>Document ID</CFormLabel>
              <CFormInput value={currentDocument.id || ''} readOnly />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Report Type</CFormLabel>
              <CFormInput value={currentDocument.reportype || ''} readOnly />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Directorate</CFormLabel>
              <CFormInput value={currentDocument.directoratename || 'N/A'} readOnly />
            </CCol>
          </CForm>
        </DialogContent>
        <DialogActions>
          <StyledButton onClick={handleCloseDetails} color="primary">
            Close
          </StyledButton>
        </DialogActions>
      </StyledDialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ minWidth: '250px', boxShadow: '4px 4px 6px rgba(0, 0, 0, 0.1)', borderRadius: '8px' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}