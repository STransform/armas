import React, { useState, useEffect, useCallback } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
} from '@coreui/react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fade,
  Alert,
  TextField,
  TablePagination,
  TableContainer,
  Box,
  Paper,
  Typography,
  Button,
  Tooltip,
  CircularProgress,
  InputAdornment,
  Snackbar,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import axiosInstance from '../axiosConfig';

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

const AssignPrivilegeToRole = () => {
  const [roles, setRoles] = useState([]);
  const [privileges, setPrivileges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedPrivilegeIds, setSelectedPrivilegeIds] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    console.log('AssignPrivilegeToRole: Component mounted');
    const fetchData = async () => {
      setLoading(true);
      try {
        const [rolesResponse, privilegesResponse] = await Promise.all([
          axiosInstance.get('/roles'),
          axiosInstance.get('/privileges'),
        ]);
        console.log('AssignPrivilegeToRole: Roles response:', rolesResponse.data);
        console.log('AssignPrivilegeToRole: Privileges response:', privilegesResponse.data);
        const validRoles = Array.isArray(rolesResponse.data)
          ? rolesResponse.data.filter(role => role && role.id && role.description)
          : [];
        const validPrivileges = Array.isArray(privilegesResponse.data)
          ? privilegesResponse.data.filter(privilege => privilege && privilege.id && privilege.description)
          : [];
        setRoles(validRoles);
        setPrivileges(validPrivileges);
        if (validRoles.length === 0) {
          setError('No valid roles found.');
        }
      } catch (error) {
        const errorMessage = error.response
          ? `Error ${error.response.status}: ${error.response.data?.message || error.response.statusText}`
          : error.message;
        console.error('AssignPrivilegeToRole: Fetch error:', errorMessage);
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

  const handleAssign = useCallback((role) => {
    console.log('AssignPrivilegeToRole: handleAssign called with role:', role);
    setSelectedRole(role);
    setSelectedPrivilegeIds(role.privileges ? role.privileges.map(p => p.id) : []);
    setShowAssignModal(true);
    console.log('AssignPrivilegeToRole: showAssignModal set to true, selectedRole:', role);
  }, []);

  const handleCloseAssignModal = useCallback(() => {
    console.log('AssignPrivilegeToRole: handleCloseAssignModal called');
    setShowAssignModal(false);
    setSelectedRole(null);
    setSelectedPrivilegeIds([]);
    console.log('AssignPrivilegeToRole: showAssignModal set to false');
  }, []);

  const handlePrivilegeChange = (privilegeId) => {
    console.log('AssignPrivilegeToRole: Privilege selection changed:', privilegeId);
    setSelectedPrivilegeIds(prev =>
      prev.includes(privilegeId)
        ? prev.filter(id => id !== privilegeId)
        : [...prev, privilegeId]
    );
  };

  const handleAssignPrivileges = async () => {
    if (!selectedRole || !selectedRole.id || selectedPrivilegeIds.length === 0) {
      setSnackbarMessage('Please select a valid role and at least one privilege.');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }
    try {
      const url = `/roles/${selectedRole.id}/assign-privileges`;
      console.log('Request URL:', axiosInstance.defaults.baseURL + url);
      console.log('Payload:', selectedPrivilegeIds);
      const response = await axiosInstance.post(url, selectedPrivilegeIds);
      const updatedRole = response.data;
      setRoles(prev => prev.map(r => (r.id === updatedRole.id ? updatedRole : r)));
      setSnackbarMessage(`Privilege(s) assigned to ${selectedRole.description} successfully!`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      handleCloseAssignModal();
    } catch (error) {
      const msg = error.response?.data?.message || `Failed to assign privileges: ${error.message} (Status: ${error.response?.status})`;
      console.error('Assign error:', msg);
      setSnackbarMessage(msg);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
    setError(null);
  };

  const handleFilterChange = (event) => {
    setFilterText(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredRoles = roles.filter(
    (role) =>
      (role.description || '').toLowerCase().includes(filterText.toLowerCase()) ||
      (role.details || '').toLowerCase().includes(filterText.toLowerCase())
  );

  console.log('AssignPrivilegeToRole: Rendering with showAssignModal:', showAssignModal, 'filteredRoles:', filteredRoles);

  return (
    <Box sx={{ padding: { xs: 2, md: 4 } }}>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4" style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
            <CCardHeader>
              <Typography variant="h6" fontWeight="bold">
                Assign Privileges to Roles
              </Typography>
            </CCardHeader>
            <CCardBody>
              {loading ? (
                <Box display="flex" justifyContent="center" my={2}>
                  <CircularProgress />
                </Box>
              ) : error && !roles.length ? (
                <Typography color="error">{error}</Typography>
              ) : (
                <StyledTableContainer component={Paper}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', p: 2 }}>
                    <TextField
                      label="Search Roles"
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
                  {filteredRoles.length > 0 ? (
                    <Table stickyHeader>
                      <TableHead>
                        <StyledTableRow>
                          <StyledTableCell>Role</StyledTableCell>
                          <StyledTableCell>Details</StyledTableCell>
                          <StyledTableCell align="right">Action</StyledTableCell>
                        </StyledTableRow>
                      </TableHead>
                      <TableBody>
                        {filteredRoles
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((role) => (
                            <StyledTableRow key={role.id}>
                              <StyledTableCell>{role.description || 'N/A'}</StyledTableCell>
                              <StyledTableCell>{role.details || 'N/A'}</StyledTableCell>
                              <StyledTableCell align="right">
                                <Tooltip title="Assign Privileges">
                                  <IconButton
                                    color="primary"
                                    onClick={() => handleAssign(role)}
                                    aria-label="Assign privileges"
                                  >
                                    <AddIcon />
                                  </IconButton>
                                </Tooltip>
                              </StyledTableCell>
                            </StyledTableRow>
                          ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <Typography sx={{ p: 2, textAlign: 'center' }}>
                      No roles found.
                    </Typography>
                  )}
                  <TablePagination
                    component="div"
                    count={filteredRoles.length}
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

      {/* Assign Privileges Dialog */}
      <StyledDialog
        maxWidth="sm"
        fullWidth
        open={showAssignModal}
        onClose={handleCloseAssignModal}
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 800 }}
        aria-labelledby="assign-privilege-dialog"
      >
        <DialogTitle id="assign-privilege-dialog">
          Assign Privileges to {selectedRole?.description || 'Role'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {privileges.length > 0 ? (
              privileges.map(privilege => (
                <FormControlLabel
                  key={privilege.id}
                  control={
                    <Checkbox
                      checked={selectedPrivilegeIds.includes(privilege.id)}
                      onChange={() => handlePrivilegeChange(privilege.id)}
                      color="primary"
                    />
                  }
                  label={privilege.description}
                  sx={{ display: 'block', mb: 1 }}
                />
              ))
            ) : (
              <Typography color="text.secondary">No privileges available</Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <StyledButton onClick={handleCloseAssignModal} color="primary">
            Cancel
          </StyledButton>
          <StyledButton
            onClick={handleAssignPrivileges}
            color="primary"
            variant="contained"
            disabled={selectedPrivilegeIds.length === 0}
          >
            Assign
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
};

export default AssignPrivilegeToRole;