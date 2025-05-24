import React, { useState, useEffect } from 'react';
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
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            {reports.length === 0 && !error && <div className="alert alert-info">No corrected reports available.</div>}
            {reports.length > 0 && (
                <table className="table table-striped">
                    <thead>
                        <tr>
                            {/* <th>ID</th> */}
                            <th>Date</th>
                            <th>Organization</th>
                            <th>Budget Year</th>
                            <th>Report Type</th>
                            <th>Created by</th>
                            <th>Auditor</th>
                            {/* <th>Response Needed</th> */}
                            <th>Findings</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.map(report => (
                            <tr key={report.id}>
                                {/* <td>{report.id}</td> */}
                                <td>{report.createdDate ? new Date(report.createdDate).toLocaleDateString() : 'N/A'}</td>
                                <td>{report.organization?.orgname || 'N/A'}</td>
                                <td>{report.fiscal_year || 'N/A'}</td>
                                <td>{report.transactiondocument?.reportype || 'N/A'}</td>
                                <td>{report.createdBy || 'N/A'}</td>
                                <td>{report.submittedByAuditorUsername || 'N/A'}</td>
                                <td>{report.responseNeeded || 'N/A'}</td>
                                {/* <td>{report.remarks || 'N/A'}</td> */}
                                <td>
                                    <button
                                        className="btn btn-primary mr-2"
                                        onClick={() => handleDownload(report.id, report.docname, report.supportingDocname, 'original')}
                                    >
                                        Report
                                    </button>
                                    {report.supportingDocumentPath && (
                                        <button
                                            className="btn btn-info mr-2"
                                            onClick={() => handleDownload(report.id, report.supportingDocname, report.supportingDocname, 'supporting')}
                                        >
                                            Findings
                                        </button>
                                    )}
                                    <button
                                        className="btn btn-info mr-2"
                                        onClick={() => handleDetails(report)}
                                    >
                                        Details
                                    </button>
                                    {isApprover && (
                                        <>
                                            <button
                                                className="btn btn-success mr-2"
                                                onClick={() => handleApprove(report)}
                                            >
                                                Approve
                                            </button>
                                            <button
                                                className="btn btn-danger"
                                                onClick={() => handleReject(report)}
                                            >
                                                Reject
                                            </button>
                                        </>
                                    )}
                                    {isSeniorAuditor && !isApprover && (
                                        <span className="text-muted">Awaiting Approval</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Approval Modal */}
            {showApprovalModal && (
                <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Approve Report</h5>
                                <button type="button" className="btn-close" onClick={() => setShowApprovalModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label htmlFor="approvalDocument">Attach Approval Document (Optional):</label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        id="approvalDocument"
                                        onChange={(e) => setApprovalDocument(e.target.files[0])}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowApprovalModal(false)}>
                                    Close
                                </button>
                                <button type="button" className="btn btn-primary" onClick={handleApproveSubmit}>
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Reject Report</h5>
                                <button type="button" className="btn-close" onClick={() => setShowRejectModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label htmlFor="reasonOfRejection">Reason for Rejection:</label>
                                    <textarea
                                        className="form-control"
                                        id="reasonOfRejection"
                                        value={reasonOfRejection}
                                        onChange={(e) => setReasonOfRejection(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="rejectionDocument">Attach Rejection Document (Optional):</label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        id="rejectionDocument"
                                        onChange={(e) => setRejectionDocument(e.target.files[0])}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowRejectModal(false)}>
                                    Close
                                </button>
                                <button type="button" className="btn btn-primary" onClick={handleRejectSubmit}>
                                    Reject
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Details Modal */}
            {showDetailsModal && selectedReport && (
                <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Report Details</h5>
                                <button type="button" className="btn-close" onClick={() => setShowDetailsModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-6">
                                        {/* <p><strong>ID:</strong> {selectedReport.id}</p> */}
                                        <p><strong>Date:</strong> {selectedReport.createdDate ? new Date(selectedReport.createdDate).toLocaleDateString() : 'N/A'}</p>
                                        <p><strong>Organization:</strong> {selectedReport.organization?.orgname || 'N/A'}</p>
                                        <p><strong>Budget Year:</strong> {selectedReport.fiscal_year || 'N/A'}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <p><strong>Report Type:</strong> {selectedReport.transactiondocument?.reportype || 'N/A'}</p>
                                        <p><strong>Auditor:</strong> {selectedReport.submittedByAuditorUsername || 'N/A'}</p>
                                        <p><strong>Response Needed:</strong> {selectedReport.responseNeeded || 'N/A'}</p>
                                        <p><strong>Audit findings:</strong> {selectedReport.remarks || 'No remarks available'}</p>
                                    </div>
                                    
                                </div>
                                <div className="row mt-3">
                                   
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowDetailsModal(false)}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CorrectedReports;