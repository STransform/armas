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
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { CForm, CFormLabel, CFormInput, CCol } from '@coreui/react';
import { getMyTasks, downloadFile, submitFindings, approveReport, rejectReport, getUsersByRole } from '../file/upload_download';
import { useAuth } from '../views/pages/AuthProvider';

const AuditorTasks = () => {
  const { roles } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showFindingsModal, setShowFindingsModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [reasonOfRejection, setReasonOfRejection] = useState('');
  const [responseNeeded, setResponseNeeded] = useState('Pending');
  const [approvalDocument, setApprovalDocument] = useState(null);
  const [approvers, setApprovers] = useState([]);
  const [selectedApprover, setSelectedApprover] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filterText, setFilterText] = useState('');
  const [loading, setLoading] = useState(true);

  const isSeniorAuditor = roles.includes('SENIOR_AUDITOR');
  const isApprover = roles.includes('APPROVER');

  const fetchMyTasks = async () => {
    setLoading(true);
    try {
      const data = await getMyTasks();
      let filteredTasks;
      if (isSeniorAuditor) {
        filteredTasks = data.filter(task =>
          ['Assigned', 'Rejected', 'Under Review', 'Corrected'].includes(task.reportstatus)
        );
      } else if (isApprover) {
        filteredTasks = data.filter(task =>
          ['Under Review', 'Corrected', 'Rejected'].includes(task.reportstatus)
        );
      } else {
        filteredTasks = [];
      }
      setTasks(filteredTasks);
      if (filteredTasks.length === 0) {
        setError('No tasks available for your role.');
      }
      console.log('Filtered tasks:', JSON.stringify(filteredTasks, null, 2));
    } catch (err) {
      setError(`Failed to load tasks: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTasks();
  }, [roles]);

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
      setSuccess(`Successfully downloaded ${type} document`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(`Failed to download ${type} file: ${err.message || 'Unknown error'}`);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleSubmitFindings = async (task) => {
    setSelectedTask(task);
    setError('');
    setRemarks('');
    setResponseNeeded('Pending');
    setSelectedApprover('');
    try {
      const approversData = await getUsersByRole('APPROVER');
      setApprovers(approversData);
      setShowFindingsModal(true);
    } catch (err) {
      setError(`Failed to load approvers: ${err.message || 'Unknown error'}`);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleFindingsSubmit = async () => {
    if (!remarks || !selectedApprover || !responseNeeded) {
      setError('Please enter findings, select an approver, and select response needed');
      setTimeout(() => setError(''), 3000);
      return;
    }
    try {
      const supportingDocument = document.getElementById('supportingDocument').files[0];
      await submitFindings(selectedTask.id, remarks, selectedApprover, responseNeeded, supportingDocument);
      setSuccess('Findings submitted successfully');
      setShowFindingsModal(false);
      setRemarks('');
      setResponseNeeded('Pending');
      setSelectedApprover('');
      await fetchMyTasks();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(`Failed to submit findings: ${err.message || 'Unknown error'}`);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleApprove = (task) => {
    setSelectedTask(task);
    setApprovalDocument(null);
    setError('');
    setShowApprovalModal(true);
  };

  const handleApproveSubmit = async () => {
    try {
      const approvalFile = document.getElementById('approvalDocument')?.files[0];
      await approveReport(selectedTask.id, approvalFile);
      setSuccess('Report approved successfully');
      setShowApprovalModal(false);
      setApprovalDocument(null);
      await fetchMyTasks();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(`Failed to approve report: ${err.message || 'Unknown error'}`);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleReject = async (task) => {
    setSelectedTask(task);
    setReasonOfRejection('');
    setError('');
    setShowFindingsModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!reasonOfRejection) {
      setError('Please provide a reason for rejection');
      setTimeout(() => setError(''), 3000);
      return;
    }
    try {
      const rejectionDocument = document.getElementById('rejectionDocument').files[0];
      await rejectReport(selectedTask.id, reasonOfRejection, rejectionDocument);
      setSuccess('Report rejected successfully');
      setShowFindingsModal(false);
      setReasonOfRejection('');
      await fetchMyTasks();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(`Failed to reject report: ${err.message || 'Unknown error'}`);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDetails = (task) => {
    setSelectedTask(task);
    console.log('Opening details modal for task:', JSON.stringify(task, null, 2));
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

  const filteredTasks = tasks.filter(task =>
    task
      ? (task.orgname || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (task.reportype || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (task.fiscalYear || '').toString().toLowerCase().includes(filterText.toLowerCase()) ||
        (task.submittedByAuditorUsername || task.assignedAuditorUsername || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (task.reportstatus || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (task.responseNeeded || '').toLowerCase().includes(filterText.toLowerCase())
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
        {isSeniorAuditor ? 'Senior Auditor Tasks' : 'Approver Tasks'}
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
                fetchMyTasks();
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
      {!loading && tasks.length === 0 && !error && (
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
          No assigned tasks available.
        </Alert>
      )}
      {!loading && tasks.length > 0 && (
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
              label="Search Tasks"
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
          {filteredTasks.length > 0 ? (
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
                      Auditor
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
                  {filteredTasks
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>
                          {task.createdDate
                            ? new Date(task.createdDate).toLocaleDateString()
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: 'inline-block',
                              px: 1,
                              py: 0.5,
                              borderRadius: '12px',
                              bgcolor:
                                task.reportstatus === 'Assigned' || task.reportstatus === 'Under Review'
                                  ? '#e8f5e9'
                                  : task.reportstatus === 'Rejected' || task.reportstatus === 'Corrected'
                                  ? '#fff3e0'
                                  : '#f5f5f5',
                              color:
                                task.reportstatus === 'Assigned' || task.reportstatus === 'Under Review'
                                  ? '#2e7d32'
                                  : task.reportstatus === 'Rejected' || task.reportstatus === 'Corrected'
                                  ? '#f57c00'
                                  : '#616161',
                              fontSize: '0.85rem',
                              fontWeight: 'medium',
                            }}
                          >
                            {task.reportstatus || 'N/A'}
                          </Box>
                        </TableCell>
                        <TableCell>{task.orgname || 'N/A'}</TableCell>
                        <TableCell>{task.fiscalYear || 'N/A'}</TableCell>
                        <TableCell>{task.reportype || 'N/A'}</TableCell>
                        <TableCell>
                          {task.reportstatus === 'Assigned'
                            ? task.assignedAuditorUsername || 'N/A'
                            : task.submittedByAuditorUsername || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexDirection: 'row-reverse', gap: 1 }}>
                            <Tooltip title="View Details">
                              <IconButton
                                color="success"
                                onClick={() => handleDetails(task)}
                                aria-label="View task details"
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
                            {isSeniorAuditor && (task.reportstatus === 'Assigned' || task.reportstatus === 'Rejected') && (
                              <Tooltip title={task.reportstatus === 'Rejected' ? 'Resubmit' : 'Evaluate'}>
                                <IconButton
                                  color="secondary"
                                  onClick={() => handleSubmitFindings(task)}
                                  aria-label={task.reportstatus === 'Rejected' ? 'Resubmit' : 'Evaluate'}
                                  sx={{
                                    '&:hover': {
                                      bgcolor: '#f3e5f5',
                                      transform: 'scale(1.1)',
                                      transition: 'all 0.2s',
                                    },
                                  }}
                                >
                                  <AssignmentIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                            {isApprover && (task.reportstatus === 'Under Review' || task.reportstatus === 'Corrected') && (
                              <>
                                <Tooltip title="Approve">
                                  <IconButton
                                    color="success"
                                    onClick={() => handleApprove(task)}
                                    aria-label="Approve report"
                                    sx={{
                                      '&:hover': {
                                        bgcolor: '#e8f5e9',
                                        transform: 'scale(1.1)',
                                        transition: 'all 0.2s',
                                      },
                                    }}
                                  >
                                    <CheckCircleIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Reject">
                                  <IconButton
                                    color="error"
                                    onClick={() => handleReject(task)}
                                    aria-label="Reject report"
                                    sx={{
                                      '&:hover': {
                                        bgcolor: '#ffebee',
                                        transform: 'scale(1.1)',
                                        transition: 'all 0.2s',
                                      },
                                    }}
                                  >
                                    <CancelIcon />
                                  </IconButton>
                                </Tooltip>
                              </>
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
              No tasks found.
            </Alert>
          )}
          <TablePagination
            component="div"
            count={filteredTasks.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
            sx={{
              '.MuiTablePagination-toolbar': {
                fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' },
                padding: { xs: '8px', sm: '16px' },
              },
            }}
          />
        </Paper>
      )}

      {/* Findings/Rejection Modal */}
      {showFindingsModal && (
        <Dialog
          open={showFindingsModal}
          onClose={() => setShowFindingsModal(false)}
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
            {isSeniorAuditor ? 'Submit Findings' : 'Reject Report'}
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <CForm className="row g-3">
              {isSeniorAuditor ? (
                <>
                  <CCol xs={12}>
                    <CFormLabel htmlFor="remarks">Findings</CFormLabel>
                    <CFormInput
                      id="remarks"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Enter findings"
                      style={{ borderRadius: '8px' }}
                    />
                  </CCol>
                  <CCol xs={12}>
                    <CFormLabel htmlFor="responseNeeded">Response Needed</CFormLabel>
                    <select
                      className="form-control"
                      id="responseNeeded"
                      value={responseNeeded}
                      onChange={(e) => setResponseNeeded(e.target.value)}
                      style={{
                        padding: '8px',
                        borderRadius: '8px',
                        border: '1px solid #ccc',
                      }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </CCol>
                  <CCol xs={12}>
                    <CFormLabel htmlFor="approver">Select Approver</CFormLabel>
                    <select
                      className="form-control"
                      id="approver"
                      value={selectedApprover}
                      onChange={(e) => setSelectedApprover(e.target.value)}
                      style={{
                        padding: '8px',
                        borderRadius: '8px',
                        border: '1px solid #ccc',
                      }}
                    >
                      <option value="">Select Approver</option>
                      {approvers.map((approver) => (
                        <option key={approver.id} value={approver.username}>
                          {approver.firstName} {approver.lastName} ({approver.username})
                        </option>
                      ))}
                    </select>
                  </CCol>
                  <CCol xs={12}>
                    <CFormLabel htmlFor="supportingDocument">Attach File</CFormLabel>
                    <input
                      type="file"
                      className="form-control"
                      id="supportingDocument"
                      style={{ borderRadius: '8px' }}
                    />
                  </CCol>
                </>
              ) : (
                <>
                  <CCol xs={12}>
                    <CFormLabel htmlFor="reasonOfRejection">Reason for Rejection</CFormLabel>
                    <CFormInput
                      id="reasonOfRejection"
                      value={reasonOfRejection}
                      onChange={(e) => setReasonOfRejection(e.target.value)}
                      placeholder="Enter reason for rejection"
                      style={{ borderRadius: '8px' }}
                    />
                  </CCol>
                  <CCol xs={12}>
                    <CFormLabel htmlFor="rejectionDocument">Attach File</CFormLabel>
                    <input
                      type="file"
                      className="form-control"
                      id="rejectionDocument"
                      style={{ borderRadius: '8px' }}
                    />
                  </CCol>
                </>
              )}
            </CForm>
          </DialogContent>
          <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
            <Button
              onClick={() => setShowFindingsModal(false)}
              color="primary"
              sx={{ borderRadius: '8px' }}
            >
              Cancel
            </Button>
            <Button
              onClick={isSeniorAuditor ? handleFindingsSubmit : handleRejectSubmit}
              color="primary"
              variant="contained"
              sx={{ borderRadius: '8px' }}
            >
              {isSeniorAuditor ? 'Submit' : 'Reject'}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Approval Modal */}
      {showApprovalModal && (
        <Dialog
          open={showApprovalModal}
          onClose={() => setShowApprovalModal(false)}
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
            Approve Report
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <CForm className="row g-3">
              <CCol xs={12}>
                <CFormLabel htmlFor="approvalDocument">Attach document</CFormLabel>
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
          <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
            <Button
              onClick={() => setShowApprovalModal(false)}
              color="primary"
              sx={{ borderRadius: '8px' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApproveSubmit}
              color="primary"
              variant="contained"
              sx={{ borderRadius: '8px' }}
            >
              Submit
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedTask && (
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
            Task Details
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <CForm className="row g-3">
              <CCol md={6}>
                <CFormLabel>Date</CFormLabel>
                <CFormInput
                  value={selectedTask.createdDate ? new Date(selectedTask.createdDate).toLocaleDateString() : 'N/A'}
                  readOnly
                  style={{ borderRadius: '8px' }}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Status</CFormLabel>
                <CFormInput
                  value={selectedTask.reportstatus || 'N/A'}
                  readOnly
                  style={{ borderRadius: '8px' }}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Organization</CFormLabel>
                <CFormInput
                  value={selectedTask.orgname || 'N/A'}
                  readOnly
                  style={{ borderRadius: '8px' }}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Budget Year</CFormLabel>
                <CFormInput
                  value={selectedTask.fiscalYear || 'N/A'}
                  readOnly
                  style={{ borderRadius: '8px' }}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Created By</CFormLabel>
                <CFormInput
                  value={selectedTask.createdBy || 'N/A'}
                  readOnly
                  style={{ borderRadius: '8px' }}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Report Type</CFormLabel>
                <CFormInput
                  value={selectedTask.reportype || 'N/A'}
                  readOnly
                  style={{ borderRadius: '8px' }}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Auditor</CFormLabel>
                <CFormInput
                  value={selectedTask.submittedByAuditorUsername || selectedTask.assignedAuditorUsername || 'N/A'}
                  readOnly
                  style={{ borderRadius: '8px' }}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Response Needed</CFormLabel>
                <CFormInput
                  value={selectedTask.responseNeeded || 'N/A'}
                  readOnly
                  style={{ borderRadius: '8px' }}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Archiver</CFormLabel>
                <CFormInput
                  value={selectedTask.assignedByUsername || 'N/A'}
                  readOnly
                  style={{ borderRadius: '8px' }}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Findings</CFormLabel>
                <CFormInput
                  value={selectedTask.remarks || 'N/A'}
                  readOnly
                  style={{ borderRadius: '8px' }}
                />
              </CCol>
              {selectedTask.reasonOfRejection && (
                <CCol md={12}>
                  <CFormLabel>Reason for Rejection</CFormLabel>
                  <CFormInput
                    value={selectedTask.reasonOfRejection || 'N/A'}
                    readOnly
                    style={{ borderRadius: '8px' }}
                  />
                </CCol>
              )}
              <CCol xs={12}>
                <CFormLabel>Documents</CFormLabel>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {selectedTask.docname && (
                    <IconButton
                      color="primary"
                      onClick={() =>
                        handleDownload(
                          selectedTask.id,
                          selectedTask.docname,
                          selectedTask.supportingDocname,
                          'original'
                        )
                      }
                      aria-label={`Download ${selectedTask.docname}`}
                      sx={{
                        '&:hover': {
                          bgcolor: '#e3f2fd',
                          transform: 'scale(1.1)',
                          transition: 'all 0.2s',
                        },
                      }}
                    >
                        Report
                        {/* <DownloadIcon />  */}
                    </IconButton>
                  )}
                  {selectedTask.supportingDocumentPath && (
                    <IconButton
                      color="secondary"
                      onClick={() =>
                        handleDownload(
                          selectedTask.id,
                          selectedTask.supportingDocname,
                          selectedTask.supportingDocname,
                          'supporting'
                        )
                      }
                      aria-label={`Download ${selectedTask.supportingDocname}`}
                      sx={{
                        '&:hover': {
                          bgcolor: '#f3e5f5',
                          transform: 'scale(1.1)',
                          transition: 'all 0.2s',
                        },
                      }}
                    >
                      Finding
                      {/* <DownloadIcon />  */}
                    </IconButton>
                  )}
                </Box>
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

export default AuditorTasks;