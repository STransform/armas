import React, { useState, useEffect } from 'react';
import { CForm, CFormLabel, CFormInput, CCol } from '@coreui/react';
import { Table, TableBody, TableCell, TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent, DialogActions, Fade, Alert, TextField, TablePagination, TableContainer, Box } from '@mui/material';
import { downloadFile } from '../file/upload_download';
import axiosInstance from '../axiosConfig';

const FileHistory = () => {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filterText, setFilterText] = useState('');

  const fetchMyReports = async () => {
    try {
      const response = await axiosInstance.get('/transactions/my-reports');
      const mappedReports = response.data.map(report => ({
        id: report.id,
        createdDate: report.createdDate,
        reportstatus: report.reportstatus,
        orgname: report.organization ? report.organization.orgname : null,
        fiscalYear: report.budgetYear ? report.budgetYear.fiscalYear : null,
        reportype: report.transactiondocument ? report.transactiondocument.reportype : null,
        docname: report.docname,
        supportingDocumentPath: report.supportingDocumentPath,
        supportingDocname: report.supportingDocname,
        letterDocname: report.letterDocname,
        createdBy: report.createdBy || null,
      }));
      setReports(mappedReports);
      if (mappedReports.length === 0) {
        setError('No reports found in your history.');
      }
    } catch (err) {
      setError('Failed to load file history: ' + err.message);
    }
  };

  useEffect(() => {
    fetchMyReports();
  }, []);

  const handleDownload = async (id, filename, type) => {
    try {
      const response = await downloadFile(id, type);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename || 'file');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setSuccess(`Successfully downloaded ${type === 'letter' ? 'letter' : 'file'}`);
    } catch (err) {
      setError(`Failed to download ${type === 'letter' ? 'letter' : 'file'}: ${err.message}`);
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

  const filteredReports = reports.filter(report =>
    (report.orgname || '').toLowerCase().includes(filterText.toLowerCase()) ||
    (report.reportype || '').toLowerCase().includes(filterText.toLowerCase()) ||
    (report.fiscalYear || '').toLowerCase().includes(filterText.toLowerCase()) ||
    (report.reportstatus || '').toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="container mt-5">
      <h2>File History</h2>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {reports.length === 0 && !error && <Alert severity="info" sx={{ mb: 2 }}>No reports available.</Alert>}
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
          <Table sx={{ '& td': { fontSize: '1rem' }, '& th': { fontWeight: 'bold', fontSize: '1rem', backgroundColor: '#f5f5f5' } }}>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Organization</TableCell>
                <TableCell>Budget Year</TableCell>
                <TableCell>Report Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredReports.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(report => (
                <TableRow key={report.id}>
                  <TableCell>{report.createdDate ? new Date(report.createdDate).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell>{report.orgname || 'N/A'}</TableCell>
                  <TableCell>{report.fiscalYear || 'N/A'}</TableCell>
                  <TableCell>{report.reportype || 'N/A'}</TableCell>
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

      {showDetailsModal && selectedReport && (
        <Dialog open={showDetailsModal} onClose={() => setShowDetailsModal(false)} TransitionComponent={Fade} TransitionProps={{ timeout: 800 }} maxWidth="md">
          <DialogTitle>File Details</DialogTitle>
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
                <CFormLabel>File Name</CFormLabel>
                <CFormInput value={selectedReport.docname || 'N/A'} readOnly />
              </CCol>
              <CCol xs={6}>
                <CFormLabel>Documents</CFormLabel>
                <div>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    sx={{ mr: 1 }}
                    onClick={() => handleDownload(selectedReport.id, selectedReport.docname, 'original')}
                  >
                    Download Report
                  </Button>
                  {selectedReport.supportingDocumentPath && (
                    <Button
                      variant="contained"
                      color="info"
                      size="small"
                      sx={{ mr: 1 }}
                      onClick={() => handleDownload(selectedReport.id, selectedReport.supportingDocname, 'supporting')}
                    >
                      Download Supporting
                    </Button>
                  )}
                </div>
              </CCol>
              <CCol xs={6}>
                <CFormLabel>Letter</CFormLabel>
                <div>
                  {selectedReport.letterDocname ? (
                    <Button
                      variant="contained"
                      color="warning"
                      size="small"
                      sx={{ mr: 1 }}
                      onClick={() => handleDownload(selectedReport.id, selectedReport.letterDocname, 'letter')}
                    >
                      Download Letter
                    </Button>
                  ) : (
                    <span className="text-muted">No letter available</span>
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

export default FileHistory;