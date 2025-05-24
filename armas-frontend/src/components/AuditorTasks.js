import React, { useState, useEffect } from 'react';
import { CForm, CFormLabel, CFormInput, CCol } from '@coreui/react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Fade, Alert, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
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

  const isSeniorAuditor = roles.includes('SENIOR_AUDITOR');
  const isApprover = roles.includes('APPROVER');

  const fetchMyTasks = async () => {
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
      setError(`Failed to load tasks: ${err.message}`);
    }
  };

  useEffect(() => {
    fetchMyTasks();
  }, [roles]);

  const handleDownload = async (id, docname, supportingDocname, type) => {
    try {
      const response = await downloadFile(id, type);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const filename = type === 'original' ? (docname || 'file') : (supportingDocname || 'file');
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setSuccess(`Successfully downloaded ${type} document`);
    } catch (err) {
      setError(`Failed to download ${type} file: ${err.message}`);
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
      setError(`Failed to load approvers: ${err.message}`);
    }
  };

  const handleFindingsSubmit = async () => {
    if (!remarks || !selectedApprover || !responseNeeded) {
      setError('Please enter findings, select an approver, and select response needed');
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
    } catch (err) {
      setError(`Failed to submit findings: ${err.message}`);
    }
  };

  const handleApprove = (task) => {
    setSelectedTask(task);
    setApprovalDocument(null);
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
    } catch (err) {
      setError(`Failed to approve report: ${err.message}`);
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
      return;
    }
    try {
      const rejectionDocument = document.getElementById('rejectionDocument').files[0];
      await rejectReport(selectedTask.id, reasonOfRejection, rejectionDocument);
      setSuccess('Report rejected successfully');
      setShowFindingsModal(false);
      setReasonOfRejection('');
      await fetchMyTasks();
    } catch (err) {
      setError(`Failed to reject report: ${err.message}`);
    }
  };

  const handleDetails = (task) => {
    setSelectedTask(task);
    console.log('Opening details modal for task:', JSON.stringify(task, null, 2));
    setShowDetailsModal(true);
  };

  return (
    <div className="container mt-5">
      <h2>{isSeniorAuditor ? 'Senior Auditor Tasks' : 'Approver Tasks'}</h2>
      {error && (
        <Alert severity="error" sx={{ mb: 2, boxShadow: '4px 4px 6px rgba(0, 0, 0, 0.1)', borderRadius: '8px' }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2, boxShadow: '4px 4px 6px rgba(0, 0, 0, 0.1)', borderRadius: '8px' }}>
          {success}
        </Alert>
      )}
      {tasks.length === 0 && !error && (
        <Alert severity="info" sx={{ mb: 2, boxShadow: '4px 4px 6px rgba(0, 0, 0, 0.1)', borderRadius: '8px' }}>
          No assigned tasks available.
        </Alert>
      )}
      {tasks.length > 0 && (
        <Table sx={{ '& td': { fontSize: '1rem' }, '& th': { fontWeight: 'bold', fontSize: '1rem', backgroundColor: '#f5f5f5' }, '& tr:nth-of-type(odd)': { backgroundColor: '#f9f9f9' } }}>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Organization</TableCell>
              <TableCell>Budget Year</TableCell>
              <TableCell>Report Type</TableCell>
              <TableCell>Auditor</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map(task => (
              <TableRow key={task.id}>
                <TableCell>{task.createdDate ? new Date(task.createdDate).toLocaleDateString() : 'N/A'}</TableCell>
                <TableCell>{task.reportstatus || 'N/A'}</TableCell>
                <TableCell>{task.orgname || 'N/A'}</TableCell>
                <TableCell>{task.fiscalYear || 'N/A'}</TableCell>
                <TableCell>{task.reportype || 'N/A'}</TableCell>
                <TableCell>
                  {task.reportstatus === 'Assigned' ? (task.assignedAuditorUsername || 'N/A') : (task.submittedByAuditorUsername || 'N/A')}
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    sx={{ mr: 1 }}
                    onClick={() => handleDetails(task)}
                  >
                    Details
                  </Button>
                  {isSeniorAuditor && (task.reportstatus === 'Assigned' || task.reportstatus === 'Rejected') && (
                    <Button
                      variant="contained"
                      color="secondary"
                      size="small"
                      sx={{ mr: 1 }}
                      onClick={() => handleSubmitFindings(task)}
                    >
                      {task.reportstatus === 'Rejected' ? 'Resubmit' : 'Evaluate'}
                    </Button>
                  )}
                  {isApprover && (task.reportstatus === 'Under Review' || task.reportstatus === 'Corrected') && (
                    <>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        sx={{ mr: 1 }}
                        onClick={() => handleApprove(task)}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => handleReject(task)}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Findings/Rejection Modal */}
      {showFindingsModal && (
        <Dialog open={showFindingsModal} onClose={() => setShowFindingsModal(false)} TransitionComponent={Fade} TransitionProps={{ timeout: 800 }} maxWidth="md">
          <DialogTitle>{isSeniorAuditor ? 'Submit Findings' : 'Reject Report'}</DialogTitle>
          <hr />
          <DialogContent>
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
                    />
                  </CCol>
                  <CCol xs={12}>
                    <CFormLabel htmlFor="responseNeeded">Response Needed</CFormLabel>
                    <select
                      className="form-control"
                      id="responseNeeded"
                      value={responseNeeded}
                      onChange={(e) => setResponseNeeded(e.target.value)}
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
                    >
                      <option value="">Select Approver</option>
                      {approvers.map(approver => (
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
                    />
                  </CCol>
                  <CCol xs={12}>
                    <CFormLabel htmlFor="rejectionDocument">Attach File</CFormLabel>
                    <input
                      type="file"
                      className="form-control"
                      id="rejectionDocument"
                    />
                  </CCol>
                </>
              )}
            </CForm>
          </DialogContent>
          <hr />
          <DialogActions>
            <Button onClick={() => setShowFindingsModal(false)} color="primary">Cancel</Button>
            <Button onClick={isSeniorAuditor ? handleFindingsSubmit : handleRejectSubmit} color="primary" variant="contained">
              {isSeniorAuditor ? 'Submit' : 'Reject'}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Approval Modal */}
      {showApprovalModal && (
        <Dialog open={showApprovalModal} onClose={() => setShowApprovalModal(false)} TransitionComponent={Fade} TransitionProps={{ timeout: 800 }} maxWidth="md">
          <DialogTitle>Approve Report</DialogTitle>
          <hr />
          <DialogContent>
            <CForm className="row g-3">
              <CCol xs={12}>
                <CFormLabel htmlFor="approvalDocument">Attach Approval Document (Optional)</CFormLabel>
                <input
                  type="file"
                  className="form-control"
                  id="approvalDocument"
                  onChange={(e) => setApprovalDocument(e.target.files[0])}
                />
              </CCol>
            </CForm>
          </DialogContent>
          <hr />
          <DialogActions>
            <Button onClick={() => setShowApprovalModal(false)} color="primary">Cancel</Button>
            <Button onClick={handleApproveSubmit} color="primary" variant="contained">Submit</Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedTask && (
        <Dialog open={showDetailsModal} onClose={() => setShowDetailsModal(false)} TransitionComponent={Fade} TransitionProps={{ timeout: 800 }} maxWidth="md">
          <DialogTitle>Task Details</DialogTitle>
          <hr />
          <DialogContent>
            <CForm className="row g-3">
              <CCol md={6}>
                <CFormLabel>Date</CFormLabel>
                <CFormInput value={selectedTask.createdDate ? new Date(selectedTask.createdDate).toLocaleDateString() : 'N/A'} readOnly />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Status</CFormLabel>
                <CFormInput value={selectedTask.reportstatus || 'N/A'} readOnly />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Organization</CFormLabel>
                <CFormInput value={selectedTask.orgname || 'N/A'} readOnly />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Budget Year</CFormLabel>
                <CFormInput value={selectedTask.fiscalYear || 'N/A'} readOnly />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Created By</CFormLabel>
                <CFormInput value={selectedTask.createdBy || 'N/A'} readOnly />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Report Type</CFormLabel>
                <CFormInput value={selectedTask.reportype || 'N/A'} readOnly />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Auditor</CFormLabel>
                <CFormInput value={selectedTask.submittedByAuditorUsername || selectedTask.assignedAuditorUsername || 'N/A'} readOnly />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Response Needed</CFormLabel>
                <CFormInput value={selectedTask.responseNeeded || 'N/A'} readOnly />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Archiver</CFormLabel>
                <CFormInput value={selectedTask.assignedByUsername || 'N/A'} readOnly />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Findings</CFormLabel>
                <CFormInput value={selectedTask.remarks || 'N/A'} readOnly />
              </CCol>
              {selectedTask.reasonOfRejection && (
                <CCol md={12}>
                  <CFormLabel>Reason for Rejection</CFormLabel>
                  <CFormInput value={selectedTask.reasonOfRejection} readOnly />
                </CCol>
              )}
              <CCol xs={12}>
                <CFormLabel>Documents</CFormLabel>
                <div>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    sx={{ mr: 1 }}
                    onClick={() => handleDownload(selectedTask.id, selectedTask.docname, selectedTask.supportingDocname, 'original')}
                  >
                    Reports
                  </Button>
                  {selectedTask.supportingDocumentPath && (
                    <Button
                      variant="contained"
                      color="info"
                      size="small"
                      sx={{ mr: 1 }}
                      onClick={() => handleDownload(selectedTask.id, selectedTask.supportingDocname, selectedTask.supportingDocname, 'supporting')}
                    >
                      Findings
                    </Button>
                  )}
                </div>
              </CCol>
            </CForm>
          </DialogContent>
          <hr />
          <DialogActions>
            <Button onClick={() => setShowDetailsModal(false)} color="primary">Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};

export default AuditorTasks;