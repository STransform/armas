import React, { useState, useEffect } from 'react';
import { CForm, CFormLabel, CFormSelect, CCol } from '@coreui/react';
import { Button, Alert, Table, TableBody, TableCell, TableHead, TableRow, TableContainer, TablePagination } from '@mui/material';
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
                    setFiscalYear(years[0].fiscalYear || years[0].fiscal_year || '');
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
            switch (filterType) {
                case 'report-non-senders':
                    if (!reportype || !fiscalYear) {
                        setError('Please select report type and budget year');
                        return;
                    }
                    data = await getReportNonSenders(reportype, fiscalYear);
                    setSuccess('Report non-senders fetched successfully');
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
                    setSuccess('Organizations with reports fetched successfully');
                    break;
                case 'feedback-non-senders':
                    if (!reportype || !fiscalYear) {
                        setError('Please select report type and budget year');
                        return;
                    }
                    data = await getFeedbackNonSenders(reportype, fiscalYear);
                    setSuccess('Feedback non-senders fetched successfully');
                    break;
                case 'feedback-senders':
                    if (!reportype || !fiscalYear) {
                        setError('Please select report type and budget year');
                        return;
                    }
                    data = await getFeedbackSenders(reportype, fiscalYear);
                    setSuccess('Feedback senders fetched successfully');
                    break;
                default:
                    setError('Invalid filter type');
                    return;
            }
            console.log('Filter results:', data);
            setResults(data || []);
            setPage(0);
        } catch (err) {
            console.error('Filter submit error:', err);
            setError(`Failed to apply filter: ${err.message}`);
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <div className="container mt-5">
            <h2>Advanced Report Filters</h2>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            <CForm className="row g-3">
                <CCol md={4}>
                    <CFormLabel htmlFor="filterType">Filter Type</CFormLabel>
                    <CFormSelect
                        id="filterType"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
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
                    <CFormLabel htmlFor="fiscalYeAar">Budget Year</CFormLabel>
                    <CFormSelect
                        id="fiscalYear"
                        value={fiscalYear}
                        onChange={(e) => setFiscalYear(e.target.value)}
                    >
                        <option value="">Select Budget Year</option>
                        {budgetYears.map(year => (
                            <option key={year.id} value={year.fiscalYear || year.fiscal_year}>
                                {year.fiscalYear || year.fiscal_year}
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
                    <Button variant="contained" color="primary" onClick={handleFilterSubmit}>
                        Apply Filter
                    </Button>
                </CCol>
            </CForm>

            {results.length > 0 && (
                <TableContainer sx={{ mt: 4 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {filterType === 'reports-by-org' || filterType === 'feedback-senders' ? (
                                    <>
                                        <TableCell>ID</TableCell>
                                        <TableCell>Organization</TableCell>
                                        <TableCell>Budget Year</TableCell>
                                        <TableCell>Report Type</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Created Date</TableCell>
                                    </>
                                ) : (
                                    <>
                                        <TableCell>ID</TableCell>
                                        <TableCell>Organization Name</TableCell>
                                        <TableCell>Organization Type</TableCell>
                                    </>
                                )}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {results.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item) => (
                                <TableRow key={item.id}>
                                    {filterType === 'reports-by-org' || filterType === 'feedback-senders' ? (
                                        <>
                                            <TableCell>{item.id}</TableCell>
                                            <TableCell>{item.orgname}</TableCell>
                                            <TableCell>{item.fiscalYear}</TableCell>
                                            <TableCell>{item.reportype}</TableCell>
                                            <TableCell>{item.reportstatus}</TableCell>
                                            <TableCell>
                                                {item.createdDate ? new Date(item.createdDate).toLocaleDateString() : 'N/A'}
                                            </TableCell>
                                        </>
                                    ) : (
                                        <>
                                            <TableCell>{item.id}</TableCell>
                                            <TableCell>{item.orgname}</TableCell>
                                            <TableCell>{item.orgtype || 'N/A'}</TableCell>
                                        </>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <TablePagination
                        component="div"
                        count={results.length}
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

export default AdvancedFilters;