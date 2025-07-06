import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Snackbar,
  Alert,
  Fade,
  Box,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import axiosInstance from '../../axiosConfig';

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

const PasswordChangeDialog = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    previousPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (!formData.previousPassword || !formData.newPassword || !formData.confirmPassword) {
        throw new Error('All fields are required');
      }
      if (formData.newPassword !== formData.confirmPassword) {
        throw new Error('New password and confirm password must match');
      }
      await axiosInstance.post('/users/change-password', {
        previousPassword: formData.previousPassword.trim(),
        newPassword: formData.newPassword.trim(),
        confirmPassword: formData.confirmPassword.trim(),
      });
      setSnackbarMessage('Password changed successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setFormData({
        previousPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      onClose();
    } catch (error) {
      const msg = error.response?.data || error.message || 'Error changing password';
      setSnackbarMessage(msg);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const isSubmitDisabled =
    !formData.previousPassword.trim() ||
    !formData.newPassword.trim() ||
    !formData.confirmPassword.trim() ||
    formData.newPassword !== formData.confirmPassword;

  return (
    <>
      <Dialog
        maxWidth="sm"
        fullWidth
        open={open}
        onClose={onClose}
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 800 }}
      >
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr' }, mt: 2 }}>
            <StyledTextField
              id="previousPassword"
              label="Previous Password"
              type="password"
              value={formData.previousPassword}
              onChange={handleChange}
              placeholder="Enter your current password"
              fullWidth
              variant="outlined"
              size="small"
            />
            <StyledTextField
              id="newPassword"
              label="New Password"
              type="password"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Enter new password"
              fullWidth
              variant="outlined"
              size="small"
            />
            <StyledTextField
              id="confirmPassword"
              label="Confirm New Password"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
              fullWidth
              variant="outlined"
              size="small"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <StyledButton onClick={onClose} color="primary">
            Cancel
          </StyledButton>
          <StyledButton
            onClick={handleSubmit}
            color="primary"
            variant="contained"
            disabled={isSubmitDisabled}
          >
            Change Password
          </StyledButton>
        </DialogActions>
      </Dialog>
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
    </>
  );
};

export default PasswordChangeDialog;