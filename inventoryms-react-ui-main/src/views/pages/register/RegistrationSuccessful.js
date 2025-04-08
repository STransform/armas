import React from 'react';
import { Box, Typography, Link } from '@mui/material';
import { NavLink } from 'react-router-dom'

function RegistrationSuccessful() {
  return (
    <Box
      sx={{
        textAlign: 'center', // Centers the text horizontally
        color: 'green',      // Colors the text green
        marginTop: '20px',   // Optional: Add some margin on top
      }}
    >
      <Typography variant="h3" style={{fontWeight:'bolder'}}>
        Thank you for starting your registration.
      </Typography>

      <Typography variant="h4" style={{fontWeight:'bolder'}}>
        An email has been sent. Please follow the instructions to complete your registration.
      </Typography>  

      {/* Smaller font link to login */}
      <Typography variant="h6" sx={{ marginTop: '10px' }}>
        <Link to="/login"  as={NavLink} underline="hover">
          Go to Login
        </Link>
      </Typography>
    </Box>
  );
}

export default RegistrationSuccessful;