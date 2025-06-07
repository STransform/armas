import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Alert,
  TextField,
  TablePagination,
  TableContainer,
  Box,
  IconButton,
  CircularProgress,
  Paper,
  Typography,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { downloadFile } from '../file/upload_download';
import axiosInstance from '../axiosConfig';

const LetterDownload = () => {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filterText, setFilterText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportsWithLetters = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get('/transactions/my-reports');
        console.log('Raw response data:', JSON.stringify(response.data, null, 2));
        const mappedReports = response.data
          .filter((report) => report.letterDocname)
          .map((report) => {
            console.log('Mapping report ID=' + report.id + ':', report);
            return {
              id: report.id,
              createdDate: report.createdDate,
              orgname: report.organization?.orgname ?? 'N/A',
              fiscalYear: report.budgetYear?.fiscalYear ?? 'N/A',
              reportype: report.transactiondocument?.reportype ?? 'N/A',
              responseNeeded: report.response_needed ?? 'N/A',
              reportstatus: report.reportstatus ?? 'N/A',
              letterDocname: report.letterDocname,
            };
          });
        console.log('Mapped reports:', mappedReports);
        setReports(mappedReports);
        if (mappedReports.length === 0) {
          setError('No reports with uploaded letters found.');
        }
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || err.message || 'Failed to load reports';
        setError('Failed to load reports: ' + errorMessage);
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReportsWithLetters();
  }, []);

  const handleDownload = async (id, filename) => {
    try {
      console.log(`Downloading letter: id=${id}, filename=${filename}`);
      const response = await downloadFile(id, 'letter');
      const blob = new Blob([response.data]);
      console.log('Blob size:', blob.size);
      if (blob.size === 0) {
        throw new Error('Empty letter file received');
      }
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename || 'letter');
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      setSuccess('Successfully downloaded letter');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const errorMessage =
        err.response?.status === 404
          ? 'Letter not found'
          : err.response?.status === 403
          ? 'You are not authorized to download this letter'
          : `Failed to download letter: ${err.message}`;
      setError(errorMessage);
      console.error('Download error:', err);
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

  const filteredReports = reports.filter((report) =>
    report
      ? (report.orgname || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (report.reportype || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (report.fiscalYear || '').toString().toLowerCase().includes(filterText.toLowerCase()) ||
        (report.responseNeeded || '').toLowerCase().includes(filterText.toLowerCase()) ||
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
        Download Letters
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
            <IconButton
              color="inherit"
              size="small"
              onClick={() => {
                setError('');
                setLoading(true);
                fetchReportsWithLetters();
              }}
            >
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
      {!loading && reports.length === 0 && !error && (
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
          No letters available for download.
        </Alert>
      )}
      {!loading && reports.length > 0 && (
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
              label="Search Reports"
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
          {filteredReports.length > 0 ? (
            <TableContainer sx={{ maxHeight: 600, overflowX: 'auto' }}>
              <Table
                stickyHeader
                sx={{
                  minWidth: 800,
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
                      Date
                    </TableCell>
                    <TableCell
                      sx={{
                        bgcolor: '#1976d2',
                        color: '#fff',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                      }}
                    >
                      Organization
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
                      Response
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
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredReports
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((report) => (
                      <TableRow key={report.id || Math.random()}>
                        <TableCell>
                          {report.createdDate
                            ? new Date(report.createdDate).toLocaleDateString()
                            : 'N/A'}
                        </TableCell>
                        <TableCell>{report.orgname}</TableCell>
                        <TableCell>{report.fiscalYear}</TableCell>
                        <TableCell>{report.reportype}</TableCell>
                        <TableCell>{report.responseNeeded}</TableCell>
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
                        <TableCell>
                          {report.letterDocname && (
                            <IconButton
                              color="primary"
                              onClick={() =>
                                handleDownload(report.id, report.letterDocname)
                              }
                              aria-label={`Download ${report.letterDocname}`}
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
              No reports with letters found.
            </Alert>
          )}
          <TablePagination
            component="div"
            count={filteredReports.length}
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

export default LetterDownload;