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

export default function Organization() {
  const [organizations, setOrganizations] = useState([]);
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
  const [currentOrganization, setCurrentOrganization] = useState({
    id: '',
    orgname: '',
    email: '',
    telephone: '',
    organizationhead: '',
    orgtype: '',
  });
  const [formMode, setFormMode] = useState('');

  // Fetch organizations
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get('/organizations');
        setOrganizations(Array.isArray(response.data) ? response.data : []);
        if (response.data.length === 0) {
          setError('No organizations available.');
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

  const handleDeleteOrganization = async (id) => {
    try {
      await axiosInstance.delete(`/organizations/${id}`);
      setOrganizations(organizations.filter((org) => org.id !== id));
      setSnackbarMessage('Organization deleted successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      handleConfirmDeleteClose();
    } catch (error) {
      const msg = error.response?.data?.message || 'Error deleting organization';
      setSnackbarMessage(msg);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const clearForm = () => {
    setCurrentOrganization({
      id: '',
      orgname: '',
      email: '',
      telephone: '',
      organizationhead: '',
      orgtype: '',
    });
  };

  const handleOpenAddEdit = (mode = 'new', organization = null) => {
    setFormMode(mode);
    if (mode === 'edit' && organization) {
      setCurrentOrganization({
        id: organization.id || '',
        orgname: organization.orgname || '',
        email: organization.email || '',
        telephone: organization.telephone || '',
        organizationhead: organization.organizationhead || '',
        orgtype: organization.orgtype || '',
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

  const handleOpenDetails = (organization) => {
    setCurrentOrganization({
      id: organization.id || '',
      orgname: organization.orgname || '',
      email: organization.email || '',
      telephone: organization.telephone || '',
      organizationhead: organization.organizationhead || '',
      orgtype: organization.orgtype || '',
    });
    setOpenDetails(true);
  };

  const handleCloseDetails = () => {
    setOpenDetails(false);
    clearForm();
  };

  const handleChangeAdd = (e) => {
    setCurrentOrganization({ ...currentOrganization, [e.target.id]: e.target.value });
  };

  const handleAddOrganization = async () => {
    try {
      const payload = {
        id: currentOrganization.id.trim(),
        orgname: currentOrganization.orgname.trim(),
        email: currentOrganization.email.trim(),
        telephone: currentOrganization.telephone.trim(),
        organizationhead: currentOrganization.organizationhead.trim(),
        orgtype: currentOrganization.orgtype.trim(),
      };
      const response = await axiosInstance.post('/organizations', payload);
      setOrganizations([...organizations, response.data]);
      setSnackbarMessage('Organization added successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      handleCloseAddEdit();
    } catch (error) {
      const msg =
        error.response?.status === 409
          ? 'Organization ID already exists'
          : error.response?.data?.message || 'Error adding organization';
      setSnackbarMessage(msg);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleEditOrganization = async () => {
    try {
      const payload = {
        id: currentOrganization.id.trim(),
        orgname: currentOrganization.orgname.trim(),
        email: currentOrganization.email.trim(),
        telephone: currentOrganization.telephone.trim(),
        organizationhead: currentOrganization.organizationhead.trim(),
        orgtype: currentOrganization.orgtype.trim(),
      };
      const response = await axiosInstance.put(`/organizations/${currentOrganization.id}`, payload);
      setOrganizations(
        organizations.map((org) => (org.id === currentOrganization.id ? response.data : org))
      );
      setSnackbarMessage('Organization updated successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      handleCloseAddEdit();
    } catch (error) {
      const msg = error.response?.data?.message || 'Error updating organization';
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

  const filteredOrganizations = organizations.filter(
    (org) =>
      (org.orgname || '').toLowerCase().includes(filterText.toLowerCase()) ||
      (org.email || '').toLowerCase().includes(filterText.toLowerCase())
  );

  const isAddButtonDisabled =
    !currentOrganization.id.trim() ||
    !currentOrganization.orgname.trim() ||
    !currentOrganization.email.trim() ||
    !currentOrganization.orgtype.trim();

  return (
    <Box sx={{ padding: { xs: 2, md: 4 } }}>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4" style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
            <CCardHeader>
              <Typography variant="h6" fontWeight="bold">
                Organizations
              </Typography>
            </CCardHeader>
            <CCardBody>
              {loading ? (
                <Box display="flex" justifyContent="center" my={2}>
                  <CircularProgress />
                </Box>
              ) : error && !organizations.length ? (
                <Typography color="error">{error}</Typography>
              ) : (
                <StyledTableContainer component={Paper}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                    <StyledButton
                      variant="contained"
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={() => handleOpenAddEdit('new')}
                    >
                      {/* New Organization */}
                    </StyledButton>
                    <TextField
                      label="Search Organizations"
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
                  {filteredOrganizations.length > 0 ? (
                    <Table stickyHeader>
                      <TableHead>
                        <StyledTableRow>
                          <StyledTableCell>#</StyledTableCell>
                          <StyledTableCell>Name</StyledTableCell>
                          <StyledTableCell>Email</StyledTableCell>
                          <StyledTableCell>Telephone</StyledTableCell>
                          <StyledTableCell>Head</StyledTableCell>
                          {/* <StyledTableCell>Type</StyledTableCell> */}
                          <StyledTableCell align="right">Actions</StyledTableCell>
                        </StyledTableRow>
                      </TableHead>
                      <TableBody>
                        {filteredOrganizations
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((org, index) => (
                            <StyledTableRow key={org.id}>
                              <StyledTableCell>{page * rowsPerPage + index + 1}</StyledTableCell>
                              <StyledTableCell>{org.orgname || 'N/A'}</StyledTableCell>
                              <StyledTableCell>{org.email || 'N/A'}</StyledTableCell>
                              <StyledTableCell>{org.telephone || 'N/A'}</StyledTableCell>
                              <StyledTableCell>{org.organizationhead || 'N/A'}</StyledTableCell>
                              {/* <StyledTableCell>{org.orgtype || 'N/A'}</StyledTableCell> */}
                              <StyledTableCell align="right">
                                <IconButton
                                  color="primary"
                                  onClick={() => handleOpenDetails(org)}
                                  size="small"
                                  sx={{ mr: 1 }}
                                >
                                  <VisibilityIcon />
                                </IconButton>
                                <IconButton
                                  color="primary"
                                  onClick={() => handleOpenAddEdit('edit', org)}
                                  size="small"
                                  sx={{ mr: 1 }}
                                >
                                  <EditIcon />
                                </IconButton>
                                <IconButton
                                  color="error"
                                  onClick={() => handleConfirmDeleteOpen(org.id)}
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
                      {filterText ? 'No organizations found for the current filter.' : 'No organizations available.'}
                    </Typography>
                  )}
                  <TablePagination
                    component="div"
                    count={filteredOrganizations.length}
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
          <Typography>Are you sure you want to delete this organization?</Typography>
        </DialogContent>
        <DialogActions>
          <StyledButton onClick={handleConfirmDeleteClose} color="primary">
            Cancel
          </StyledButton>
          <StyledButton
            onClick={() => handleDeleteOrganization(deleteId)}
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
        <DialogTitle>{formMode === 'new' ? 'Add New Organization' : 'Edit Organization'}</DialogTitle>
        <DialogContent>
          <CForm className="row g-3">
            <CCol xs={12}>
              <CFormLabel htmlFor="id">Organization ID</CFormLabel>
              <CFormInput
                id="id"
                value={currentOrganization.id || ''}
                onChange={handleChangeAdd}
                placeholder="Enter organization ID (e.g., ORG123)"
                disabled={formMode === 'edit'}
              />
            </CCol>
            <CCol xs={12}>
              <CFormLabel htmlFor="orgname">Organization Name</CFormLabel>
              <CFormInput
                id="orgname"
                value={currentOrganization.orgname || ''}
                onChange={handleChangeAdd}
                placeholder="Enter organization name (e.g., MOF,AAU)"
              />
            </CCol>
            <CCol xs={12}>
              <CFormLabel htmlFor="email">Email</CFormLabel>
              <CFormInput
                id="email"
                type="email"
                value={currentOrganization.email || ''}
                onChange={handleChangeAdd}
                placeholder="Enter email (e.g., contact@org.com)"
              />
            </CCol>
            <CCol xs={12}>
              <CFormLabel htmlFor="telephone">Telephone</CFormLabel>
              <CFormInput
                id="telephone"
                type="tel"
                value={currentOrganization.telephone || ''}
                onChange={handleChangeAdd}
                placeholder="Enter phone number (e.g., 0912345678)"
              />
            </CCol>
            <CCol xs={12}>
              <CFormLabel htmlFor="organizationhead">Organization Head</CFormLabel>
              <CFormInput
                id="organizationhead"
                value={currentOrganization.organizationhead || ''}
                onChange={handleChangeAdd}
                placeholder="Enter head's name (e.g., Simon Temesgen)"
              />
            </CCol>
            {/* <CCol xs={12}>
              <CFormLabel htmlFor="orgtype">Organization Type</CFormLabel>
              <CFormInput
                id="orgtype"
                value={currentOrganization.orgtype || ''}
                onChange={handleChangeAdd}
                placeholder="Enter type (e.g., Social)"
              />
            </CCol> */}
          </CForm>
        </DialogContent>
        <DialogActions>
          <StyledButton onClick={handleCloseAddEdit} color="primary">
            Cancel
          </StyledButton>
          <StyledButton
            onClick={formMode === 'new' ? handleAddOrganization : handleEditOrganization}
            color="primary"
            variant="contained"
            disabled={formMode === 'new' && isAddButtonDisabled}
          >
            {formMode === 'new' ? 'Add Organization' : 'Update Organization'}
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
        <DialogTitle>Organization Details</DialogTitle>
        <DialogContent>
          <CForm className="row g-3">
            <CCol md={6}>
              <CFormLabel>Organization ID</CFormLabel>
              <CFormInput value={currentOrganization.id || ''} readOnly />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Organization Name</CFormLabel>
              <CFormInput value={currentOrganization.orgname || ''} readOnly />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Email</CFormLabel>
              <CFormInput value={currentOrganization.email || ''} readOnly />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Telephone</CFormLabel>
              <CFormInput value={currentOrganization.telephone || ''} readOnly />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Organization Head</CFormLabel>
              <CFormInput value={currentOrganization.organizationhead || ''} readOnly />
            </CCol>
            {/* <CCol md={6}>
              <CFormLabel>Organization Type</CFormLabel>
              <CFormInput value={currentOrganization.orgtype || ''} readOnly />
            </CCol> */}
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