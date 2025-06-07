import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import UploadIcon from '@mui/icons-material/Upload';
import { CForm, CFormLabel, CFormInput, CCol } from '@coreui/react';
import { getApprovedReports, downloadFile, uploadLetter } from '../file/upload_download';
import { useAuth } from '../views/pages/AuthProvider';

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
    const fetchReports = async () => {
      setLoading(true);
      try {
        const data = await getApprovedReports();
        console.log('Fetched approved reports:', JSON.stringify(data, null, 2));
        setReports(data);
        if (data.length === 0) {
          setError('No approved reports available.');
        }
      } catch (err) {
        setError(`Failed to load approved reports: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const handleDownload = async (id, filename, type = 'supporting') => {
    try {
      console.log(`Downloading file: id=${id}, type=${type}, filename=${filename}`);
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
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const errorMessage =
        err.response?.status === 404
          ? `${type === 'letter' ? 'Letter' : 'Approver attachment'} not found`
          : `Failed to download: ${err.message || 'Unknown error'}`;
      setError(errorMessage);
      console.error('Download error:', err);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDetails = (report) => {
    console.log('Selected report:', JSON.stringify(report, null, 2));
    setSelectedReport(report);
    setShowDetailsModal(true);
  };

  const handleLetterUpload = (report) => {
    setSelectedReport(report);
    setLetterFile(null);
    setModalError('');
    setShowLetterUploadModal(true);
  };

  const handleLetterSubmit = async () => {
    if (!letterFile) {
      setModalError('Please select a file');
      setTimeout(() => setModalError(''), 3000);
      return;
    }
    try {
      await uploadLetter(selectedReport.id, letterFile);
      setSuccess('Letter uploaded successfully');
      setShowLetterUploadModal(false);
      setLetterFile(null);
      const data = await getApprovedReports();
      setReports(data);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setModalError(`Failed to upload letter: ${err.message || 'Unknown error'}`);
      setTimeout(() => setModalError(''), 3000);
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

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 4 }, maxWidth: '1200px', mx: 'auto', mt: 4 }}>
      <Typography
        variant="h4"
        component="h2"
        gutterBottom
        sx={{ fontWeight: 'bold', color: '#1976d2', textAlign: { xs: 'center', md: 'left' } }}
      >
        Approved Reports
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
            maxWidth: { xs: '95%', sm: '80%', md: '600px' },
            mx: 'auto',
          }}
          action={
            <IconButton
              color="inherit"
              size="small"
              onClick={() => {
                setError('');
                setLoading(true);
                const fetchReports = async () => {
                  try {
                    const data = await getApprovedReports();
                    setReports(data);
                    if (data.length === 0) {
                      setError('No approved reports available.');
                    }
                  } catch (err) {
                    setError(`Failed to load approved reports: ${err.message || 'Unknown error'}`);
                  } finally {
                    setLoading(false);
                  }
                };
                fetchReports();
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
            maxWidth: { xs: '95%', sm: '80%', md: '600px' },
            mx: 'auto',
          }}
        >
          {success}
        </Alert>
      )}
      <Typography
        variant="h5"
        component="h3"
        gutterBottom
        sx={{ fontWeight: 'medium', color: '#333', mt: 3, textAlign: { xs: 'center', md: 'left' } }}
      >
        Reports
      </Typography>
      {!loading && reports.length === 0 && !error && (
        <Alert
          severity="info"
          sx={{
            mb: 2,
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            maxWidth: { xs: '95%', sm: '80%', md: '600px' },
            mx: 'auto',
          }}
        >
          No approved reports available.
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
                    fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
                    padding: { xs: '6px', sm: '10px', md: '12px' },
                    borderBottom: '1px solid #e0e0e0',
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
                        fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
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
                        fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
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
                        fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
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
                        fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
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
                        fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
                      }}
                    >
                      Auditor
                    </TableCell>
                    <TableCell
                      sx={{
                        bgcolor: '#1976d2',
                        color: '#fff',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
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
                        fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
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
                        fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
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
                        <TableCell>{report.orgname || 'N/A'}</TableCell>
                        <TableCell>{report.fiscalYear || 'N/A'}</TableCell>
                        <TableCell>{report.reportype || 'N/A'}</TableCell>
                        <TableCell>{report.submittedByAuditorUsername || 'N/A'}</TableCell>
                        <TableCell>{report.responseNeeded || 'N/A'}</TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: 'inline-block',
                              px: 1.5,
                              py: 0.5,
                              borderRadius: '12px',
                              bgcolor:
                                report.reportstatus === 'Approved'
                                  ? '#e8f5e9'
                                  : '#fff3e0',
                              color:
                                report.reportstatus === 'Approved'
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
                          <Box sx={{ display: 'flex', flexDirection: 'row-reverse', gap: 1.5 }}>
                            <Tooltip title="View Details">
                              <IconButton
                                color="success"
                                onClick={() => handleDetails(report)}
                                aria-label="View report details"
                                sx={{
                                  '&:hover': {
                                    bgcolor: '#e8f5e9',
                                    transform: 'scale(1.15)',
                                    transition: 'all 0.2s',
                                  },
                                }}
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
                                      ? handleDownload(
                                          report.id,
                                          report.supportingDocname,
                                          'supporting'
                                        )
                                      : handleDownload(
                                          report.id,
                                          report.letterDocname,
                                          'letter'
                                        )
                                  }
                                  aria-label="Download document"
                                  sx={{
                                    '&:hover': {
                                      bgcolor: '#e3f2fd',
                                      transform: 'scale(1.15)',
                                      transition: 'all 0.2s',
                                    },
                                  }}
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
                                  sx={{
                                    '&:hover': {
                                      bgcolor: '#f3e5f5',
                                      transform: 'scale(1.15)',
                                      transition: 'all 0.2s',
                                    },
                                  }}
                                >
                                  <UploadIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
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
              No reports found.
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
                fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
                padding: { xs: '6px', sm: '12px', md: '16px' },
              },
            }}
          />
        </Paper>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedReport && (
        <Dialog
          open={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          TransitionComponent={Fade}
          TransitionProps={{ timeout: 800 }}
          maxWidth="md"
          fullWidth
          sx={{
            '& .MuiDialog-paper': {
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            },
          }}
        >
          <DialogTitle sx={{ bgcolor: '#1976d2', color: '#fff', fontWeight: 'bold' }}>
            Report Details
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <CForm className="row g-3">
              <CCol md={6}>
                <CFormLabel>Date</CFormLabel>
                <CFormInput
                  value={
                    selectedReport.createdDate
                      ? new Date(selectedReport.createdDate).toLocaleDateString()
                      : 'N/A'
                  }
                  readOnly
                  style={{ borderRadius: '8px', padding: '8px' }}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Status</CFormLabel>
                <CFormInput
                  value={selectedReport.reportstatus || 'N/A'}
                  readOnly
                  style={{ borderRadius: '8px', padding: '8px' }}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Organization</CFormLabel>
                <CFormInput
                  value={selectedReport.orgname || 'N/A'}
                  readOnly
                  style={{ borderRadius: '8px', padding: '8px' }}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Budget Year</CFormLabel>
                <CFormInput
                  value={selectedReport.fiscalYear || 'N/A'}
                  readOnly
                  style={{ borderRadius: '8px', padding: '8px' }}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Report Type</CFormLabel>
                <CFormInput
                  value={selectedReport.reportype || 'N/A'}
                  readOnly
                  style={{ borderRadius: '8px', padding: '8px' }}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Auditor</CFormLabel>
                <CFormInput
                  value={selectedReport.submittedByAuditorUsername || 'N/A'}
                  readOnly
                  style={{ borderRadius: '8px', padding: '8px' }}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Response Needed</CFormLabel>
                <CFormInput
                  value={selectedReport.responseNeeded || 'N/A'}
                  readOnly
                  style={{ borderRadius: '8px', padding: '8px' }}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Approver</CFormLabel>
                <CFormInput
                  value={selectedReport.lastModifiedBy || 'N/A'}
                  readOnly
                  style={{ borderRadius: '8px', padding: '8px' }}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Created By</CFormLabel>
                <CFormInput
                  value={selectedReport.createdBy || 'N/A'}
                  readOnly
                  style={{ borderRadius: '8px', padding: '8px' }}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Archiver</CFormLabel>
                <CFormInput
                  value={selectedReport.assignedByUsername || 'N/A'}
                  readOnly
                  style={{ borderRadius: '8px', padding: '8px' }}
                />
              </CCol>
              <CCol xs={6}>
                <CFormLabel>Documents</CFormLabel>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  {selectedReport.id && selectedReport.supportingDocumentPath ? (
                    <Tooltip title="Download Attachment">
                      <IconButton
                        color="primary"
                        onClick={() =>
                          handleDownload(
                            selectedReport.id,
                            selectedReport.supportingDocname,
                            'supporting'
                          )
                        }
                        aria-label="Download attachment"
                        sx={{
                          '&:hover': {
                            bgcolor: '#e3f2fd',
                            transform: 'scale(1.15)',
                            transition: 'all 0.2s',
                          },
                        }}
                      >
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No attachment available
                    </Typography>
                  )}
                </Box>
              </CCol>
              <CCol xs={6}>
                <CFormLabel>Letter</CFormLabel>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  {isArchiver && !selectedReport.letterDocname && (
                    <Tooltip title="Send Letter">
                      <IconButton
                        color="secondary"
                        onClick={() => handleLetterUpload(selectedReport)}
                        aria-label="Send letter"
                        sx={{
                          '&:hover': {
                            bgcolor: '#f3e5f5',
                            transform: 'scale(1.15)',
                            transition: 'all 0.2s',
                          },
                        }}
                      >
                        <UploadIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  {selectedReport.letterDocname ? (
                    <Tooltip title="Download Letter">
                      <IconButton
                        color="info"
                        onClick={() =>
                          handleDownload(
                            selectedReport.id,
                            selectedReport.letterDocname,
                            'letter'
                          )
                        }
                        aria-label="Download letter"
                        sx={{
                          '&:hover': {
                            bgcolor: '#e0f7fa',
                            transform: 'scale(1.15)',
                            transition: 'all 0.2s',
                          },
                        }}
                      >
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No letter uploaded
                    </Typography>
                  )}
                </Box>
              </CCol>
            </CForm>
          </DialogContent>
          <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
            <Button
              onClick={() => setShowDetailsModal(false)}
              color="primary"
              sx={{ borderRadius: '8px', px: 3 }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Letter Upload Modal */}
      {showLetterUploadModal && (
        <Dialog
          open={showLetterUploadModal}
          onClose={() => setShowLetterUploadModal(false)}
          TransitionComponent={Fade}
          TransitionProps={{ timeout: 800 }}
          maxWidth="md"
          fullWidth
          sx={{
            '& .MuiDialog-paper': {
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            },
          }}
        >
          <DialogTitle sx={{ bgcolor: '#1976d2', color: '#fff', fontWeight: 'bold' }}>
            Upload Letter
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            {modalError && (
              <Alert
                severity="error"
                sx={{ mb: 2, borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
              >
                {modalError}
              </Alert>
            )}
            <CForm className="row g-3">
              <CCol xs={12}>
                <CFormLabel htmlFor="letterFile">Choose Letter File</CFormLabel>
                <CFormInput
                  type="file"
                  id="letterFile"
                  onChange={(e) => setLetterFile(e.target.files[0])}
                  style={{ borderRadius: '8px', padding: '8px' }}
                />
              </CCol>
            </CForm>
          </DialogContent>
          <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
            <Button
              onClick={() => setShowLetterUploadModal(false)}
              color="primary"
              sx={{ borderRadius: '8px', px: 3 }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleLetterSubmit}
              color="primary"
              variant="contained"
              sx={{ borderRadius: '8px', px: 3 }}
            >
              Submit
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default ApprovedReports;