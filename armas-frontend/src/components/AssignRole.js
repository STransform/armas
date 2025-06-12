import React, { useEffect, useState, useCallback } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
} from '@coreui/react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Fade,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  TextField,
  InputAdornment,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  CircularProgress,
  TablePagination,
  Box,
} from '@mui/material';
import {
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

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: '#f9fafb',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: '#f1f5f9',
    },
    '&.Mui-focused': {
      backgroundColor: '#fff',
      boxShadow: '0 0 8px rgba(25, 118, 210, 0.25)',
    },
  },
}));

export default function AssignRole() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [openAssign, setOpenAssign] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    console.log('AssignRole: Component mounted');
    const fetchData = async () => {
      setLoading(true);
      try {
        const [usersResponse, rolesResponse] = await Promise.all([
          axiosInstance.get('/users'),
          axiosInstance.get('/roles'),
        ]);
        console.log('AssignRole: Users response:', usersResponse.data);
        console.log('AssignRole: Roles response:', rolesResponse.data);
        const validUsers = Array.isArray(usersResponse.data)
          ? usersResponse.data.filter(user => user && user.id && user.username)
          : [];
        setUsers(validUsers);
        setRoles(Array.isArray(rolesResponse.data) ? rolesResponse.data : []);
        if (validUsers.length === 0) {
          setError('No valid users found.');
        }
      } catch (error) {
        const errorMessage = error.response
          ? `Error ${error.response.status}: ${error.response.data?.message || error.response.statusText}`
          : error.message;
        console.error('AssignRole: Fetch error:', errorMessage);
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

  const handleOpenAssign = useCallback((user) => {
    console.log('AssignRole: handleOpenAssign called with user:', user);
    setSelectedUser(user);
    setSelectedRoleIds([]);
    setOpenAssign(true);
    console.log('AssignRole: openAssign set to true, selectedUser:', user);
  }, []);

  const handleCloseAssign = useCallback(() => {
    console.log('AssignRole: handleCloseAssign called');
    setOpenAssign(false);
    setSelectedUser(null);
    setSelectedRoleIds([]);
    console.log('AssignRole: openAssign set to false');
  }, []);

  const handleRoleChange = (event) => {
    console.log('AssignRole: Role selection changed:', event.target.value);
    setSelectedRoleIds(event.target.value);
  };

  const handleAssignRole = async () => {
    if (!selectedUser || selectedRoleIds.length === 0) {
      console.log('AssignRole: Cannot assign - no user or roles selected');
      setSnackbarMessage('Please select at least one role.');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }
    try {
      const roleIds = selectedRoleIds.map(id => parseInt(id, 10));
      console.log('AssignRole: Assigning roles:', roleIds, 'to user:', selectedUser.id);
      const response = await axiosInstance.post(`/roles/assign/user/${selectedUser.id}`, roleIds);
      const updatedUser = response.data;
      setUsers(prev => prev.map(u => (u.id === updatedUser.id ? updatedUser : u)));
      setSnackbarMessage(`Role(s) assigned to ${selectedUser.username} successfully!`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      handleCloseAssign();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to assign role';
      console.error('AssignRole: Assign error:', msg);
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

  const filteredUsers = users.filter(
    (user) =>
      (user.username || '').toLowerCase().includes(filterText.toLowerCase()) ||
      (user.roles || []).some(role => (role.description || '').toLowerCase().includes(filterText.toLowerCase()))
  );

  console.log('AssignRole: Rendering with openAssign:', openAssign, 'filteredUsers:', filteredUsers);

  return (
    <Box sx={{ padding: { xs: 2, md: 4 } }}>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4" style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
            <CCardHeader>
              <Typography variant="h6" fontWeight="bold">
                Assign Roles
              </Typography>
            </CCardHeader>
            <CCardBody>
              {loading ? (
                <Box display="flex" justifyContent="center" my={2}>
                  <CircularProgress />
                </Box>
              ) : error && !users.length ? (
                <Typography color="error">{error}</Typography>
              ) : (
                <StyledTableContainer component={Paper}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', p: 2 }}>
                    <TextField
                      label="Search Users"
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
                  {filteredUsers.length > 0 ? (
                    <Table stickyHeader>
                      <TableHead>
                        <StyledTableRow>
                          <StyledTableCell>#</StyledTableCell>
                          <StyledTableCell>Username</StyledTableCell>
                          <StyledTableCell>Current Roles</StyledTableCell>
                          <StyledTableCell align="right">Actions</StyledTableCell>
                        </StyledTableRow>
                      </TableHead>
                      <TableBody>
                        {filteredUsers
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((user, index) => (
                            <StyledTableRow key={user.id}>
                              <StyledTableCell>{page * rowsPerPage + index + 1}</StyledTableCell>
                              <StyledTableCell>{user.username || 'N/A'}</StyledTableCell>
                              <StyledTableCell>
                                {user.roles && user.roles.length > 0
                                  ? user.roles.map(r => r.description).join(', ')
                                  : 'None'}
                              </StyledTableCell>
                              <StyledTableCell align="right">
                                <StyledButton
                                  variant="contained"
                                  color="primary"
                                  size="small"
                                  startIcon={<AddIcon />}
                                  onClick={() => handleOpenAssign(user)}
                                  aria-label="Assign Role"
                                >
                                  Assign Role
                                </StyledButton>
                              </StyledTableCell>
                            </StyledTableRow>
                          ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <Typography sx={{ p: 2, textAlign: 'center' }}>
                      No users found.
                    </Typography>
                  )}
                  <TablePagination
                    component="div"
                    count={filteredUsers.length}
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
        open={openAssign}
        onClose={handleCloseAssign}
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 800 }}
        aria-labelledby="assign-role-dialog-title"
      >
        <DialogTitle id="assign-role-dialog-title">
          Assign Role(s) to {selectedUser?.username || 'User'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <StyledFormControl fullWidth variant="outlined" size="small">
              <InputLabel id="role-label">Select Role(s)</InputLabel>
              <Select
                labelId="role-label"
                id="role"
                multiple
                value={selectedRoleIds}
                onChange={handleRoleChange}
                label="Select Role(s)"
                renderValue={(selected) =>
                  selected
                    .map(id => roles.find(role => role.id === parseInt(id))?.description)
                    .filter(Boolean)
                    .join(', ')
                }
              >
                {roles.map(role => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.description}
                  </MenuItem>
                ))}
              </Select>
            </StyledFormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <StyledButton onClick={handleCloseAssign} color="primary">
            Cancel
          </StyledButton>
          <StyledButton
            onClick={handleAssignRole}
            color="primary"
            variant="contained"
            disabled={selectedRoleIds.length === 0}
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
}