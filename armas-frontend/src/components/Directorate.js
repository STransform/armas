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
  IconButton,
  InputAdornment,
  Typography,
  Paper,
  CircularProgress,
  Tooltip, // Added Tooltip import
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

// Styled components
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

export default function Directorate() {
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
  const [currentDirectorate, setCurrentDirectorate] = useState({
    id: '',
    directoratename: '',
    telephone: '',
    email: '',
  });
  const [formMode, setFormMode] = useState('');

  // Fetch directorates
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get('/directorates');
        console.log('Fetched directorates:', response.data); // Debug log
        setDirectorates(Array.isArray(response.data) ? response.data : []);
        if (response.data.length === 0) {
          setError('No directorates available.');
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

  const handleDeleteDirectorate = async (id) => {
    try {
      await axiosInstance.delete(`/directorates/${id}`);
      setDirectorates(directorates.filter((dir) => dir.id !== id));
      setSnackbarMessage('Directorate deleted successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      handleConfirmDeleteClose();
    } catch (error) {
      const msg = error.response?.data?.message || 'Error deleting directorate';
      setSnackbarMessage(msg);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const clearForm = () => {
    setCurrentDirectorate({ id: '', directoratename: '', telephone: '', email: '' });
  };

  const handleOpenAddEdit = (mode = 'new', directorate = null) => {
    setFormMode(mode);
    if (mode === 'edit' && directorate) {
      setCurrentDirectorate({
        id: directorate.id || '',
        directoratename: directorate.directoratename || '',
        telephone: directorate.telephone || '',
        email: directorate.email || '',
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

  const handleOpenEdit = (directorate) => {
    handleOpenAddEdit('edit', directorate);
  };

  const handleOpenDetails = (directorate) => {
    setCurrentDirectorate({
      id: directorate.id || '',
      directoratename: directorate.directoratename || '',
      telephone: directorate.telephone || '',
      email: directorate.email || '',
    });
    setOpenDetails(true);
  };

  const handleChangeAdd = (e) => {
    setCurrentDirectorate({ ...currentDirectorate, [e.target.id]: e.target.value });
  };

  const handleAddDirectorate = async () => {
    if (!currentDirectorate.directoratename.trim()) {
      setSnackbarMessage('Directorate name is required');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    try {
      const payload = {
        directoratename: currentDirectorate.directoratename.trim(),
        telephone: currentDirectorate.telephone.trim() || null,
        email: currentDirectorate.email.trim() || null,
      };
      console.log('Sending POST /directorates payload:', payload); // Enhanced logging
      const response = await axiosInstance.post('/directorates', payload);
      console.log('POST /directorates response:', response.data); // Log response
      setDirectorates([...directorates, response.data]);
      setSnackbarMessage('Directorate added successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      handleCloseAddEdit();
    } catch (error) {
      console.error('Error adding directorate:', error.response || error); // Detailed error logging
      const msg =
        error.response?.status === 409
          ? `Directorate name "${currentDirectorate.directoratename.trim()}" already exists`
          : error.response?.data?.message || 'Error adding directorate';
      setSnackbarMessage(msg);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleEditDirectorate = async () => {
    try {
      const payload = {
        directoratename: currentDirectorate.directoratename.trim(),
        telephone: currentDirectorate.telephone.trim() || null,
        email: currentDirectorate.email.trim() || null,
      };
      console.log('Sending PUT /directorates payload:', payload); // Enhanced logging
      const response = await axiosInstance.put(`/directorates/${currentDirectorate.id}`, payload);
      console.log('PUT /directorates response:', response.data); // Log response
      setDirectorates(
        directorates.map((dir) => (dir.id === currentDirectorate.id ? response.data : dir))
      );
      setSnackbarMessage('Directorate updated successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      handleCloseAddEdit();
    } catch (error) {
      console.error('Error updating directorate:', error.response || error); // Detailed error logging
      const msg = error.response?.data?.message || 'Error updating directorate';
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

  const filteredDirectorates = directorates.filter(
    (dir) =>
      (dir.directoratename || '').toLowerCase().includes(filterText.toLowerCase()) ||
      (dir.email || '').toLowerCase().includes(filterText.toLowerCase())
  );

  const isAddButtonDisabled = !currentDirectorate.directoratename.trim();

  return (
    <Box sx={{ padding: { xs: 2, md: 4 } }}>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4" style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
            <CCardHeader>
              <Typography variant="h6" fontWeight="bold">
                Directorates
              </Typography>
            </CCardHeader>
            <CCardBody>
              {loading ? (
                <Box display="flex" justifyContent="center" my={2}>
                  <CircularProgress />
                </Box>
              ) : error && !directorates.length ? (
                <Typography color="error">{error}</Typography>
              ) : (
                <StyledTableContainer component={Paper}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                    <StyledButton
                      variant="contained"
                      color="primary"
                      startIcon={
                        <Tooltip title="Add a new directorate" placement="top">
                          <AddIcon />
                        </Tooltip>
                      }
                      onClick={() => handleOpenAddEdit('new')}
                    >
                      Add Directorate
                    </StyledButton>
                    <TextField
                      label="Search Directorates"
                      variant="outlined"
                      value={filterText}
                      onChange={handleFilterChange}
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Tooltip title="Search directorates by name or email" placement="top">
                              <SearchIcon />
                            </Tooltip>
                          </InputAdornment>
                        ),
                      }}
                      sx={{ width: { xs: '100%', sm: '40%' } }}
                    />
                  </Box>
                  {filteredDirectorates.length > 0 ? (
                    <Table stickyHeader>
                      <TableHead>
                        <StyledTableRow>
                          <StyledTableCell>Name</StyledTableCell>
                          <StyledTableCell>Telephone</StyledTableCell>
                          <StyledTableCell>Email</StyledTableCell>
                          <StyledTableCell align="right">Actions</StyledTableCell>
                        </StyledTableRow>
                      </TableHead>
                      <TableBody>
                        {filteredDirectorates
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((dir, index) => (
                            <StyledTableRow key={dir.id}>
                              <StyledTableCell>{dir.directoratename || 'N/A'}</StyledTableCell>
                              <StyledTableCell>{dir.telephone || ''}</StyledTableCell>
                              <StyledTableCell>{dir.email || ''}</StyledTableCell>
                              <StyledTableCell align="right">
                                <Tooltip title="View directorate details" placement="top">
                                  <IconButton
                                    color="primary"
                                    onClick={() => handleOpenDetails(dir)}
                                    size="small"
                                    sx={{ mr: 1 }}
                                  >
                                    <VisibilityIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Edit directorate" placement="top">
                                  <IconButton
                                    color="primary"
                                    onClick={() => handleOpenEdit(dir)}
                                    size="small"
                                    sx={{ mr: 1 }}
                                  >
                                    <EditIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete directorate" placement="top">
                                  <IconButton
                                    color="error"
                                    onClick={() => handleConfirmDeleteOpen(dir.id)}
                                    size="small"
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              </StyledTableCell>
                            </StyledTableRow>
                          ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <Typography sx={{ p: 2, textAlign: 'center' }}>
                      {filterText ? 'No directorates found for the current filter.' : 'No directorates available.'}
                    </Typography>
                  )}
                  <TablePagination
                    component="div"
                    count={filteredDirectorates.length}
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
          <Typography>Are you sure you want to delete this directorate?</Typography>
        </DialogContent>
        <DialogActions>
          <StyledButton onClick={handleConfirmDeleteClose} color="primary">
            Cancel
          </StyledButton>
          <StyledButton
            onClick={() => handleDeleteDirectorate(deleteId)}
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
        <DialogTitle>{formMode === 'new' ? 'Add New Directorate' : 'Edit Directorate'}</DialogTitle>
        <DialogContent>
          <CForm className="row g-3">
            <CCol xs={12}>
              <CFormLabel htmlFor="directoratename">Directorate Name</CFormLabel>
              <CFormInput
                id="directoratename"
                value={currentDirectorate.directoratename || ''}
                onChange={handleChangeAdd}
                placeholder="Enter directorate name (e.g., Finance)"
                disabled={formMode === 'edit'}
              />
            </CCol>
            <CCol xs={12}>
              <CFormLabel htmlFor="telephone">Telephone</CFormLabel>
              <CFormInput
                id="telephone"
                type="tel"
                value={currentDirectorate.telephone || ''}
                onChange={handleChangeAdd}
                placeholder="Enter phone number (e.g., 0911....)"
              />
            </CCol>
            <CCol xs={12}>
              <CFormLabel htmlFor="email">Email</CFormLabel>
              <CFormInput
                id="email"
                type="email"
                value={currentDirectorate.email || ''}
                onChange={handleChangeAdd}
                placeholder="Enter email (e.g., contact@directorate.gov)"
              />
            </CCol>
          </CForm>
        </DialogContent>
        <DialogActions>
          <StyledButton onClick={handleCloseAddEdit} color="primary">
            Cancel
          </StyledButton>
          <StyledButton
            onClick={formMode === 'new' ? handleAddDirectorate : handleEditDirectorate}
            color="primary"
            variant="contained"
            disabled={formMode === 'new' && isAddButtonDisabled}
          >
            {formMode === 'new' ? 'Add Directorate' : 'Update Directorate'}
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
        <DialogTitle>Directorate Details</DialogTitle>
        <DialogContent>
          <CForm className="row g-3">
            <CCol md={6}>
              <CFormLabel>ID</CFormLabel>
              <CFormInput value={currentDirectorate.id || ''} readOnly />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Directorate Name</CFormLabel>
              <CFormInput value={currentDirectorate.directoratename || ''} readOnly />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Telephone</CFormLabel>
              <CFormInput value={currentDirectorate.telephone || ''} readOnly />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Email</CFormLabel>
              <CFormInput value={currentDirectorate.email || ''} readOnly />
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