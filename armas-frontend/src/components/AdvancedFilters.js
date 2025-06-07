import React, { useState, useEffect } from 'react';
import { CForm, CFormLabel, CFormSelect, CCol, CFormInput } from '@coreui/react';
import {
  Button, Alert, Table, TableBody, TableCell, TableHead, TableRow, TableContainer, TablePagination,
  TextField, Dialog, DialogTitle, DialogContent, DialogActions, Fade, Box
} from '@mui/material';
import { getDocuments, getBudgetYears, getReportNonSenders, getReportsByOrgAndFilters, getAllOrganizationsWithReports, getFeedbackNonSenders, getFeedbackSenders } from '../file/upload_download';
import axiosInstance from '../axiosConfig';

const AdvancedFilters = () => {
  const [filterType, setFilterType] = useState('report-non-senders');
  const [reportype, setReportype] = useState('');
  const [fiscalYear, setFiscalYear] = useState('');
  const [orgId, setOrgId] = useState('');
  const [documents, setDocuments] = useState([]);
  const [budgetYears, setBudgetYears] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filterText, setFilterText] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docs, years, orgs] = await Promise.all([
          getDocuments().catch(err => {
            console.error('Documents fetch failed:', err);
            setError(prev => prev ? `${prev}; Failed to fetch documents` : 'Failed to fetch documents');
            return [];
          }),
          getBudgetYears().catch(err => {
            console.error('Budget Years fetch failed:', err);
            setError(prev => prev ? `${prev}; Failed to fetch budget years` : 'Failed to fetch budget years');
            return [];
          }),
          axiosInstance.get('/organizations').then(res => res.data).catch(err => {
            console.error('Organizations fetch failed:', err);
            setError(prev => prev ? `${prev}; Failed to fetch organizations` : 'Failed to fetch organizations');
            return [];
          }),
        ]);

        console.log('Fetched Documents:', docs);
        console.log('Fetched Budget Years:', years);
        console.log('Fetched Organizations:', orgs);

        setDocuments(docs || []);
        setBudgetYears(years || []);
        setOrganizations(orgs || []);

        if (docs.length > 0) {
          setReportype(docs[0].reportype || '');
        }
        if (years.length > 0) {
          setFiscalYear(years[0].fiscalYear || '');
        }
      } catch (err) {
        console.error('Unexpected fetch error:', err);
        setError(prev => prev ? `${prev}; Unexpected error: ${err.message}` : `Unexpected error: ${err.message}`);
      }
    };
    fetchData();
  }, []);

  const handleFilterSubmit = async () => {
    setError('');
    setSuccess('');
    try {
      let data = [];
      console.log('Applying filter:', { filterType, reportype, fiscalYear, orgId });
      switch (filterType) {
        case 'report-non-senders':
          if (!reportype || !fiscalYear) {
            setError('Please select report type and budget year');
            return;
          }
          data = await getReportNonSenders(reportype, fiscalYear);
          setSuccess(data.length > 0 ? 'Report non-senders fetched successfully' : 'No organizations found that have not sent reports');
          break;
        case 'reports-by-org':
          if (!orgId || !reportype || !fiscalYear) {
            setError('Please select organization, report type, and budget year');
            return;
          }
          data = await getReportsByOrgAndFilters(reportype, fiscalYear, orgId);
          setSuccess(data.length > 0 ? 'Reports found' : 'No reports found for this organization');
          break;
        case 'orgs-with-reports':
          data = await getAllOrganizationsWithReports();
          setSuccess(data.length > 0 ? 'Organizations with reports fetched successfully' : 'No organizations found with reports');
          break;
        case 'feedback-non-senders':
          if (!reportype || !fiscalYear) {
            setError('Please select report type and budget year');
            return;
          }
          data = await getFeedbackNonSenders(reportype, fiscalYear);
          setSuccess(data.length > 0 ? 'Feedback non-senders fetched successfully' : 'No organizations found that have not sent feedback');
          break;
        case 'feedback-senders':
          if (!reportype || !fiscalYear) {
            setError('Please select report type and budget year');
            return;
          }
          data = await getFeedbackSenders(reportype, fiscalYear);
          setSuccess(data.length > 0 ? 'Feedback senders fetched successfully' : 'No feedback senders found');
          break;
        default:
          setError('Invalid filter type');
          return;
      }
      console.log('Filter results:', data);
      setResults(data || []);
      setPage(0);
    } catch (err) {
      console.error('Filter submit error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
      setError(`Failed to apply filter: ${err.message}`);
    }
  };

  const handleDetails = (item) => {
    console.log('Selected item:', JSON.stringify(item, null, 2));
    setSelectedItem(item);
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

  const filteredResults = results.filter(item =>
    (item.orgname || '').toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="container mt-5">
      <h2>Advanced Report Filters</h2>
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
      <CForm className="row g-3" sx={{ mb: 4 }}>
        <CCol md={4}>
          <CFormLabel htmlFor="filterType">Filter Type</CFormLabel>
          <CFormSelect
            id="filterType"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            sx={{ borderRadius: '8px' }}
          >
            <option value="report-non-senders">Report Non-Senders</option>
            <option value="reports-by-org">Reports by Organization</option>
            <option value="orgs-with-reports">Organizations with Reports</option>
            <option value="feedback-non-senders">Feedback Non-Senders</option>
            <option value="feedback-senders">Feedback Senders</option>
          </CFormSelect>
        </CCol>
        <CCol md={4}>
          <CFormLabel htmlFor="reportype">Report Type</CFormLabel>
          <CFormSelect
            id="reportype"
            value={reportype}
            onChange={(e) => setReportype(e.target.value)}
            sx={{ borderRadius: '8px' }}
          >
            <option value="">Select Report Type</option>
            {documents.map(doc => (
              <option key={doc.id} value={doc.reportype}>
                {doc.reportype}
              </option>
            ))}
          </CFormSelect>
        </CCol>
        <CCol md={4}>
          <CFormLabel htmlFor="fiscalYear">Budget Year</CFormLabel>
          <CFormSelect
            id="fiscalYear"
            value={fiscalYear}
            onChange={(e) => setFiscalYear(e.target.value)}
            sx={{ borderRadius: '8px' }}
          >
            <option value="">Select Budget Year</option>
            {budgetYears.map(year => (
              <option key={year.id} value={year.fiscalYear}>
                {year.fiscalYear}
              </option>
            ))}
          </CFormSelect>
        </CCol>
        {filterType === 'reports-by-org' && (
          <CCol md={4}>
            <CFormLabel htmlFor="orgId">Organization</CFormLabel>
            <CFormSelect
              id="orgId"
              value={orgId}
              onChange={(e) => setOrgId(e.target.value)}
              sx={{ borderRadius: '8px' }}
            >
              <option value="">Select Organization</option>
              {organizations.map(org => (
                <option key={org.id} value={org.id}>
                  {org.orgname}
                </option>
              ))}
            </CFormSelect>
          </CCol>
        )}
        <CCol xs={12}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleFilterSubmit}
            sx={{ borderRadius: '8px', textTransform: 'none', boxShadow: '4px 4px 6px rgba(0, 0, 0, 0.1)' }}
          >
            Apply Filter
          </Button>
        </CCol>
      </CForm>

      {results.length > 0 && (
        <TableContainer sx={{ mt: 4 }}>
          <Box display="flex" justifyContent="flex-end" sx={{ padding: '6px', mb: 2 }}>
            <TextField
              label="Search Results"
              variant="outlined"
              value={filterText}
              onChange={handleFilterChange}
              sx={{ width: '40%' }}
            />
          </Box>
          {filteredResults.length > 0 ? (
            <Table sx={{
              '& td': { fontSize: '1rem' },
              '& th': { fontWeight: 'bold', fontSize: '1rem', backgroundColor: '#f5f5f5' },
              '& tr:nth-of-type(odd)': { backgroundColor: '#f9f9f9' }
            }}>
              <TableHead>
                <TableRow>
                  <TableCell>Organization Name</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredResults.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item) => (
                  <TableRow key={item.id || Math.random()}>
                    <TableCell>{item.orgname || 'N/A'}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => handleDetails(item)}
                      >
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div>No results found.</div>
          )}
          <TablePagination
            component="div"
            count={filteredResults.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </TableContainer>
      )}
      {results.length === 0 && success && (
        <Alert severity="info" sx={{ mt: 2, boxShadow: '4px 4px 6px rgba(0, 0, 0, 0.1)', borderRadius: '8px' }}>
          {success}
        </Alert>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedItem && (
        <Dialog
          open={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          TransitionComponent={Fade}
          TransitionProps={{ timeout: 800 }}
          maxWidth="md"
        >
          <DialogTitle>Details</DialogTitle>
          <hr />
          <DialogContent>
            <CForm className="row g-3">
              {(filterType === 'reports-by-org' || filterType === 'feedback-senders') ? (
                <>
                  <CCol md={6}>
                    <CFormLabel>ID</CFormLabel>
                    <CFormInput value={selectedItem.id || 'N/A'} readOnly />
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel>Organization</CFormLabel>
                    <CFormInput value={selectedItem.orgname || 'N/A'} readOnly />
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel>Budget Year</CFormLabel>
                    <CFormInput value={selectedItem.fiscalYear || 'N/A'} readOnly />
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel>Report Type</CFormLabel>
                    <CFormInput value={selectedItem.reportype || 'N/A'} readOnly />
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel>Status</CFormLabel>
                    <CFormInput value={selectedItem.reportstatus || 'N/A'} readOnly />
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel>Created Date</CFormLabel>
                    <CFormInput
                      value={selectedItem.createdDate ? new Date(selectedItem.createdDate).toLocaleDateString() : 'N/A'}
                      readOnly
                    />
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel>Document Name</CFormLabel>
                    <CFormInput value={selectedItem.docname || 'N/A'} readOnly />
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel>Created By</CFormLabel>
                    <CFormInput value={selectedItem.createdBy || 'N/A'} readOnly />
                  </CCol>
                </>
              ) : (
                <>
                  <CCol md={6}>
                    <CFormLabel>Organization ID</CFormLabel>
                    <CFormInput value={selectedItem.id || 'N/A'} readOnly />
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel>Organization Name</CFormLabel>
                    <CFormInput value={selectedItem.orgname || 'N/A'} readOnly />
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel>Organization Type</CFormLabel>
                    <CFormInput value={selectedItem.orgtype || 'N/A'} readOnly />
                  </CCol>
                </>
              )}
            </CForm>
          </DialogContent>
          <hr />
          <DialogActions>
            <Button
              onClick={() => setShowDetailsModal(false)}
              color="primary"
              sx={{ textTransform: 'none' }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};

export default AdvancedFilters;