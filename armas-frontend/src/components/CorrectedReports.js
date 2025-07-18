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
  Tooltip,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { getCorrectedReports, downloadFile, approveReport, rejectReport } from '../file/upload_download';
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

export default function CorrectedReports() {
  const { roles } = useAuth();
  const isApprover = roles.includes('APPROVER');
  const isSeniorAuditor = roles.includes('SENIOR_AUDITOR');
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
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reasonOfRejection, setReasonOfRejection] = useState('');
  const [rejectionDocument, setRejectionDocument] = useState(null);
  const [approvalDocument, setApprovalDocument] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await getCorrectedReports();
      setReports(Array.isArray(data) ? data : []);
      setLoading(false);
      if (data.length === 0) {
        setError('No corrected reports available.');
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

  const handleDownload = async (id, docname, supportingDocname, type) => {
    try {
      const response = await downloadFile(id, type);
      const blob = new Blob([response.data]);
      if (blob.size === 0) {
        throw new Error('Empty file received');
      }
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const filename = type === 'original' ? (docname || 'file') : (supportingDocname || 'file');
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

  const handleApprove = (report) => {
    setSelectedReport(report);
    setApprovalDocument(null);
    setShowApprovalModal(true);
  };

  const handleApproveSubmit = async () => {
    try {
      const approvalFile = document.getElementById('approvalDocument')?.files[0];
      await approveReport(selectedReport.id, approvalFile);
      setSnackbarMessage('Report approved successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setShowApprovalModal(false);
      setApprovalDocument(null);
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
    setReasonOfRejection('');
    setRejectionDocument(null);
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!reasonOfRejection) {
      setSnackbarMessage('Please provide a reason for rejection');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    try {
      const rejectionFile = document.getElementById('rejectionDocument')?.files[0];
      await rejectReport(selectedReport.id, reasonOfRejection, rejectionFile);
      setSnackbarMessage('Report rejected successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setShowRejectModal(false);
      setReasonOfRejection('');
      setRejectionDocument(null);
      await fetchReports();
    } catch (error) {
      const msg = error.response?.data || 'Error rejecting report';
      setSnackbarMessage(msg);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleOpenDetails = (report) => {
    setSelectedReport(report);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
  };

  const handleCloseApprovalModal = () => {
    setShowApprovalModal(false);
    setApprovalDocument(null);
  };

  const handleCloseRejectModal = () => {
    setShowRejectModal(false);
    setReasonOfRejection('');
    setRejectionDocument(null);
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

  const filteredReports = reports.filter(
    (report) =>
      (report.organization?.orgname || '').toLowerCase().includes(filterText.toLowerCase()) ||
      (report.transactiondocument?.reportype || '').toLowerCase().includes(filterText.toLowerCase()) ||
      (report.fiscal_year || '').toString().toLowerCase().includes(filterText.toLowerCase()) ||
      (report.createdBy || '').toLowerCase().includes(filterText.toLowerCase()) ||
      (report.submittedByAuditorUsername || '').toLowerCase().includes(filterText.toLowerCase()) ||
      (report.responseNeeded || '').toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <Box sx={{ padding: { xs: 2, md: 4 } }}>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4" style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
            <CCardHeader>
              <Typography variant="h6" fontWeight="bold">
                Corrected Reports
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
                          <StyledTableCell>Created By</StyledTableCell>
                          <StyledTableCell>Response</StyledTableCell>
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
                              <StyledTableCell>{report.fiscal_year || 'N/A'}</StyledTableCell>
                              <StyledTableCell>{report.transactiondocument?.reportype || 'N/A'}</StyledTableCell>
                              <StyledTableCell>{report.createdBy || 'N/A'}</StyledTableCell>
                              <StyledTableCell>{report.responseNeeded || 'N/A'}</StyledTableCell>
                              <StyledTableCell align="right">
  <Tooltip title="View Details" arrow>
    <IconButton
      color="success"
      onClick={() => handleOpenDetails(report)}
      size="small"
      sx={{ mr: 1 }}
    >
      <VisibilityIcon />
    </IconButton>
  </Tooltip>

  {isApprover && (
    <>
      <Tooltip title="Approve Report" arrow>
        <IconButton
          color="success"
          onClick={() => handleApprove(report)}
          size="small"
          sx={{ mr: 1 }}
        >
          <CheckCircleIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Reject Report" arrow>
        <IconButton
          color="error"
          onClick={() => handleReject(report)}
          size="small"
        >
          <CancelIcon />
        </IconButton>
      </Tooltip>
    </>
  )}

  {isSeniorAuditor && !isApprover && (
    <Tooltip title="Pending Approval" arrow>
      <Typography variant="body2" color="textSecondary">
        Awaiting Approval
      </Typography>
    </Tooltip>
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

      {/* Approval Modal */}
      <StyledDialog
        maxWidth="md"
        fullWidth
        open={showApprovalModal}
        onClose={handleCloseApprovalModal}
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 800 }}
      >
        <DialogTitle>Approve Report</DialogTitle>
        <DialogContent>
          <CForm className="row g-3">
            <CCol xs={12}>
              <CFormLabel htmlFor="approvalDocument">Attach Approval Document</CFormLabel>
              <input
                type="file"
                className="form-control"
                id="approvalDocument"
                onChange={(e) => setApprovalDocument(e.target.files[0])}
                style={{ borderRadius: '8px' }}
              />
            </CCol>
          </CForm>
        </DialogContent>
        <DialogActions>
          <StyledButton onClick={handleCloseApprovalModal} color="primary">
            Cancel
          </StyledButton>
          <StyledButton onClick={handleApproveSubmit} color="primary" variant="contained">
            Submit
          </StyledButton>
        </DialogActions>
      </StyledDialog>

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
              <CFormLabel htmlFor="reasonOfRejection">Reason for Rejection</CFormLabel>
              <CFormInput
                id="reasonOfRejection"
                value={reasonOfRejection}
                onChange={(e) => setReasonOfRejection(e.target.value)}
                placeholder="Enter reason for rejection"
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

      {/* Details Modal */}
      <StyledDialog
        maxWidth="md"
        fullWidth
        open={showDetailsModal}
        onClose={handleCloseDetails}
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 800 }}
      >
        <DialogTitle>Report Details</DialogTitle>
        <DialogContent>
          <CForm className="row g-3">
            <CCol md={6}>
              <CFormLabel>Date</CFormLabel>
              <CFormInput
                value={selectedReport?.createdDate ? new Date(selectedReport.createdDate).toLocaleDateString() : 'N/A'}
                readOnly
              />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Organization</CFormLabel>
              <CFormInput
                value={selectedReport?.organization?.orgname || 'N/A'}
                readOnly
              />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Budget Year</CFormLabel>
              <CFormInput
                value={selectedReport?.fiscal_year || 'N/A'}
                readOnly
              />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Report Type</CFormLabel>
              <CFormInput
                value={selectedReport?.transactiondocument?.reportype || 'N/A'}
                readOnly
              />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Created By</CFormLabel>
              <CFormInput
                value={selectedReport?.createdBy || 'N/A'}
                readOnly
              />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Auditor</CFormLabel>
              <CFormInput
                value={selectedReport?.submittedByAuditorUsername || 'N/A'}
                readOnly
              />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Response Needed</CFormLabel>
              <CFormInput
                value={selectedReport?.responseNeeded || 'N/A'}
                readOnly
              />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Audit Findings</CFormLabel>
              <CFormInput
                value={selectedReport?.remarks || 'No remarks available'}
                readOnly
              />
            </CCol>
            <CCol xs={12}>
              <CFormLabel>Documents</CFormLabel>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <StyledButton
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={() => handleDownload(selectedReport.id, selectedReport.docname, selectedReport.supportingDocname, 'original')}
                >
                  Report
                </StyledButton>
                {selectedReport?.supportingDocumentPath && (
                  <StyledButton
                    variant="contained"
                    color="secondary"
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleDownload(selectedReport.id, selectedReport.supportingDocname, selectedReport.supportingDocname, 'supporting')}
                  >
                    Findings
                  </StyledButton>
                )}
              </Box>
            </CCol>
          </CForm>
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
          sx={{ minWidth: '250px', boxShadow: '4px 4px 6px rgba(0, 0, 0, 0.1)', borderRadius: '8px' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}