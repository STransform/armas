import React, { useState, useEffect } from 'react';
import { CForm, CFormLabel, CFormInput, CCol } from '@coreui/react';
import { Table, TableBody, TableCell, TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent, DialogActions, Fade, Alert } from '@mui/material';
import { getApprovedReports, downloadFile } from '../file/upload_download';

const ApprovedReports = () => {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await getApprovedReports();
        console.log('Fetched approved reports:', JSON.stringify(data, null, 2));
        data.forEach(report => {
          console.log(
            `Report ID=${report.id}: ` +
            `CreatedBy=${report.createdBy}, ` +
            `AssignedByUsername=${report.assignedByUsername}, ` +
            `ApprovedBy=${report.lastModifiedBy}, ` +
            `Docname=${report.docname}, ` +
            `ResponseNeeded=${report.responseNeeded}`
          );
        });
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

  const handleDownload = async (id, supportingDocname, type = 'supporting') => {
    try {
      console.log(`Downloading file: id=${id}, type=${type}, supportingDocname=${supportingDocname}`);
      const response = await downloadFile(id, type);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', supportingDocname || 'file');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setSuccess('Approver attachment downloaded successfully');
    } catch (err) {
      const errorMessage = err.response?.status === 404
        ? 'Approver attachment not found'
        : `Failed to download Approver attachment: ${err.message}`;
      setError(errorMessage);
      console.error('Download error:', err);
    }
  };

  const handleDetails = (report) => {
    console.log('Selected report:', JSON.stringify(report, null, 2));
    setSelectedReport(report);
    setShowDetailsModal(true);
  };

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
        <Table sx={{ '& td': { fontSize: '1rem' }, '& th': { fontWeight: 'bold', fontSize: '1rem', backgroundColor: '#f5f5f5' }, '& tr:nth-of-type(odd)': { backgroundColor: '#f9f9f9' } }}>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Organization</TableCell>
              <TableCell>Budget Year</TableCell>
              <TableCell>Report Type</TableCell>
              <TableCell>Auditor</TableCell>
              <TableCell>Response Needed</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.map(report => (
              <TableRow key={report.id || Math.random()}>
                <TableCell>{report.createdDate ? new Date(report.createdDate).toLocaleDateString() : 'N/A'}</TableCell>
                <TableCell>{report.orgname || 'N/A'}</TableCell>
                <TableCell>{report.fiscalYear || 'N/A'}</TableCell>
                <TableCell>{report.reportype || 'N/A'}</TableCell>
                <TableCell>{report.submittedByAuditorUsername || 'N/A'}</TableCell>
                <TableCell>{report.responseNeeded || 'N/A'}</TableCell>
                <TableCell>{report.reportstatus || 'N/A'}</TableCell>
                <TableCell>
                  {report.id && report.supportingDocumentPath ? (
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      sx={{ mr: 1 }}
                      onClick={() => handleDownload(report.id, report.supportingDocname, 'supporting')}
                    >
                      Download
                    </Button>
                  ) : (
                    <span className="text-muted mr-2">No attachment available</span>
                  )}
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

export default ApprovedReports;