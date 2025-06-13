import React, { useEffect, useState } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
} from '@coreui/react';
import {
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Fade,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
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

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: '#f9fafb',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: '#f1f5f9',
    },
    '&.Mui-focused': {
      backgroundColor: '#fff',
      boxShadow: '0 0 8px rgba(25, 118, 210, 0.3)',
    },
  },
  '& .MuiInputLabel-root': {
    fontWeight: 500,
    color: theme.palette.text.secondary,
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

export default function User() {
  const [users, setUsers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
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
  const [currentUser, setCurrentUser] = useState({
    id: '',
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    organizationId: '',
    directorateId: '',
  });
  const [formMode, setFormMode] = useState('');

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [usersResponse, orgsResponse, dirsResponse] = await Promise.all([
          axiosInstance.get('/users'),
          axiosInstance.get('/organizations'),
          axiosInstance.get('/directorates'),
        ]);
        setUsers(Array.isArray(usersResponse.data) ? usersResponse.data : []);
        setOrganizations(Array.isArray(orgsResponse.data) ? orgsResponse.data : []);
        setDirectorates(Array.isArray(dirsResponse.data) ? dirsResponse.data : []);
        if (usersResponse.data.length === 0) {
          setError('No users found.');
        }
      } catch (error) {
        const errorMessage = error.response
          ? `Error ${error.response.status}: ${error.response.data?.message || error.response.statusText}`
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

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/users/${id}`);
      setUsers(users.filter((user) => user.id !== id));
      setSnackbarMessage('User deleted successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      handleConfirmDeleteClose();
    } catch (error) {
      const msg = error.response?.data?.message || 'Error deleting user';
      setSnackbarMessage(msg);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const clearForm = () => {
    setCurrentUser({
      id: '',
      firstName: '',
      lastName: '',
      username: '',
      password: '',
      organizationId: '',
      directorateId: '',
    });
  };

  const handleOpenAddEdit = (mode = 'new', user = null) => {
    setFormMode(mode);
    if (mode === 'edit' && user) {
      setCurrentUser({
        id: user.id || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || '',
        password: '',
        organizationId: user.organization?.id || '',
        directorateId: user.directorate?.id || '',
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

  const handleOpenDetails = (user) => {
    setCurrentUser({
      id: user.id || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      username: user.username || '',
      organizationId: user.organization?.id || '',
      directorateId: user.directorate?.id || '',
    });
    setOpenDetails(true);
  };

  const handleCloseDetails = () => {
    setOpenDetails(false);
    clearForm();
  };

  const handleChangeAdd = (e) => {
    setCurrentUser({ ...currentUser, [e.target.id]: e.target.value });
  };

  const handleOrganizationChange = (e) => {
    setCurrentUser({ ...currentUser, organizationId: e.target.value });
  };

  const handleDirectorateChange = (e) => {
    setCurrentUser({ ...currentUser, directorateId: e.target.value });
  };

  const handleAddUser = async () => {
    try {
      const payload = {
        firstName: currentUser.firstName.trim(),
        lastName: currentUser.lastName.trim(),
        username: currentUser.username.trim(),
        password: currentUser.password.trim(),
        confirmPassword: currentUser.password.trim(),
        organizationId: currentUser.organizationId || null,
        directorateId: currentUser.directorateId || null,
        role: 'USER',
      };
      const response = await axiosInstance.post('/users', payload);
      const fullUser = await axiosInstance.get(`/users/${response.data.id}`);
      setUsers([...users, fullUser.data]);
      setSnackbarMessage('User added successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      handleCloseAddEdit();
    } catch (error) {
      const msg =
        error.response?.status === 409
          ? 'Username or ID already exists'
          : error.response?.data?.message || 'Error adding user';
      setSnackbarMessage(msg);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleEditUser = async () => {
    try {
      const payload = {
        firstName: currentUser.firstName.trim(),
        lastName: currentUser.lastName.trim(),
        username: currentUser.username.trim(),
        organization: currentUser.organizationId ? { id: currentUser.organizationId } : null,
        directorate: currentUser.directorateId ? { id: currentUser.directorateId } : null,
      };
      if (currentUser.password.trim()) payload.password = currentUser.password.trim();
      const response = await axiosInstance.put(`/users/${currentUser.id}`, payload);
      const updatedUser = await axiosInstance.get(`/users/${currentUser.id}`);
      setUsers(users.map((user) => (user.id === currentUser.id ? updatedUser.data : user)));
      setSnackbarMessage('User updated successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      handleCloseAddEdit();
    } catch (error) {
      const msg = error.response?.data?.message || 'Error updating user';
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

  const filteredUsers = users.filter(
    (user) =>
      (user.username?.toLowerCase() || '').includes(filterText.toLowerCase()) ||
      (user.firstName?.toLowerCase() || '').includes(filterText.toLowerCase()) ||
      (user.lastName?.toLowerCase() || '').includes(filterText.toLowerCase()) ||
      (user.organization?.orgname?.toLowerCase() || user.orgname?.toLowerCase() || '').includes(filterText.toLowerCase()) ||
      (user.directorate?.directoratename?.toLowerCase() || user.directoratename?.toLowerCase() || '').includes(filterText.toLowerCase())
  );

  const isAddButtonDisabled =
    !currentUser.firstName.trim() ||
    !currentUser.lastName.trim() ||
    !currentUser.username.trim() ||
    (formMode === 'new' && !currentUser.password.trim());

  return (
    <Box sx={{ padding: { xs: 2, md: 4 } }}>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4" style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
            <CCardHeader>
              <Typography variant="h6" fontWeight="bold">
                User Management
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
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                    <StyledButton
                      variant="contained"
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={() => handleOpenAddEdit('new')}
                    >
                      {/* Add New User */}
                    </StyledButton>
                    <StyledTextField
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
                          <StyledTableCell>First Name</StyledTableCell>
                          <StyledTableCell>Last Name</StyledTableCell>
                          <StyledTableCell>Username</StyledTableCell>
                          <StyledTableCell>Organization</StyledTableCell>
                          <StyledTableCell>Directorate</StyledTableCell>
                          <StyledTableCell align="right">Actions</StyledTableCell>
                        </StyledTableRow>
                      </TableHead>
                      <TableBody>
                        {filteredUsers
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((user, index) => (
                            <StyledTableRow key={user.id}>
                              <StyledTableCell>{page * rowsPerPage + index + 1}</StyledTableCell>
                              <StyledTableCell>{user.firstName || 'N/A'}</StyledTableCell>
                              <StyledTableCell>{user.lastName || 'N/A'}</StyledTableCell>
                              <StyledTableCell>{user.username || 'N/A'}</StyledTableCell>
                              <StyledTableCell>{user.organization?.orgname || user.orgname || 'N/A'}</StyledTableCell>
                              <StyledTableCell>{user.directorate?.directoratename || user.directoratename || 'N/A'}</StyledTableCell>
                              <StyledTableCell align="right">
                                <Tooltip title="View Details">
                                  <IconButton
                                    color="primary"
                                    onClick={() => handleOpenDetails(user)}
                                    size="small"
                                    sx={{ mr: 1 }}
                                  >
                                    <VisibilityIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Edit User">
                                  <IconButton
                                    color="primary"
                                    onClick={() => handleOpenAddEdit('edit', user)}
                                    size="small"
                                    sx={{ mr: 1 }}
                                  >
                                    <EditIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete User">
                                  <IconButton
                                    color="error"
                                    onClick={() => handleConfirmDeleteOpen(user.id)}
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
                      {filterText ? 'No users found for the current filter.' : 'No users available.'}
                    </Typography>
                  )}
                  <TablePagination
                    component="div"
                    count={filteredUsers.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25, 50]}
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
          <Typography>Are you sure you want to delete this user? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <StyledButton onClick={handleConfirmDeleteClose} color="primary">
            Cancel
          </StyledButton>
          <StyledButton
            onClick={() => handleDelete(deleteId)}
            color="error"
            variant="contained"
          >
            Delete
          </StyledButton>
        </DialogActions>
      </StyledDialog>

      <StyledDialog
        maxWidth="sm"
        fullWidth
        open={openAddEdit}
        onClose={handleCloseAddEdit}
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 800 }}
      >
        <DialogTitle>{formMode === 'new' ? 'Add New User' : 'Edit User'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr' }, mt: 2 }}>
            <StyledTextField
              id="id"
              label="User ID"
              value={currentUser.id || ''}
              onChange={handleChangeAdd}
              placeholder="Enter user ID (e.g., USER123)"
              disabled={formMode === 'edit'}
              fullWidth
              variant="outlined"
              size="small"
            />
            <StyledTextField
              id="firstName"
              label="First Name"
              value={currentUser.firstName || ''}
              onChange={handleChangeAdd}
              placeholder="Enter first name (e.g., John)"
              fullWidth
              variant="outlined"
              size="small"
            />
            <StyledTextField
              id="lastName"
              label="Last Name"
              value={currentUser.lastName || ''}
              onChange={handleChangeAdd}
              placeholder="Enter last name (e.g., Doe)"
              fullWidth
              variant="outlined"
              size="small"
            />
            <StyledTextField
              id="username"
              label="Username"
              value={currentUser.username || ''}
              onChange={handleChangeAdd}
              placeholder="Enter username (e.g., johndoe)"
              fullWidth
              variant="outlined"
              size="small"
            />
            {formMode === 'new' && (
              <StyledTextField
                id="password"
                label="Password"
                type="password"
                value={currentUser.password || ''}
                onChange={handleChangeAdd}
                placeholder="Enter password"
                fullWidth
                variant="outlined"
                size="small"
              />
            )}
            {formMode === 'edit' && (
              <StyledTextField
                id="password"
                label="New Password (optional)"
                type="password"
                value={currentUser.password || ''}
                onChange={handleChangeAdd}
                placeholder="Enter new password (leave blank to keep unchanged)"
                fullWidth
                variant="outlined"
                size="small"
              />
            )}
            <StyledFormControl fullWidth variant="outlined" size="small">
              <InputLabel id="organization-label">Organization</InputLabel>
              <Select
                labelId="organization-label"
                id="organization"
                value={currentUser.organizationId || ''}
                onChange={handleOrganizationChange}
                label="Organization"
              >
                <MenuItem value="">Select Organization</MenuItem>
                {organizations.map((org) => (
                  <MenuItem key={org.id} value={org.id}>
                    {org.orgname}
                  </MenuItem>
                ))}
              </Select>
            </StyledFormControl>
            <StyledFormControl fullWidth variant="outlined" size="small">
              <InputLabel id="directorate-label">Directorate</InputLabel>
              <Select
                labelId="directorate-label"
                id="directorate"
                value={currentUser.directorateId || ''}
                onChange={handleDirectorateChange}
                label="Directorate"
              >
                <MenuItem value="">Select Directorate</MenuItem>
                {directorates.map((dir) => (
                  <MenuItem key={dir.id} value={dir.id}>
                    {dir.directoratename}
                  </MenuItem>
                ))}
              </Select>
            </StyledFormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <StyledButton onClick={handleCloseAddEdit} color="primary">
            Cancel
          </StyledButton>
          <StyledButton
            onClick={formMode === 'new' ? handleAddUser : handleEditUser}
            color="primary"
            variant="contained"
            disabled={isAddButtonDisabled}
          >
            {formMode === 'new' ? 'Add User' : 'Update User'}
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
        <DialogTitle>User Details</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, mt: 2 }}>
            <StyledTextField
              label="User ID"
              value={currentUser.id || ''}
              fullWidth
              InputProps={{ readOnly: true }}
              variant="outlined"
              size="small"
            />
            <StyledTextField
              label="First Name"
              value={currentUser.firstName || ''}
              fullWidth
              InputProps={{ readOnly: true }}
              variant="outlined"
              size="small"
            />
            <StyledTextField
              label="Last Name"
              value={currentUser.lastName || ''}
              fullWidth
              InputProps={{ readOnly: true }}
              variant="outlined"
              size="small"
            />
            <StyledTextField
              label="Username"
              value={currentUser.username || ''}
              fullWidth
              InputProps={{ readOnly: true }}
              variant="outlined"
              size="small"
            />
            <StyledTextField
              label="Organization"
              value={organizations.find((org) => org.id === currentUser.organizationId)?.orgname || 'N/A'}
              fullWidth
              InputProps={{ readOnly: true }}
              variant="outlined"
              size="small"
            />
            <StyledTextField
              label="Directorate"
              value={directorates.find((dir) => dir.id === currentUser.directorateId)?.directoratename || 'N/A'}
              fullWidth
              InputProps={{ readOnly: true }}
              variant="outlined"
              size="small"
            />
          </Box>
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
          sx={{ minWidth: '250px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', borderRadius: '8px' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}