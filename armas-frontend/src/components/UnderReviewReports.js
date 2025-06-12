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
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { getUnderReviewReports, downloadFile, approveReport, rejectReport } from '../file/upload_download';
import { useAuth } from '../views/pages/AuthProvider';

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

export default function UnderReviewReports() {
  const { roles } = useAuth();
  const isApprover = roles.includes('APPROVER');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filterText, setFilterText] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionDocument, setRejectionDocument] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await getUnderReviewReports();
      setReports(Array.isArray(data) ? data : []);
      setLoading(false);
      if (data.length === 0) {
        setError('No reports under review.');
      }
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

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDownload = async (id, docname, type) => {
    try {
      const response = await downloadFile(id, type);
      const blob = new Blob([response.data]);
      if (blob.size === 0) {
        throw new Error('Empty file received');
      }
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const filename = type === 'original' ? (docname || 'file') : (docname || 'file');
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setSnackbarMessage(`Successfully downloaded ${type} document`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      const msg = error.response?.data || `Error downloading ${type} file`;
      setSnackbarMessage(msg);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveReport(id);
      setSnackbarMessage('Report approved successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      await fetchReports();
    } catch (error) {
      const msg = error.response?.data || 'Error approving report';
      setSnackbarMessage(msg);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleReject = (report) => {
    setSelectedReport(report);
    setRejectionReason('');
    setRejectionDocument(null);
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason) {
      setSnackbarMessage('Please provide a reason for rejection');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    try {
      const file = document.getElementById('rejectionDocument')?.files[0];
      await rejectReport(selectedReport.id, rejectionReason, file);
      setSnackbarMessage('Report rejected successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setShowRejectModal(false);
      setRejectionReason('');
      setRejectionDocument(null);
      await fetchReports();
    } catch (error) {
      const msg = error.response?.data || 'Error rejecting report';
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

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleCloseRejectModal = () => {
    setShowRejectModal(false);
    setRejectionReason('');
    setRejectionDocument(null);
  };

  const filteredReports = reports.filter(
    (report) =>
      (report.id || '').toString().toLowerCase().includes(filterText.toLowerCase()) ||
      (report.organization?.orgname || '').toLowerCase().includes(filterText.toLowerCase()) ||
      (report.transactiondocument?.reportype || '').toLowerCase().includes(filterText.toLowerCase()) ||
      (report.fiscal_year || report.fiscalYear || '').toString().toLowerCase().includes(filterText.toLowerCase()) ||
      (report.remarks || '').toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <Box sx={{ padding: { xs: 2, md: 4 } }}>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4" style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
            <CCardHeader>
              <Typography variant="h6" fontWeight="bold">
                Under Review Reports
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
                    <TextField
                      label="Search Reports"
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
                  {filteredReports.length > 0 ? (
                    <Table stickyHeader>
                      <TableHead>
                        <StyledTableRow>
                          <StyledTableCell>Date</StyledTableCell>
                          <StyledTableCell>Organization</StyledTableCell>
                          <StyledTableCell>Budget Year</StyledTableCell>
                          <StyledTableCell>Report Type</StyledTableCell>
                          <StyledTableCell>Audit Findings</StyledTableCell>
                          <StyledTableCell align="right">Actions</StyledTableCell>
                        </StyledTableRow>
                      </TableHead>
                      <TableBody>
                        {filteredReports
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((report) => (
                            <StyledTableRow key={report.id}>
                              <StyledTableCell>
                                {report.createdDate
                                  ? new Date(report.createdDate).toLocaleDateString()
                                  : 'N/A'}
                              </StyledTableCell>
                              <StyledTableCell>{report.organization?.orgname || 'N/A'}</StyledTableCell>
                              <StyledTableCell>{report.fiscal_year || report.fiscalYear || 'N/A'}</StyledTableCell>
                              <StyledTableCell>{report.transactiondocument?.reportype || 'N/A'}</StyledTableCell>
                              <StyledTableCell>{report.remarks || 'N/A'}</StyledTableCell>
                              <StyledTableCell align="right">
                                <StyledButton
                                  variant="contained"
                                  color="primary"
                                  size="small"
                                  startIcon={<DownloadIcon />}
                                  onClick={() => handleDownload(report.id, report.docname, 'original')}
                                  sx={{ mr: 1 }}
                                >
                                  Report
                                </StyledButton>
                                {report.supportingDocumentPath && (
                                  <StyledButton
                                    variant="contained"
                                    color="secondary"
                                    size="small"
                                    startIcon={<DownloadIcon />}
                                    onClick={() => handleDownload(report.id, report.supportingDocname, 'supporting')}
                                    sx={{ mr: 1 }}
                                  >
                                    Findings
                                  </StyledButton>
                                )}
                                {isApprover && (
                                  <>
                                    <IconButton
                                      color="success"
                                      onClick={() => handleApprove(report.id)}
                                      size="small"
                                      sx={{ mr: 1 }}
                                    >
                                      <CheckCircleIcon />
                                    </IconButton>
                                    <IconButton
                                      color="error"
                                      onClick={() => handleReject(report)}
                                      size="small"
                                    >
                                      <CancelIcon />
                                    </IconButton>
                                  </>
                                )}
                              </StyledTableCell>
                            </StyledTableRow>
                          ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <Typography sx={{ p: 2 }}>No reports found.</Typography>
                  )}
                  <TablePagination
                    component="div"
                    count={filteredReports.length}
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

      {/* Reject Modal */}
      <StyledDialog
        maxWidth="md"
        fullWidth
        open={showRejectModal}
        onClose={handleCloseRejectModal}
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 800 }}
      >
        <DialogTitle>Reject Report</DialogTitle>
        <DialogContent>
          <CForm className="row g-3">
            <CCol xs={12}>
              <CFormLabel htmlFor="rejectionReason">Reason for Rejection</CFormLabel>
              <CFormInput
                component="textarea"
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for rejection"
                rows={4}
              />
            </CCol>
            <CCol xs={12}>
              <CFormLabel htmlFor="rejectionDocument">Attach Rejection Document (Optional)</CFormLabel>
              <input
                type="file"
                className="form-control"
                id="rejectionDocument"
                onChange={(e) => setRejectionDocument(e.target.files[0])}
                style={{ borderRadius: '8px' }}
              />
            </CCol>
          </CForm>
        </DialogContent>
        <DialogActions>
          <StyledButton onClick={handleCloseRejectModal} color="primary">
            Cancel
          </StyledButton>
          <StyledButton onClick={handleRejectSubmit} color="primary" variant="contained">
            Reject
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