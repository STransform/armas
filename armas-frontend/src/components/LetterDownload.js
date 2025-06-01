import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Button, Alert, TextField, TablePagination, TableContainer, Box } from '@mui/material';
import { downloadFile } from '../file/upload_download';
import axiosInstance from '../axiosConfig';

const LetterDownload = () => {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filterText, setFilterText] = useState('');

  useEffect(() => {
    const fetchReportsWithLetters = async () => {
      try {
        const response = await axiosInstance.get('/transactions/my-reports');
        console.log('Raw response data:', JSON.stringify(response.data, null, 2));
        const mappedReports = response.data
          .filter(report => report.letterDocname) // Only include reports with letters
          .map(report => {
            console.log('Mapping report ID=' + report.id + ':', report);
            return {
              id: report.id,
              createdDate: report.createdDate,
              orgname: report.organization?.orgname ?? 'N/A',
              fiscalYear: report.budgetYear?.fiscalYear ?? 'N/A',
              reportype: report.transactiondocument?.reportype ?? 'N/A',
              responseNeeded: report.response_needed ?? 'N/A', // Map response_needed to responseNeeded
              reportstatus: report.reportstatus ?? 'N/A',
              letterDocname: report.letterDocname,
            };
          });
        console.log('Mapped reports:', mappedReports);
        setReports(mappedReports);
        if (mappedReports.length === 0) {
          setError('No reports with uploaded letters found.');
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to load reports';
        setError('Failed to load reports: ' + errorMessage);
        console.error('Fetch error:', err);
      }
    };
    fetchReportsWithLetters();
  }, []);

  const handleDownload = async (id, filename) => {
    try {
      console.log(`Downloading letter: id=${id}, filename=${filename}`);
      const response = await downloadFile(id, 'letter');
      const blob = new Blob([response.data]);
      console.log('Blob size:', blob.size);
      if (blob.size === 0) {
        throw new Error('Empty letter file received');
      }
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename || 'letter');
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      setSuccess('Successfully downloaded letter');
    } catch (err) {
      const errorMessage = err.response?.status === 404
        ? 'Letter not found'
        : err.response?.status === 403
        ? 'You are not authorized to download this letter'
        : `Failed to download letter: ${err.message}`;
      setError(errorMessage);
      console.error('Download error:', err);
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
    (report.responseNeeded || '').toLowerCase().includes(filterText.toLowerCase()) ||
    (report.reportstatus || '').toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="container mt-5">
      <h2>Download Letters</h2>
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
          No letters available for download.
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
                  <TableCell>Response</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredReports.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((report) => (
                  <TableRow key={report.id || Math.random()}>
                    <TableCell>{report.createdDate ? new Date(report.createdDate).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell>{report.orgname}</TableCell>
                    <TableCell>{report.fiscalYear}</TableCell>
                    <TableCell>{report.reportype}</TableCell>
                    <TableCell>{report.responseNeeded}</TableCell>
                    <TableCell>{report.reportstatus}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="info"
                        size="small"
                        onClick={() => handleDownload(report.id, report.letterDocname)}
                      >
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div>No reports with letters found.</div>
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
    </div>
  );
};

export default LetterDownload;