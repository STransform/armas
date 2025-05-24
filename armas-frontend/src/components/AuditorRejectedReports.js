import React, { useState, useEffect } from 'react';
import { CForm, CFormLabel, CFormInput, CCol } from '@coreui/react';
import { Table, TableBody, TableCell, TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent, DialogActions, Fade, Alert, TextField, TablePagination, TableContainer, Box } from '@mui/material';
import { getRejectedReports, downloadFile, submitFindings, getUsersByRole } from '../file/upload_download';

const AuditorRejectedReports = () => {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [findings, setFindings] = useState('');
  const [responseNeeded, setResponseNeeded] = useState('Pending');
  const [supportingDocument, setSupportingDocument] = useState(null);
  const [approvers, setApprovers] = useState([]);
  const [selectedApprover, setSelectedApprover] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filterText, setFilterText] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await getRejectedReports();
        setReports(data);
        if (data.length === 0) {
          setError('No rejected reports available.');
        }
      } catch (err) {
        setError(`Failed to load rejected reports: ${err.message}`);
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

  const handleEvaluate = async (report) => {
    setSelectedReport(report);
    setFindings('');
    setResponseNeeded('Pending');
    setSupportingDocument(null);
    setSelectedApprover('');
    try {
      const approversData = await getUsersByRole('APPROVER');
      setApprovers(approversData);
      setShowModal(true);
    } catch (err) {
      setError(`Failed to load approvers: ${err.message}`);
    }
  };

  const handleSubmit = async () => {
    if (!findings || !selectedApprover || !responseNeeded) {
      setError('Please enter findings, select an approver, and select response needed');
      return;
    }
    try {
      const file = document.getElementById('supportingDocument')?.files[0];
      await submitFindings(selectedReport.id, findings, selectedApprover, responseNeeded, file);
      setSuccess('Report resubmitted successfully');
      setShowModal(false);
      setFindings('');
      setResponseNeeded('Pending');
      setSupportingDocument(null);
      setSelectedApprover('');
      const data = await getRejectedReports();
      setReports(data);
    } catch (err) {
      setError(`Failed to resubmit report: ${err.message}`);
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
    (report.organization?.orgname || '').toLowerCase().includes(filterText.toLowerCase()) ||
    (report.transactiondocument?.reportype || '').toLowerCase().includes(filterText.toLowerCase()) ||
    (report.fiscal_year || '').toString().toLowerCase().includes(filterText.toLowerCase()) ||
    (report.remarks || '').toLowerCase().includes(filterText.toLowerCase()) ||
    (report.responseNeeded || '').toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="container mt-5">
      <h2>Rejected Reports</h2>
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
          No rejected reports available.
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
                  <TableCell>Date</TableCell>
                  <TableCell>Organization</TableCell>
                  <TableCell>Budget Year</TableCell>
                  <TableCell>Report Type</TableCell>
                  <TableCell>Rejection Reason</TableCell>
                  <TableCell>Response Needed</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredReports.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((report, index) => (
                  <TableRow key={report.id}>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{report.createdDate ? new Date(report.createdDate).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell>{report.organization?.orgname || 'N/A'}</TableCell>
                    <TableCell>{report.fiscal_year || 'N/A'}</TableCell>
                    <TableCell>{report.transactiondocument?.reportype || 'N/A'}</TableCell>
                    <TableCell>{report.remarks || 'N/A'}</TableCell>
                    <TableCell>{report.responseNeeded || 'N/A'}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        sx={{ mr: 1 }}
                        onClick={() => handleDownload(report.id, report.docname, report.supportingDocname, 'original')}
                      >
                        Report
                      </Button>
                      {report.supportingDocumentPath && (
                        <Button
                          variant="contained"
                          color="info"
                          size="small"
                          sx={{ mr: 1 }}
                          onClick={() => handleDownload(report.id, report.supportingDocname, report.supportingDocname, 'supporting')}
                        >
                          Findings
                        </Button>
                      )}
                      <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                        onClick={() => handleEvaluate(report)}
                      >
                        Resubmit
                      </Button>
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

      {/* Resubmit Findings Modal */}
      {showModal && (
        <Dialog open={showModal} onClose={() => setShowModal(false)} TransitionComponent={Fade} TransitionProps={{ timeout: 800 }} maxWidth="md">
          <DialogTitle>Resubmit Findings</DialogTitle>
          <hr />
          <DialogContent>
            <CForm className="row g-3">
              <CCol xs={12}>
                <CFormLabel htmlFor="findings">Audit Findings</CFormLabel>
                <CFormInput
                  component="textarea"
                  id="findings"
                  value={findings}
                  onChange={(e) => setFindings(e.target.value)}
                  placeholder="Enter findings"
                  rows={4}
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
                <CFormLabel htmlFor="supportingDocument">Supporting Document (Optional)</CFormLabel>
                <input
                  type="file"
                  className="form-control"
                  id="supportingDocument"
                  onChange={(e) => setSupportingDocument(e.target.files[0])}
                />
              </CCol>
            </CForm>
          </DialogContent>
          <hr />
          <DialogActions>
            <Button onClick={() => setShowModal(false)} color="primary">Close</Button>
            <Button onClick={handleSubmit} color="primary" variant="contained">Submit</Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};

export default AuditorRejectedReports;