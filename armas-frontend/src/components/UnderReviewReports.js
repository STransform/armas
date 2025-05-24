import React, { useState, useEffect } from 'react';
import { CForm, CFormLabel, CFormInput, CCol } from '@coreui/react';
import { Table, TableBody, TableCell, TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent, DialogActions, Fade, Alert, TextField, TablePagination, TableContainer, Box } from '@mui/material';
import { getUnderReviewReports, downloadFile, approveReport, rejectReport } from '../file/upload_download';
import { useAuth } from '../views/pages/AuthProvider';

const UnderReviewReports = () => {
  const { roles } = useAuth();
  const isApprover = roles.includes('APPROVER');
  const [reports, setReports] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionDocument, setRejectionDocument] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filterText, setFilterText] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await getUnderReviewReports();
        console.log('Mapped reports:', data); // Debug log
        setReports(data);
        if (data.length === 0) {
          setError('No reports under review.');
        }
      } catch (err) {
        setError('Failed to load under review reports: ' + err.message);
      }
    };
    fetchReports();
  }, []);

  const handleDownload = async (id, docname, type) => {
    try {
      const response = await downloadFile(id, type);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', type === 'original' ? docname : docname || 'file');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setSuccess(`Successfully downloaded ${type} document`);
    } catch (err) {
      setError('Failed to download file: ' + err.message);
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveReport(id);
      setSuccess('Report approved successfully');
      const data = await getUnderReviewReports();
      setReports(data);
    } catch (err) {
      setError(`Failed to approve report: ${err.message}`);
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
      setError('Please provide a reason for rejection');
      return;
    }
    try {
      const file = document.getElementById('rejectionDocument')?.files[0];
      await rejectReport(selectedReport.id, rejectionReason, file);
      setSuccess('Report rejected successfully');
      setShowRejectModal(false);
      setRejectionReason('');
      setRejectionDocument(null);
      const data = await getUnderReviewReports();
      setReports(data);
    } catch (err) {
      setError(`Failed to reject report: ${err.message}`);
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

  const filteredReports = reports.filter(report =>
    (report.id || '').toString().toLowerCase().includes(filterText.toLowerCase()) ||
    (report.organization?.orgname || '').toLowerCase().includes(filterText.toLowerCase()) ||
    (report.transactiondocument?.reportype || '').toLowerCase().includes(filterText.toLowerCase()) ||
    (report.fiscal_year || '').toString().toLowerCase().includes(filterText.toLowerCase()) ||
    (report.remarks || '').toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="container mt-5">
      <h2>Under Review Reports</h2>
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
          No reports under review.
        </Alert>
      )}
      {reports.length > 0 && (
        <TableContainer>
          <Box display="flex" justifyContent="flex-end" sx={{ padding: '6px', mb: 2 }}>
            <TextField
              label="Search Reports"
              variant="outlined"
              value={filterText}
              onChange={handleFilterChange}
              sx={{ width: '40%' }}
            />
          </Box>
          {filteredReports.length > 0 ? (
            <Table sx={{ '& td': { fontSize: '1rem' }, '& th': { fontWeight: 'bold', fontSize: '1rem', backgroundColor: '#f5f5f5' }, '& tr:nth-of-type(odd)': { backgroundColor: '#f9f9f9' } }}>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>ID</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Organization</TableCell>
                  <TableCell>Budget Year</TableCell>
                  <TableCell>Report Type</TableCell>
                  <TableCell>Audit Findings</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredReports.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((report, index) => (
                  <TableRow key={report.id}>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{report.id}</TableCell>
                    <TableCell>{report.createdDate ? new Date(report.createdDate).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell>{report.organization?.orgname || 'N/A'}</TableCell>
                    <TableCell>{report.fiscal_year || 'N/A'}</TableCell>
                    <TableCell>{report.transactiondocument?.reportype || 'N/A'}</TableCell>
                    <TableCell>{report.remarks || 'N/A'}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        sx={{ mr: 1 }}
                        onClick={() => handleDownload(report.id, report.docname, 'original')}
                      >
                        Report
                      </Button>
                      {report.supportingDocumentPath && (
                        <Button
                          variant="contained"
                          color="info"
                          size="small"
                          sx={{ mr: 1 }}
                          onClick={() => handleDownload(report.id, report.supportingDocname, 'supporting')}
                        >
                          Findings
                        </Button>
                      )}
                      {isApprover && (
                        <>
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            sx={{ mr: 1 }}
                            onClick={() => handleApprove(report.id)}
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div>No reports found.</div>
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
        </TableContainer>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <Dialog open={showRejectModal} onClose={() => setShowRejectModal(false)} TransitionComponent={Fade} TransitionProps={{ timeout: 800 }} maxWidth="md">
          <DialogTitle>Reject Report</DialogTitle>
          <hr />
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
                />
              </CCol>
            </CForm>
          </DialogContent>
          <hr />
          <DialogActions>
            <Button onClick={() => setShowRejectModal(false)} color="primary">Close</Button>
            <Button onClick={handleRejectSubmit} color="primary" variant="contained">Reject</Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};

export default UnderReviewReports;