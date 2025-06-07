import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Alert,
  TableContainer,
  TablePagination,
  TextField,
  Box,
  IconButton,
  CircularProgress,
  Paper,
  Typography,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { getFileHistory, downloadFile } from '../file/upload_download';

const FileHistory = () => {
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filterText, setFilterText] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await getFileHistory();
      console.log('Raw file history data:', JSON.stringify(data, null, 2));
      setHistory(data);
      if (data.length === 0) {
        setError('No file history available.');
      }
    } catch (err) {
      setError('Failed to load file history: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDownload = async (id, docname, type = 'original') => {
    try {
      const response = await downloadFile(id, type);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', docname || 'file');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setSuccess(`Successfully downloaded ${type} document`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to download file: ' + (err.response?.data?.message || err.message));
      setTimeout(() => setError(''), 3000);
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

  const filteredHistory = history.filter((report) =>
    report
      ? (report.orgname || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (report.reportype || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (report.fiscal_year || '').toString().toLowerCase().includes(filterText.toLowerCase()) ||
        (report.createdBy || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (report.reportstatus || '').toLowerCase().includes(filterText.toLowerCase())
      : false
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: '1200px', mx: 'auto', mt: 4 }}>
      <Typography
        variant="h4"
        component="h2"
        gutterBottom
        sx={{ fontWeight: 'bold', color: '#1976d2', textAlign: { xs: 'center', md: 'left' } }}
      >
        File History
      </Typography>
      {loading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}
      {error && !loading && (
        <Alert
          severity="error"
          sx={{
            mb: 2,
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            maxWidth: { xs: '100%', md: '600px' },
            mx: 'auto',
          }}
          action={
            <IconButton color="inherit" size="small" onClick={fetchHistory}>
              <DownloadIcon />
            </IconButton>
          }
        >
          {error}
        </Alert>
      )}
      {success && (
        <Alert
          severity="success"
          sx={{
            mb: 2,
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            maxWidth: { xs: '100%', md: '600px' },
            mx: 'auto',
          }}
        >
          {success}
        </Alert>
      )}
      {!loading && history.length === 0 && !error && (
        <Alert
          severity="info"
          sx={{
            mb: 2,
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            maxWidth: { xs: '100%', md: '600px' },
            mx: 'auto',
          }}
        >
          No file history available.
        </Alert>
      )}
      {!loading && history.length > 0 && (
        <Paper
          elevation={3}
          sx={{
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          <Box
            sx={{
              p: 2,
              display: 'flex',
              justifyContent: { xs: 'center', md: 'flex-end' },
            }}
          >
            <TextField
              label="Search History"
              variant="outlined"
              value={filterText}
              onChange={handleFilterChange}
              size="small"
              sx={{
                width: { xs: '100%', sm: '300px' },
                bgcolor: '#fff',
                borderRadius: '8px',
              }}
            />
          </Box>
          {filteredHistory.length > 0 ? (
            <TableContainer sx={{ maxHeight: 600, overflowX: 'auto' }}>
              <Table
                stickyHeader
                sx={{
                  minWidth: 800, // Ensures horizontal scroll on small screens
                  '& .MuiTableCell-root': {
                    fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' },
                    padding: { xs: '8px', sm: '12px' },
                  },
                  '& .MuiTableRow-root:hover': {
                    bgcolor: '#e3f2fd',
                    transition: 'background-color 0.3s',
                  },
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        bgcolor: '#1976d2',
                        color: '#fff',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                      }}
                    >
                      Upload Date
                    </TableCell>
                    <TableCell
                      sx={{
                        bgcolor: '#1976d2',
                        color: '#fff',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                      }}
                    >
                      Organization Name
                    </TableCell>
                    <TableCell
                      sx={{
                        bgcolor: '#1976d2',
                        color: '#fff',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                      }}
                    >
                      Uploader
                    </TableCell>
                    <TableCell
                      sx={{
                        bgcolor: '#1976d2',
                        color: '#fff',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                      }}
                    >
                      Report Type
                    </TableCell>
                    <TableCell
                      sx={{
                        bgcolor: '#1976d2',
                        color: '#fff',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                      }}
                    >
                      Status
                    </TableCell>
                    <TableCell
                      sx={{
                        bgcolor: '#1976d2',
                        color: '#fff',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                      }}
                    >
                      Budget Year
                    </TableCell>
                    <TableCell
                      sx={{
                        bgcolor: '#1976d2',
                        color: '#fff',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                      }}
                    >
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredHistory
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          {report.createdDate
                            ? new Date(report.createdDate).toLocaleString()
                            : 'N/A'}
                        </TableCell>
                        <TableCell>{report.orgname || 'N/A'}</TableCell>
                        <TableCell>{report.createdBy || 'N/A'}</TableCell>
                        <TableCell>{report.reportype || 'N/A'}</TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: 'inline-block',
                              px: 1,
                              py: 0.5,
                              borderRadius: '12px',
                              bgcolor:
                                report.reportstatus === 'Submitted'
                                  ? '#e8f5e9'
                                  : '#fff3e0',
                              color:
                                report.reportstatus === 'Submitted'
                                  ? '#2e7d32'
                                  : '#f57c00',
                              fontSize: '0.85rem',
                              fontWeight: 'medium',
                            }}
                          >
                            {report.reportstatus || 'N/A'}
                          </Box>
                        </TableCell>
                        <TableCell>{report.fiscal_year || 'N/A'}</TableCell>
                        <TableCell>
                          {report.docname && (
                            <IconButton
                              color="primary"
                              onClick={() =>
                                handleDownload(report.id, report.docname, 'original')
                              }
                              aria-label={`Download ${report.docname}`}
                              sx={{
                                '&:hover': {
                                  bgcolor: '#e3f2fd',
                                  transform: 'scale(1.1)',
                                  transition: 'all 0.2s',
                                },
                              }}
                            >
                              <DownloadIcon />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert
              severity="info"
              sx={{
                m: 2,
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              No history found for the current filter.
            </Alert>
          )}
          <TablePagination
            component="div"
            count={filteredHistory.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
            sx={{
              '.MuiTablePagination-toolbar': {
                fontSize: { xs: '0.85rem', sm: '0.95rem' },
                padding: { xs: '8px', sm: '16px' },
              },
            }}
          />
        </Paper>
      )}
    </Box>
  );
};

export default FileHistory;