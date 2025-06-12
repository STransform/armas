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
  const [openAddEdit, setOpenAddEdit] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [currentBudgetYear, setCurrentBudgetYear] = useState({
    id: null,
    fiscal_year: '',
  });
  const [formMode, setFormMode] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get('/budgetyears/');
        setBudgetYears(Array.isArray(response.data) ? response.data : []);
        setLoading(false);
      } catch (error) {
        const errorMessage = error.response
          ? `Error ${error.response.status}: ${
              error.response.data?.message || error.response.data || error.response.statusText
            }`
          : error.message;
        setError(errorMessage);
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

  const handleDeleteBudgetYear = async (id) => {
    try {
      await axiosInstance.delete(`/budgetyears/${id}`);
      setBudgetYears((prev) => prev.filter((year) => year.id !== id));
      setSnackbarMessage('Budget Year deleted successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      handleConfirmDeleteClose();
    } catch (error) {
      const msg = error.response?.data || 'Error deleting budget year';
      setSnackbarMessage(msg);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const clearForm = () => {
    setCurrentBudgetYear({ id: null, fiscal_year: '' });
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

  const handleOpenEdit = (budgetYear) => {
    setCurrentBudgetYear(budgetYear);
    setFormMode('edit');
    setOpenAddEdit(true);
  };

  const handleOpenDetails = (budgetYear) => {
    setCurrentBudgetYear(budgetYear);
    setOpenDetails(true);
  };

  const handleChangeAdd = (e) => {
    setCurrentBudgetYear({ ...currentBudgetYear, [e.target.id]: e.target.value });
  };

  const handleAddBudgetYear = async () => {
    try {
      await axiosInstance.post('/budgetyears/', { fiscal_year: currentBudgetYear.fiscal_year });
      const fetchResponse = await axiosInstance.get('/budgetyears/');
      setBudgetYears(Array.isArray(fetchResponse.data) ? fetchResponse.data : []);
      setSnackbarMessage('Budget Year added successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      clearForm();
      handleCloseAddEdit();
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data || 'Error adding budget year';
      setSnackbarMessage(msg);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleEditBudgetYear = async () => {
    try {
      const response = await axiosInstance.put(`/budgetyears/${currentBudgetYear.id}`, {
        fiscal_year: currentBudgetYear.fiscal_year,
      });
      setBudgetYears((prev) =>
        prev.map((year) => (year.id === currentBudgetYear.id ? response.data : year))
      );
      setSnackbarMessage('Budget Year updated successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      clearForm();
      handleCloseAddEdit();
    } catch (error) {
      const msg = error.response?.data || 'Error updating budget year';
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

  const filteredBudgetYears = budgetYears.filter(
    (year) =>
      (year.id || '').toString().toLowerCase().includes(filterText.toLowerCase()) ||
      (year.fiscal_year || '').toLowerCase().includes(filterText.toLowerCase())
  );

  const isAddButtonDisabled = !currentBudgetYear.fiscal_year.trim();

  return (
    <Box sx={{ padding: { xs: 2, md: 4 } }}>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4" style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
            <CCardHeader>
              <Typography variant="h6" fontWeight="bold">
                Budget Years
              </Typography>
            </CCardHeader>
            <CCardBody>
              {loading ? (
                <Typography>Loading...</Typography>
              ) : error ? (
                <Typography color="error">{error}</Typography>
              ) : (
                <StyledTableContainer component={Paper}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                    <StyledButton
                      variant="contained"
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={handleOpenAddEdit}
                    >
                      New Budget Year
                    </StyledButton>
                    <TextField
                      label="Search Budget Years"
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
                  {filteredBudgetYears.length > 0 ? (
                    <Table stickyHeader>
                      <TableHead>
                        <StyledTableRow>
                          <StyledTableCell>Fiscal Year</StyledTableCell>
                          <StyledTableCell align="right">Actions</StyledTableCell>
                        </StyledTableRow>
                      </TableHead>
                      <TableBody>
                        {filteredBudgetYears
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((year) => (
                            <StyledTableRow key={year.id}>
                              <StyledTableCell>{year.fiscal_year || 'N/A'}</StyledTableCell>
                              <StyledTableCell align="right">
                                <IconButton
                                  color="success"
                                  onClick={() => handleOpenDetails(year)}
                                  size="small"
                                  sx={{ mr: 1 }}
                                >
                                  <VisibilityIcon />
                                </IconButton>
                                <IconButton
                                  color="primary"
                                  onClick={() => handleOpenEdit(year)}
                                  size="small"
                                  sx={{ mr: 1 }}
                                >
                                  <EditIcon />
                                </IconButton>
                                <IconButton
                                  color="error"
                                  onClick={() => handleConfirmDeleteOpen(year.id)}
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
                    <Typography sx={{ p: 2 }}>No budget years found.</Typography>
                  )}
                  <TablePagination
                    component="div"
                    count={filteredBudgetYears.length}
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
          <Typography>Are you sure you want to delete this budget year?</Typography>
        </DialogContent>
        <DialogActions>
          <StyledButton onClick={handleConfirmDeleteClose} color="primary">
            Cancel
          </StyledButton>
          <StyledButton
            onClick={() => handleDeleteBudgetYear(deleteId)}
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
        <DialogTitle>{formMode === 'new' ? 'Add New Budget Year' : 'Edit Budget Year'}</DialogTitle>
        <DialogContent>
          <CForm className="row g-3">
            <CCol xs={12}>
              <CFormLabel htmlFor="fiscal_year">Fiscal Year</CFormLabel>
              <CFormInput
                id="fiscal_year"
                value={currentBudgetYear.fiscal_year || ''}
                onChange={handleChangeAdd}
                placeholder="Enter fiscal year (e.g., 2023-2024)"
              />
            </CCol>
          </CForm>
        </DialogContent>
        <DialogActions>
          <StyledButton onClick={handleCloseAddEdit} color="primary">
            Cancel
          </StyledButton>
          <StyledButton
            onClick={formMode === 'new' ? handleAddBudgetYear : handleEditBudgetYear}
            color="primary"
            variant="contained"
            disabled={formMode === 'new' && isAddButtonDisabled}
          >
            {formMode === 'edit' ? 'Update Budget Year' : 'Add Budget Year'}
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
        <DialogTitle>Budget Year Details</DialogTitle>
        <DialogContent>
          <CForm className="row g-3">
            <CCol md={6}>
              <CFormLabel>ID</CFormLabel>
              <CFormInput value={currentBudgetYear.id || ''} readOnly />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Fiscal Year</CFormLabel>
              <CFormInput value={currentBudgetYear.fiscal_year || ''} readOnly />
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