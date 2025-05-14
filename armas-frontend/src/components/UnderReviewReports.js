import React, { useState, useEffect } from 'react';
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

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const data = await getUnderReviewReports();
                setReports(data);
            } catch (err) {
                setError('Failed to load under review reports');
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
            link.setAttribute('download', type === 'original' ? docname : docname);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            setError('Failed to download file');
        }
    };

    const handleApprove = async (id) => {
        try {
            await approveReport(id);
            setSuccess('Report approved successfully');
            // Refresh reports
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
            await rejectReport(selectedReport.id, rejectionReason, rejectionDocument);
            setSuccess('Report rejected successfully');
            setShowRejectModal(false);
            // Refresh reports
            const data = await getUnderReviewReports();
            setReports(data);
        } catch (err) {
            setError(`Failed to reject report: ${err.message}`);
        }
    };

    return (
        <div className="container mt-5">
            <h2>Under Review Reports</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            {reports.length === 0 && <div className="alert alert-info">No reports under review.</div>}
            {reports.length > 0 && (
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Date</th>
                            <th>Organization</th>
                            <th>Budget Year</th>
                            <th>Report Type</th>
                            <th>Audit Findings</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.map(report => (
                            <tr key={report.id}>
                                <td>{report.id}</td>
                                <td>{report.createdDate ? new Date(report.createdDate).toLocaleDateString() : 'N/A'}</td>
                                <td>{report.organization?.orgname || 'N/A'}</td>
                                <td>{report.fiscal_year || 'N/A'}</td>
                                <td>{report.transactiondocument?.reportype || 'N/A'}</td>
                                <td>{report.remarks || 'N/A'}</td>
                                <td>
                                    <button
                                        className="btn btn-primary mr-2"
                                        onClick={() => handleDownload(report.id, report.docname, 'original')}
                                    >
                                        Report
                                    </button>
                                    {report.supportingDocumentPath && (
                                        <button
                                            className="btn btn-info mr-2"
                                            onClick={() => handleDownload(report.id, report.supportingDocname, 'supporting')}
                                        >
                                            Findings
                                        </button>
                                    )}
                                    {isApprover && (
                                        <>
                                            <button
                                                className="btn btn-success mr-2"
                                                onClick={() => handleApprove(report.id)}
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
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {showRejectModal && (
                <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Reject Report</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowRejectModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label htmlFor="rejectionReason">Reason for Rejection:</label>
                                    <textarea
                                        className="form-control"
                                        id="rejectionReason"
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
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
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowRejectModal(false)}
                                >
                                    Close
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleRejectSubmit}
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UnderReviewReports;