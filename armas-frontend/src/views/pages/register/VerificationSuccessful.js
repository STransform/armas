import React from 'react';
import { Box, Typography, Link } from '@mui/material';
import { NavLink } from 'react-router-dom'

function VerificationSuccessful() {
  return (
    <Box
      sx={{
        textAlign: 'center', // Centers the text horizontally
        color: 'green',      // Colors the text green
        marginTop: '20px',   // Optional: Add some margin on top
      }}
    >
      <Typography variant="h3" style={{fontWeight:'bolder'}}>
        You have successfully verified your account!
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

export default VerificationSuccessful;