import React, { useState, useEffect, useCallback } from 'react';
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fade,
  Alert,
  TextField,
  TablePagination,
  TableContainer,
  Box,
  Paper,
  Typography,
  Button,
  Tooltip,
  CircularProgress,
  InputAdornment,
  Snackbar, // Added missing import
} from '@mui/material';
import {
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Upload as UploadIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { getApprovedReports, downloadFile, uploadLetter } from '../file/upload_download';
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

const ApprovedReports = () => {
  const { roles } = useAuth();
  const isArchiver = roles.includes('ARCHIVER');
  const [reports, setReports] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showLetterUploadModal, setShowLetterUploadModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [letterFile, setLetterFile] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filterText, setFilterText] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    console.log('ApprovedReports: Component mounted');
    const fetchReports = async () => {
      setLoading(true);
      try {
        const data = await getApprovedReports();
        console.log('ApprovedReports: Fetched approved reports:', data);
        const validReports = Array.isArray(data)
          ? data.filter(report => report && report.id)
          : [];
        setReports(validReports);
        if (validReports.length === 0) {
          setError('No approved reports available.');
        }
      } catch (err) {
        const errorMessage = `Failed to load approved reports: ${err.message || 'Unknown error'}`;
        console.error('ApprovedReports: Fetch error:', errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const handleDownload = useCallback(async (id, filename, type = 'supporting') => {
    try {
      console.log(`ApprovedReports: Downloading file: id=${id}, type=${type}, filename=${filename}`);
      const response = await downloadFile(id, type);
      const blob = new Blob([response.data]);
      if (blob.size === 0) {
        throw new Error('Empty file received');
      }
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename || 'file');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setSuccess(`Successfully downloaded ${type === 'letter' ? 'letter' : 'approver attachment'}`);
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      const errorMessage =
        err.response?.status === 404
          ? `${type === 'letter' ? 'Letter' : 'Approver attachment'} not found`
          : `Failed to download: ${err.message || 'Unknown error'}`;
      console.error('ApprovedReports: Download error:', err);
      setError(errorMessage);
      setTimeout(() => setError(''), 4000);
    }
  }, []);

  const handleDetails = useCallback((report) => {
    console.log('ApprovedReports: handleDetails called with report:', report);
    setSelectedReport(report);
    setShowDetailsModal(true);
    console.log('ApprovedReports: showDetailsModal set to true');
  }, []);

  const handleLetterUpload = useCallback((report) => {
    console.log('ApprovedReports: handleLetterUpload called with report:', report);
    setSelectedReport(report);
    setLetterFile(null);
    setModalError('');
    setShowLetterUploadModal(true);
    console.log('ApprovedReports: showLetterUploadModal set to true');
  }, []);

  const handleLetterSubmit = async () => {
    if (!letterFile) {
      setModalError('Please select a file');
      setTimeout(() => setModalError(''), 4000);
      return;
    }
    try {
      console.log('ApprovedReports: Uploading letter for report:', selectedReport.id);
      await uploadLetter(selectedReport.id, letterFile);
      setSuccess('Letter uploaded successfully');
      setShowLetterUploadModal(false);
      setLetterFile(null);
      const data = await getApprovedReports();
      const validReports = Array.isArray(data)
        ? data.filter(report => report && report.id)
        : [];
      setReports(validReports);
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      const errorMessage = `Failed to upload letter: ${err.message || 'Unknown error'}`;
      console.error('ApprovedReports: Upload error:', errorMessage);
      setModalError(errorMessage);
      setTimeout(() => setModalError(''), 4000);
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
        (report.submittedByAuditorUsername || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (report.responseNeeded || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (report.reportstatus || '').toLowerCase().includes(filterText.toLowerCase())
      : false
  );

  console.log('ApprovedReports: Rendering with showDetailsModal:', showDetailsModal, 'showLetterUploadModal:', showLetterUploadModal);

  return (
    <Box sx={{ padding: { xs: 2, md: 4 } }}>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4" style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
            <CCardHeader>
              <Typography variant="h6" fontWeight="bold">
                Approved Reports
              </Typography>
            </CCardHeader>
            <CCardBody>
              {loading ? (
                <Box display="flex" justifyContent="center" my={2}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Typography color="error">{error}</Typography>
              ) : (
                <StyledTableContainer component={Paper}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', p: 2 }}>
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
                          <StyledTableCell>Auditor</StyledTableCell>
                          <StyledTableCell>Response</StyledTableCell>
                          <StyledTableCell>Status</StyledTableCell>
                          <StyledTableCell align="right">Action</StyledTableCell>
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
                              <StyledTableCell>{report.orgname || 'N/A'}</StyledTableCell>
                              <StyledTableCell>{report.fiscalYear || 'N/A'}</StyledTableCell>
                              <StyledTableCell>{report.reportype || 'N/A'}</StyledTableCell>
                              <StyledTableCell>{report.submittedByAuditorUsername || 'N/A'}</StyledTableCell>
                              <StyledTableCell>{report.responseNeeded || 'N/A'}</StyledTableCell>
                              <StyledTableCell>
                                <Box
                                  sx={{
                                    display: 'inline-block',
                                    px: 1.5,
                                    py: 0.5,
                                    borderRadius: '12px',
                                    bgcolor: report.reportstatus === 'Approved' ? '#e8f5e9' : '#fff3e0',
                                    color: report.reportstatus === 'Approved' ? '#2e7d32' : '#f57c00',
                                    fontSize: '0.85rem',
                                    fontWeight: 'medium',
                                  }}
                                >
                                  {report.reportstatus || 'N/A'}
                                </Box>
                              </StyledTableCell>
                              <StyledTableCell align="right">
                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                  <Tooltip title="View Details">
                                    <IconButton
                                      color="success"
                                      onClick={() => handleDetails(report)}
                                      aria-label="View report details"
                                    >
                                      <VisibilityIcon />
                                    </IconButton>
                                  </Tooltip>
                                  {(report.supportingDocumentPath || report.letterDocname) && (
                                    <Tooltip title="Download Documents">
                                      <IconButton
                                        color="primary"
                                        onClick={() =>
                                          report.supportingDocumentPath
                                            ? handleDownload(report.id, report.supportingDocname, 'supporting')
                                            : handleDownload(report.id, report.letterDocname, 'letter')
                                        }
                                        aria-label="Download document"
                                      >
                                        <DownloadIcon />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                  {isArchiver && !report.letterDocname && (
                                    <Tooltip title="Send Letter">
                                      <IconButton
                                        color="secondary"
                                        onClick={() => handleLetterUpload(report)}
                                        aria-label="Send letter"
                                      >
                                        <UploadIcon />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                </Box>
                              </StyledTableCell>
                            </StyledTableRow>
                          ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <Typography sx={{ p: 2, textAlign: 'center' }}>
                      No reports found.
                    </Typography>
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

      {/* Details Dialog */}
      <StyledDialog
        maxWidth="md"
        fullWidth
        open={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 800 }}
        aria-labelledby="report-details-dialog"
      >
        <DialogTitle id="report-details-dialog">Report Details</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mt: 2 }}>
            <Box>
              <Typography variant="subtitle2">Date</Typography>
              <TextField
                fullWidth
                value={selectedReport?.createdDate ? new Date(selectedReport.createdDate).toLocaleDateString() : 'N/A'}
                InputProps={{ readOnly: true }}
                variant="outlined"
                size="small"
              />
            </Box>
            <Box>
              <Typography variant="subtitle2">Status</Typography>
              <TextField
                fullWidth
                value={selectedReport?.reportstatus || 'N/A'}
                InputProps={{ readOnly: true }}
                variant="outlined"
                size="small"
              />
            </Box>
            <Box>
              <Typography variant="subtitle2">Organization</Typography>
              <TextField
                fullWidth
                value={selectedReport?.orgname || 'N/A'}
                InputProps={{ readOnly: true }}
                variant="outlined"
                size="small"
              />
            </Box>
            <Box>
              <Typography variant="subtitle2">Budget Year</Typography>
              <TextField
                fullWidth
                value={selectedReport?.fiscalYear || 'N/A'}
                InputProps={{ readOnly: true }}
                variant="outlined"
                size="small"
              />
            </Box>
            <Box>
              <Typography variant="subtitle2">Report Type</Typography>
              <TextField
                fullWidth
                value={selectedReport?.reportype || 'N/A'}
                InputProps={{ readOnly: true }}
                variant="outlined"
                size="small"
              />
            </Box>
            <Box>
              <Typography variant="subtitle2">Auditor</Typography>
              <TextField
                fullWidth
                value={selectedReport?.submittedByAuditorUsername || 'N/A'}
                InputProps={{ readOnly: true }}
                variant="outlined"
                size="small"
              />
            </Box>
            <Box>
              <Typography variant="subtitle2">Response Needed</Typography>
              <TextField
                fullWidth
                value={selectedReport?.responseNeeded || 'N/A'}
                InputProps={{ readOnly: true }}
                variant="outlined"
                size="small"
              />
            </Box>
            <Box>
              <Typography variant="subtitle2">Approver</Typography>
              <TextField
                fullWidth
                value={selectedReport?.lastModifiedBy || 'N/A'}
                InputProps={{ readOnly: true }}
                variant="outlined"
                size="small"
              />
            </Box>
            <Box>
              <Typography variant="subtitle2">Created By</Typography>
              <TextField
                fullWidth
                value={selectedReport?.createdBy || 'N/A'}
                InputProps={{ readOnly: true }}
                variant="outlined"
                size="small"
              />
            </Box>
            <Box>
              <Typography variant="subtitle2">Archiver</Typography>
              <TextField
                fullWidth
                value={selectedReport?.assignedByUsername || 'N/A'}
                InputProps={{ readOnly: true }}
                variant="outlined"
                size="small"
              />
            </Box>
            <Box>
              <Typography variant="subtitle2">Documents</Typography>
              {selectedReport?.id && selectedReport?.supportingDocumentPath ? (
                <StyledButton
                  variant="outlined"
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={() => handleDownload(selectedReport.id, selectedReport.supportingDocname, 'supporting')}
                >
                  Download Attachment
                </StyledButton>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No attachment available
                </Typography>
              )}
            </Box>
            <Box>
              <Typography variant="subtitle2">Letter</Typography>
              {selectedReport?.letterDocname ? (
                <StyledButton
                  variant="outlined"
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={() => handleDownload(selectedReport.id, selectedReport.letterDocname, 'letter')}
                >
                  Download Letter
                </StyledButton>
              ) : isArchiver && !selectedReport?.letterDocname ? (
                <StyledButton
                  variant="outlined"
                  size="small"
                  startIcon={<UploadIcon />}
                  onClick={() => handleLetterUpload(selectedReport)}
                >
                  Send Letter
                </StyledButton>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No letter uploaded
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <StyledButton onClick={() => setShowDetailsModal(false)} color="primary">
            Close
          </StyledButton>
        </DialogActions>
      </StyledDialog>

      {/* Letter Upload Dialog */}
      <StyledDialog
        maxWidth="sm"
        fullWidth
        open={showLetterUploadModal}
        onClose={() => setShowLetterUploadModal(false)}
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 800 }}
        aria-labelledby="letter-upload-dialog"
      >
        <DialogTitle id="letter-upload-dialog">Upload Letter</DialogTitle>
        <DialogContent>
          {modalError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {modalError}
            </Alert>
          )}
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              type="file"
              label="Choose Letter File"
              InputLabelProps={{ shrink: true }}
              onChange={(e) => setLetterFile(e.target.files[0])}
              variant="outlined"
              size="small"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <StyledButton onClick={() => setShowLetterUploadModal(false)} color="primary">
            Cancel
          </StyledButton>
          <StyledButton
            onClick={handleLetterSubmit}
            color="primary"
            variant="contained"
            disabled={!letterFile}
          >
            Submit
          </StyledButton>
        </DialogActions>
      </StyledDialog>

      <Snackbar
        open={success || error}
        autoHideDuration={4000}
        onClose={() => {
          setSuccess('');
          setError('');
        }}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => {
            setSuccess('');
            setError('');
          }}
          severity={success ? 'success' : 'error'}
          sx={{ minWidth: '250px', boxShadow: '4px 4px 6px rgba(0, 0, 0, 0.1)', borderRadius: '8px' }}
        >
          {success || error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ApprovedReports;