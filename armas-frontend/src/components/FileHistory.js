import React, { useState, useEffect } from 'react';
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
  TextField,
  TablePagination,
  TableContainer,
  Box,
  IconButton,
  CircularProgress,
  Paper,
  Typography,
  Snackbar,
  Alert,
  InputAdornment,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { getFileHistory, downloadFile } from '../file/upload_download';

// Styled components for enhanced UI
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  backgroundColor: theme.palette.background.paper,
}));

const StyledButton = styled(IconButton)(({ theme }) => ({
  borderRadius: '6px',
  padding: '8px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
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

export default function FileHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filterText, setFilterText] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getFileHistory();
      const validHistory = Array.isArray(data) ? data.filter((item) => item && item.id) : [];
      setHistory(validHistory);
      if (validHistory.length === 0) {
        setError('No file history available.');
      }
    } catch (error) {
      const errorMessage = error.response
        ? `Error ${error.response.status}: ${
            error.response.data?.message || error.response.data || error.response.statusText
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

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDownload = async (id, docname, type = 'original') => {
    try {
      const response = await downloadFile(id, type);
      const blob = new Blob([response.data]);
      if (blob.size === 0) {
        throw new Error('Empty file received');
      }
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', docname || 'file');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setSnackbarMessage(`Successfully downloaded ${type} document`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      const errorMessage = error.response
        ? `Error ${error.response.status}: ${
            error.response.data?.message || error.response.data || error.response.statusText
          }`
        : error.message;
      setSnackbarMessage(errorMessage);
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

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const filteredHistory = history.filter((report) =>
    report
      ? (report.orgname || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (report.reportype || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (report.fiscal_year || report.fiscalYear || '').toString().toLowerCase().includes(filterText.toLowerCase()) ||
        (report.createdBy || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (report.reportstatus || '').toLowerCase().includes(filterText.toLowerCase())
      : false
  );

  return (
    <Box sx={{ padding: { xs: 2, md: 4 } }}>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4" style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
            <CCardHeader>
              <Typography variant="h6" fontWeight="bold">
                File History
              </Typography>
            </CCardHeader>
            <CCardBody>
              {loading ? (
                <Box display="flex" justifyContent="center" my={2}>
                  <CircularProgress />
                </Box>
              ) : error && !filteredHistory.length ? (
                <Box sx={{ textAlign: 'center', my: 2 }}>
                  <Typography color="error" sx={{ mb: 2 }}>
                    {error}
                  </Typography>
                  <StyledButton
                    color="primary"
                    onClick={fetchHistory}
                    aria-label="Retry fetching file history"
                  >
                    <DownloadIcon />
                  </StyledButton>
                </Box>
              ) : (
                <StyledTableContainer component={Paper}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                    <TextField
                      label="Search History"
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
                  {filteredHistory.length > 0 ? (
                    <Table stickyHeader>
                      <TableHead>
                        <StyledTableRow>
                          <StyledTableCell>Upload Date</StyledTableCell>
                          <StyledTableCell>Organization Name</StyledTableCell>
                          <StyledTableCell>Uploader</StyledTableCell>
                          <StyledTableCell>Report Type</StyledTableCell>
                          <StyledTableCell>Status</StyledTableCell>
                          <StyledTableCell>Budget Year</StyledTableCell>
                          <StyledTableCell align="right">Action</StyledTableCell>
                        </StyledTableRow>
                      </TableHead>
                      <TableBody>
                        {filteredHistory
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((report) => (
                            <StyledTableRow key={report.id}>
                              <StyledTableCell>
                                {report.createdDate
                                  ? new Date(report.createdDate).toLocaleString()
                                  : 'N/A'}
                              </StyledTableCell>
                              <StyledTableCell>{report.orgname || 'N/A'}</StyledTableCell>
                              <StyledTableCell>{report.createdBy || 'N/A'}</StyledTableCell>
                              <StyledTableCell>{report.reportype || 'N/A'}</StyledTableCell>
                              <StyledTableCell>
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
                              </StyledTableCell>
                              <StyledTableCell>{report.fiscal_year || report.fiscalYear || 'N/A'}</StyledTableCell>
                              <StyledTableCell align="right">
                                {report.docname && (
                                  <StyledButton
                                    color="primary"
                                    onClick={() => handleDownload(report.id, report.docname, 'original')}
                                    aria-label={`Download ${report.docname}`}
                                  >
                                    <DownloadIcon />
                                  </StyledButton>
                                )}
                              </StyledTableCell>
                            </StyledTableRow>
                          ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <Typography sx={{ p: 2, textAlign: 'center' }}>
                      No history found.
                    </Typography>
                  )}
                  <TablePagination
                    component="div"
                    count={filteredHistory.length}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPage={rowsPerPage}
                    rowsPerPageOptions={[5, 10, 25]}
                  />
                </StyledTableContainer>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

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