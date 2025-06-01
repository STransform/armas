import React, { useState, useEffect } from 'react';
import { CForm, CFormLabel, CFormInput, CCol } from '@coreui/react';
import { Table, TableBody, TableCell, TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent, DialogActions, Fade, Alert, TextField, TablePagination, TableContainer, Box } from '@mui/material';
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

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await getApprovedReports();
        console.log('Fetched approved reports:', JSON.stringify(data, null, 2));
        setReports(data);
        if (data.length === 0) {
          setError('No approved reports available.');
        }
      } catch (err) {
        setError('Failed to load approved reports: ' + err.message);
      }
    };
    fetchReports();
  }, []);

  const handleDownload = async (id, filename, type = 'supporting') => {
    try {
      console.log(`Downloading file: id=${id}, type=${type}, filename=${filename}`);
      const response = await downloadFile(id, type);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename || 'file');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setSuccess(`Successfully downloaded ${type === 'letter' ? 'letter' : 'approver attachment'}`);
    } catch (err) {
      const errorMessage = err.response?.status === 404
        ? `${type === 'letter' ? 'Letter' : 'Approver attachment'} not found`
        : `Failed to download: ${err.message}`;
      setError(errorMessage);
      console.error('Download error:', err);
    }
  };

  const handleDetails = (report) => {
    console.log('Selected report:', JSON.stringify(report, null, 2));
    setSelectedReport(report);
    setShowDetailsModal(true);
  };

  const handleLetterUpload = () => {
    setLetterFile(null);
    setError('');
    setShowLetterUploadModal(true);
  };

  const handleLetterSubmit = async () => {
    if (!letterFile) {
      setError('Please select a file');
      return;
    }
    try {
      await uploadLetter(selectedReport.id, letterFile);
      setSuccess('Letter uploaded successfully');
      setShowLetterUploadModal(false);
      setLetterFile(null);
      // Refresh reports to reflect the uploaded letter
      const data = await getApprovedReports();
      setReports(data);
    } catch (err) {
      setError(`Failed to upload letter: ${err.message}`);
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
    (report.orgname || '').toLowerCase().includes(filterText.toLowerCase()) ||
    (report.reportype || '').toLowerCase().includes(filterText.toLowerCase()) ||
    (report.fiscalYear || '').toString().toLowerCase().includes(filterText.toLowerCase()) ||
    (report.submittedByAuditorUsername || '').toLowerCase().includes(filterText.toLowerCase()) ||
    (report.responseNeeded || '').toLowerCase().includes(filterText.toLowerCase()) ||
    (report.reportstatus || '').toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="container mt-5">
      <h2>Approved Reports</h2>
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
          No approved reports available.
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
                  <TableCell>Date</TableCell>
                  <TableCell>Organization</TableCell>
                  <TableCell>Budget Year</TableCell>
                  <TableCell>Report Type</TableCell>
                  <TableCell>Auditor</TableCell>
                  <TableCell>Response</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredReports.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((report) => (
                  <TableRow key={report.id || Math.random()}>
                    <TableCell>{report.createdDate ? new Date(report.createdDate).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell>{report.orgname || 'N/A'}</TableCell>
                    <TableCell>{report.fiscalYear || 'N/A'}</TableCell>
                    <TableCell>{report.reportype || 'N/A'}</TableCell>
                    <TableCell>{report.submittedByAuditorUsername || 'N/A'}</TableCell>
                    <TableCell>{report.responseNeeded || 'N/A'}</TableCell>
                    <TableCell>{report.reportstatus || 'N/A'}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => handleDetails(report)}
                      >
                        Details
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
                <CFormLabel>Status</CFormLabel>
                <CFormInput value={selectedReport.reportstatus || 'N/A'} readOnly />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Organization</CFormLabel>
                <CFormInput value={selectedReport.orgname || 'N/A'} readOnly />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Budget Year</CFormLabel>
                <CFormInput value={selectedReport.fiscalYear || 'N/A'} readOnly />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Report Type</CFormLabel>
                <CFormInput value={selectedReport.reportype || 'N/A'} readOnly />
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
                <CFormLabel>Approver</CFormLabel>
                <CFormInput value={selectedReport.lastModifiedBy || 'N/A'} readOnly />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Created By</CFormLabel>
                <CFormInput value={selectedReport.createdBy || 'N/A'} readOnly />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Archiver</CFormLabel>
                <CFormInput value={selectedReport.assignedByUsername || 'N/A'} readOnly />
              </CCol>
              <CCol xs={6}>
                <CFormLabel>Documents</CFormLabel>
                <div>
                  {selectedReport.id && selectedReport.supportingDocumentPath ? (
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      sx={{ mr: 1 }}
                      onClick={() => handleDownload(selectedReport.id, selectedReport.supportingDocname, 'supporting')}
                    >
                      Download
                    </Button>
                  ) : (
                    <span className="text-muted">No attachment available</span>
                  )}
                </div>
              </CCol>
              <CCol xs={6}>
                <CFormLabel>Letter</CFormLabel>
                <div>
                  {isArchiver && (
                    <Button
                      variant="contained"
                      color="secondary"
                      size="small"
                      sx={{ mr: 1 }}
                      onClick={handleLetterUpload}
                    >
                      Send Letter
                    </Button>
                  )}
                  {selectedReport.letterDocname ? (
                    <Button
                      variant="contained"
                      color="info"
                      size="small"
                      sx={{ mr: 1 }}
                      onClick={() => handleDownload(selectedReport.id, selectedReport.letterDocname, 'letter')}
                    >
                      Download Letter
                    </Button>
                  ) : (
                    <span className="text-muted">No letter uploaded</span>
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

      {/* Letter Upload Modal */}
      {showLetterUploadModal && (
        <Dialog open={showLetterUploadModal} onClose={() => setShowLetterUploadModal(false)} TransitionComponent={Fade} TransitionProps={{ timeout: 800 }} maxWidth="md">
          <DialogTitle>Upload Letter</DialogTitle>
          <hr />
          <DialogContent>
            <CForm className="row g-3">
              <CCol xs={12}>
                <CFormLabel htmlFor="letterFile">Choose Letter File</CFormLabel>
                <CFormInput
                  type="file"
                  id="letterFile"
                  onChange={(e) => setLetterFile(e.target.files[0])}
                />
              </CCol>
            </CForm>
          </DialogContent>
          <hr />
          <DialogActions>
            <Button onClick={() => setShowLetterUploadModal(false)} color="primary">Cancel</Button>
            <Button onClick={handleLetterSubmit} color="primary" variant="contained">Submit</Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};

export default ApprovedReports;