import React, { useState, useEffect } from 'react';
import { CForm, CFormLabel, CFormInput, CCol } from '@coreui/react';
import { Table, TableBody, TableCell, TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent, DialogActions, Fade, Alert } from '@mui/material';
import { getCorrectedReports, downloadFile, approveReport, rejectReport } from '../file/upload_download';
import { useAuth } from '../views/pages/AuthProvider';

const CorrectedReports = () => {
  const { roles } = useAuth();
  const isApprover = roles.includes('APPROVER');
  const isSeniorAuditor = roles.includes('SENIOR_AUDITOR');
  const [reports, setReports] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reasonOfRejection, setReasonOfRejection] = useState('');
  const [rejectionDocument, setRejectionDocument] = useState(null);
  const [approvalDocument, setApprovalDocument] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await getCorrectedReports();
        console.log('Fetched corrected reports:', JSON.stringify(data, null, 2));
        setReports(data);
        if (data.length === 0) {
          setError('No corrected reports available.');
        }
      } catch (err) {
        setError(`Failed to load corrected reports: ${err.message}`);
      }
    };
    fetchReports();
  }, []);

  const handleDownload = async (id, docname, supportingDocname, type) => {
    try {
      const response = await downloadFile(id, type);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const filename = type === 'original' ? docname : supportingDocname;
      link.setAttribute('download', filename || 'file');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setSuccess(`Successfully downloaded ${type} document`);
    } catch (err) {
      setError(`Failed to download file: ${err.message}`);
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
      setSuccess('Report approved successfully');
      setShowApprovalModal(false);
      setApprovalDocument(null);
      const data = await getCorrectedReports();
      setReports(data);
    } catch (err) {
      setError(`Failed to approve report: ${err.message}`);
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
      setError('Please provide a reason for rejection');
      return;
    }
    try {
      const rejectionFile = document.getElementById('rejectionDocument')?.files[0];
      await rejectReport(selectedReport.id, reasonOfRejection, rejectionFile);
      setSuccess('Report rejected successfully');
      setShowRejectModal(false);
      setReasonOfRejection('');
      setRejectionDocument(null);
      const data = await getCorrectedReports();
      setReports(data);
    } catch (err) {
      setError(`Failed to reject report: ${err.message}`);
    }
  };

  const handleDetails = (report) => {
    setSelectedReport(report);
    setShowDetailsModal(true);
  };

  return (
    <div className="container mt-5">
      <h2>Corrected Reports</h2>
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
      {reports.length === 0 && !error && (
        <Alert severity="info" sx={{ mb: 2, boxShadow: '4px 4px 6px rgba(0, 0, 0, 0.1)', borderRadius: '8px' }}>
          No corrected reports available.
        </Alert>
      )}
      {reports.length > 0 && (
        <Table sx={{ '& td': { fontSize: '1rem' }, '& th': { fontWeight: 'bold', fontSize: '1rem', backgroundColor: '#f5f5f5' }, '& tr:nth-of-type(odd)': { backgroundColor: '#f9f9f9' } }}>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Organization</TableCell>
              <TableCell>Budget Year</TableCell>
              <TableCell>Report Type</TableCell>
              <TableCell>Created by</TableCell>
              <TableCell>Auditor</TableCell>
              <TableCell>Response</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.map(report => (
              <TableRow key={report.id}>
                <TableCell>{report.createdDate ? new Date(report.createdDate).toLocaleDateString() : 'N/A'}</TableCell>
                <TableCell>{report.organization?.orgname || 'N/A'}</TableCell>
                <TableCell>{report.fiscal_year || 'N/A'}</TableCell>
                <TableCell>{report.transactiondocument?.reportype || 'N/A'}</TableCell>
                <TableCell>{report.createdBy || 'N/A'}</TableCell>
                <TableCell>{report.submittedByAuditorUsername || 'N/A'}</TableCell>
                <TableCell>{report.responseNeeded || 'N/A'}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    sx={{ mr: 1 }}
                    onClick={() => handleDetails(report)}
                  >
                    Details
                  </Button>
                  {isApprover && (
                    <>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        sx={{ mr: 1 }}
                        onClick={() => handleApprove(report)}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => handleReject(report)}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {isSeniorAuditor && !isApprover && (
                    <span className="text-muted">Awaiting Approval</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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

      {/* Reject Modal */}
      {showRejectModal && (
        <Dialog open={showRejectModal} onClose={() => setShowRejectModal(false)} TransitionComponent={Fade} TransitionProps={{ timeout: 800 }} maxWidth="md">
          <DialogTitle>Reject Report</DialogTitle>
          <hr />
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
                />
              </CCol>
            </CForm>
          </DialogContent>
          <hr />
          <DialogActions>
            <Button onClick={() => setShowRejectModal(false)} color="primary">Cancel</Button>
            <Button onClick={handleRejectSubmit} color="primary" variant="contained">Reject</Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedReport && (
        <Dialog open={showDetailsModal} onClose={() => setShowDetailsModal(false)} TransitionComponent={Fade} TransitionProps={{ timeout: 800 }} maxWidth="md">
          <DialogTitle>Report Details</DialogTitle>
          <hr />
          <DialogContent>
            <CForm className="row g-3">
              <CCol md={6}>
                <CFormLabel>Date</CFormLabel>
                <CFormInput value={selectedReport.createdDate ? new Date(selectedReport.createdDate).toLocaleDateString() : 'N/A'} readOnly />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Organization</CFormLabel>
                <CFormInput value={selectedReport.organization?.orgname || 'N/A'} readOnly />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Budget Year</CFormLabel>
                <CFormInput value={selectedReport.fiscal_year || 'N/A'} readOnly />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Report Type</CFormLabel>
                <CFormInput value={selectedReport.transactiondocument?.reportype || 'N/A'} readOnly />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Created By</CFormLabel>
                <CFormInput value={selectedReport.createdBy || 'N/A'} readOnly />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Auditor</CFormLabel>
                <CFormInput value={selectedReport.submittedByAuditorUsername || 'N/A'} readOnly />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Response Needed</CFormLabel>
                <CFormInput value={selectedReport.responseNeeded || 'N/A'} readOnly />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Audit Findings</CFormLabel>
                <CFormInput value={selectedReport.remarks || 'No remarks available'} readOnly />
              </CCol>
              <CCol xs={12}>
                <CFormLabel>Documents</CFormLabel>
                <div>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    sx={{ mr: 1 }}
                    onClick={() => handleDownload(selectedReport.id, selectedReport.docname, selectedReport.supportingDocname, 'original')}
                  >
                    Report
                  </Button>
                  {selectedReport.supportingDocumentPath && (
                    <Button
                      variant="contained"
                      color="info"
                      size="small"
                      sx={{ mr: 1 }}
                      onClick={() => handleDownload(selectedReport.id, selectedReport.supportingDocname, selectedReport.supportingDocname, 'supporting')}
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

export default CorrectedReports;