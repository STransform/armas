import React, { useState, useEffect } from 'react';
import { CForm, CFormLabel, CFormInput, CCol } from '@coreui/react';
import { Table, TableBody, TableCell, TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent, DialogActions, Fade, Alert, TextField, TablePagination, TableContainer, Box } from '@mui/material';
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

  const fetchReports = async () => {
    try {
      const data = await getSentReports();
      const submitted = data.filter(report => report.reportstatus === 'Submitted');
      setSubmittedReports(submitted);
      if (submitted.length === 0) {
        setError('No submitted reports available.');
      }
    } catch (err) {
      setError('Failed to load reports: ' + (err.response?.data?.message || err.message));
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDownload = async (id, docname, type = 'original') => {
    try {
      const response = await downloadFile(id, type);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', docname || 'file');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setSuccess(`Successfully downloaded ${type} document`);
    } catch (err) {
      setError('Failed to download file: ' + (err.response?.data?.message || err.message));
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
    }
  };

  const handleAssignSubmit = async () => {
    if (!selectedAuditor) {
      setError('Please select an auditor');
      return;
    }
    try {
      await assignAuditor(selectedReport.id, selectedAuditor);
      setSuccess('Auditor assigned successfully');
      setShowAssignModal(false);
      setSelectedAuditor('');
      fetchReports();
    } catch (err) {
      setError('Failed to assign auditor: ' + (err.response?.data?.message || err.message));
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

  const filteredReports = submittedReports.filter(report =>
    (report.orgname || '').toLowerCase().includes(filterText.toLowerCase()) ||
    (report.reportype || '').toLowerCase().includes(filterText.toLowerCase()) ||
    (report.fiscal_year || '').toString().toLowerCase().includes(filterText.toLowerCase()) ||
    (report.user || '').toLowerCase().includes(filterText.toLowerCase()) ||
    (report.reportstatus || '').toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="container mt-5">
      <h2>Archiver View</h2>
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

      <h3>Submitted Reports</h3>
      {submittedReports.length === 0 && !error && (
        <Alert severity="info" sx={{ mb: 2, boxShadow: '4px 4px 6px rgba(0, 0, 0, 0.1)', borderRadius: '8px' }}>
          No submitted reports available.
        </Alert>
      )}
      {submittedReports.length > 0 && (
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
                  <TableCell>Submitted Date</TableCell>
                  <TableCell>Organization Name</TableCell>
                  <TableCell>Budget Year</TableCell>
                  <TableCell>Report Type</TableCell>
                  <TableCell>Submitted By</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredReports.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((report, index) => (
                  <TableRow key={report.id}>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{report.createdDate ? new Date(report.createdDate).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell>{report.orgname || 'N/A'}</TableCell>
                    <TableCell>{report.fiscal_year || 'N/A'}</TableCell>
                    <TableCell>{report.reportype || 'N/A'}</TableCell>
                    <TableCell>{report.user || 'N/A'}</TableCell>
                    <TableCell>{report.reportstatus}</TableCell>
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
                      <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                        onClick={() => handleAssignAuditor(report)}
                      >
                        Assign
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

      {/* Assign Auditor Modal */}
      {showAssignModal && (
        <Dialog open={showAssignModal} onClose={() => setShowAssignModal(false)} TransitionComponent={Fade} TransitionProps={{ timeout: 800 }} maxWidth="md">
          <DialogTitle>Assign Auditor</DialogTitle>
          <hr />
          <DialogContent>
            <CForm className="row g-3">
              <CCol xs={12}>
                <CFormLabel htmlFor="auditor">Select Auditor</CFormLabel>
                <select
                  className="form-control"
                  id="auditor"
                  value={selectedAuditor}
                  onChange={(e) => setSelectedAuditor(e.target.value)}
                >
                  <option value="">Select Auditor</option>
                  {auditors.map(auditor => (
                    <option key={auditor.id} value={auditor.username}>
                      {auditor.username} ({auditor.firstName} {auditor.lastName})
                    </option>
                  ))}
                </select>
              </CCol>
            </CForm>
          </DialogContent>
          <hr />
          <DialogActions>
            <Button onClick={() => setShowAssignModal(false)} color="primary">Cancel</Button>
            <Button onClick={handleAssignSubmit} color="primary" variant="contained">Assign</Button>
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
                <CFormLabel>Submitted Date</CFormLabel>
                <CFormInput value={selectedReport.createdDate ? new Date(selectedReport.createdDate).toLocaleDateString() : 'N/A'} readOnly />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Organization Name</CFormLabel>
                <CFormInput value={selectedReport.orgname || 'N/A'} readOnly />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Budget Year</CFormLabel>
                <CFormInput value={selectedReport.fiscal_year || 'N/A'} readOnly />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Report Type</CFormLabel>
                <CFormInput value={selectedReport.reportype || 'N/A'} readOnly />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Submitted By</CFormLabel>
                <CFormInput value={selectedReport.user || 'N/A'} readOnly />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Status</CFormLabel>
                <CFormInput value={selectedReport.reportstatus || 'N/A'} readOnly />
              </CCol>
              <CCol xs={12}>
                <CFormLabel>Document</CFormLabel>
                <div>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => handleDownload(selectedReport.id, selectedReport.docname)}
                  >
                    Download
                  </Button>
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

export default FileDownload;