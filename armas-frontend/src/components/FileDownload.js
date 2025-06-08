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
  CircularProgress,
  Button,
  Tooltip,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { CForm, CFormLabel, CFormInput, CCol } from '@coreui/react';
import { getSentReports, downloadFile, getUsersByRole, assignAuditor } from '../file/upload_download';

const FileDownload = () => {
  const [submittedReports, setSubmittedReports] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [auditors, setAuditors] = useState([]);
  const [selectedAuditor, setSelectedAuditor] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filterText, setFilterText] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await getSentReports();
      console.log('Raw response data:', JSON.stringify(data, null, 2));
      const submitted = data.filter((report) => report.reportstatus === 'Submitted');
      setSubmittedReports(submitted);
      if (submitted.length === 0) {
        setError('No submitted reports available.');
      } else {
        setError('');
      }
    } catch (err) {
      setError('Failed to load reports: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
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
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      setSuccess(`Successfully downloaded ${type} document`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to download file: ' + (err.response?.data?.message || err.message));
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleAssignAuditor = async (report) => {
    setSelectedReport(report);
    try {
      const auditorsData = await getUsersByRole('SENIOR_AUDITOR');
      setAuditors(auditorsData);
      setShowAssignModal(true);
    } catch (err) {
      setError('Failed to load auditors: ' + (err.response?.data?.message || err.message));
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleAssignSubmit = async () => {
    if (!selectedAuditor) {
      setError('Please select an auditor');
      setTimeout(() => setError(''), 3000);
      return;
    }
    try {
      await assignAuditor(selectedReport.id, selectedAuditor);
      setSuccess('Auditor assigned successfully');
      setShowAssignModal(false);
      setSelectedAuditor('');
      fetchReports();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to assign auditor: ' + (err.response?.data?.message || err.message));
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDetails = (report) => {
    setSelectedReport(report);
    setShowDetailsModal(true);
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

  const filteredReports = submittedReports.filter((report) =>
    report
      ? (report.orgname || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (report.reportype || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (report.fiscal_year || '').toString().toLowerCase().includes(filterText.toLowerCase()) ||
        (report.user || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (report.reportstatus || '').toLowerCase().includes(filterText.toLowerCase())
      : false
  );

  return (
    <Box sx={{ p: { xs: 1, md: 2 }, maxWidth: '1200px', mx: 'auto', mt: 1 }}>
      <Typography
        variant="h4"
        component="h2"
        sx={{
          fontWeight: 'bold',
          color: '#1976d2',
          textAlign: { xs: 'center', md: 'left' },
          mb: 1,
        }}
      >
        Archiver View
      </Typography>
      {loading && (
        <Box display="flex" justifyContent="center" my={2}>
          <CircularProgress />
        </Box>
      )}
      {error && !loading && (
        <Alert
          severity="error"
          sx={{
            mb: 1,
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
            mb: 1,
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            maxWidth: { xs: '100%', md: '600px' },
            mx: 'auto',
          }}
        >
          {success}
        </Alert>
      )}
      {!loading && submittedReports.length === 0 && !error && (
        <Alert
          severity="info"
          sx={{
            mb: 1,
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            maxWidth: { xs: '100%', md: '600px' },
            mx: 'auto',
          }}
        >
          No submitted reports available.
        </Alert>
      )}
      {!loading && submittedReports.length > 0 && (
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
              p: 1,
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
                      Submitted Date
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
                      Submitted By
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
                      <TableRow key={report.id}>
                        <TableCell>
                          {report.createdDate
                            ? new Date(report.createdDate).toLocaleDateString()
                            : 'N/A'}
                        </TableCell>
                        <TableCell>{report.orgname || 'N/A'}</TableCell>
                        <TableCell>{report.fiscal_year || 'N/A'}</TableCell>
                        <TableCell>{report.reportype || 'N/A'}</TableCell>
                        <TableCell>{report.user || 'N/A'}</TableCell>
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
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="View Details">
                              <IconButton
                                color="success"
                                onClick={() => handleDetails(report)}
                                aria-label="View report details"
                                sx={{
                                  '&:hover': {
                                    bgcolor: '#e8f5e9',
                                    transform: 'scale(1.1)',
                                    transition: 'all 0.2s',
                                  },
                                }}
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Assign Auditor">
                              <IconButton
                                color="secondary"
                                onClick={() => handleAssignAuditor(report)}
                                aria-label="Assign auditor"
                                sx={{
                                  '&:hover': {
                                    bgcolor: '#f3e5f5',
                                    transform: 'scale(1.1)',
                                    transition: 'all 0.2s',
                                  },
                                }}
                              >
                                <PersonAddIcon />
                              </IconButton>
                            </Tooltip>
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
                m: 1,
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
                fontSize: { xs: '0.85rem', sm: '0.95rem' },
                padding: { xs: '8px', sm: '16px' },
              },
            }}
          />
        </Paper>
      )}
      {/* Assign Auditor Modal */}
      {showAssignModal && (
        <Dialog
          open={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          TransitionComponent={Fade}
          TransitionProps={{ timeout: 800 }}
          maxWidth="sm"
          fullWidth
          sx={{
            '& .MuiDialog-paper': {
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            },
          }}
        >
          <DialogTitle sx={{ bgcolor: '#1976d2', color: '#fff', fontWeight: 'bold' }}>
            Assign Auditor
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <CForm className="row g-3">
              <CCol xs={12}>
                <CFormLabel htmlFor="auditor">Select Auditor</CFormLabel>
                <select
                  className="form-control"
                  id="auditor"
                  value={selectedAuditor}
                  onChange={(e) => setSelectedAuditor(e.target.value)}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid #ccc',
                  }}
                >
                  <option value="">Select Auditor</option>
                  {auditors.map((auditor) => (
                    <option key={auditor.id} value={auditor.username}>
                      {auditor.username} ({auditor.firstName} {auditor.lastName})
                    </option>
                  ))}
                </select>
              </CCol>
            </CForm>
          </DialogContent>
          <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
            <Button
              onClick={() => setShowAssignModal(false)}
              color="primary"
              sx={{ borderRadius: '8px' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignSubmit}
              color="primary"
              variant="contained"
              sx={{ borderRadius: '8px' }}
            >
              Assign
            </Button>
          </DialogActions>
        </Dialog>
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
                <CFormLabel>Submitted Date</CFormLabel>
                <CFormInput
                  value={
                    selectedReport.createdDate
                      ? new Date(selectedReport.createdDate).toLocaleDateString()
                      : 'N/A'
                  }
                  readOnly
                  style={{ borderRadius: '8px' }}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Organization Name</CFormLabel>
                <CFormInput
                  value={selectedReport.orgname || 'N/A'}
                  readOnly
                  style={{ borderRadius: '8px' }}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Budget Year</CFormLabel>
                <CFormInput
                  value={selectedReport.fiscal_year || 'N/A'}
                  readOnly
                  style={{ borderRadius: '8px' }}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Report Type</CFormLabel>
                <CFormInput
                  value={selectedReport.reportype || 'N/A'}
                  readOnly
                  style={{ borderRadius: '8px' }}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Submitted By</CFormLabel>
                <CFormInput
                  value={selectedReport.user || 'N/A'}
                  readOnly
                  style={{ borderRadius: '8px' }}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Status</CFormLabel>
                <CFormInput
                  value={selectedReport.reportstatus || 'N/A'}
                  readOnly
                  style={{ borderRadius: '8px' }}
                />
              </CCol>
              <CCol xs={12}>
                <CFormLabel>Document</CFormLabel>
                <div>
                  {selectedReport.docname && (
                    <IconButton
                      color="primary"
                      onClick={() =>
                        handleDownload(selectedReport.id, selectedReport.docname)
                      }
                      aria-label={`Download ${selectedReport.docname}`}
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
                </div>
              </CCol>
            </CForm>
          </DialogContent>
          <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
            <Button
              onClick={() => setShowDetailsModal(false)}
              color="primary"
              sx={{ borderRadius: '8px' }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default FileDownload;