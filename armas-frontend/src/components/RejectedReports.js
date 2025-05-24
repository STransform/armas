import React, { useState, useEffect } from 'react';
import { getRejectedReports, downloadFile, submitFindings, getUsersByRole } from '../file/upload_download';
import { useAuth } from '../views/pages/AuthProvider';

const RejectedReports = () => {
    const { roles } = useAuth();
    const isSeniorAuditor = roles.includes('SENIOR_AUDITOR');
    const [reports, setReports] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [findings, setFindings] = useState('');
    const [supportingDocument, setSupportingDocument] = useState(null);
    const [approvers, setApprovers] = useState([]);
    const [selectedApprover, setSelectedApprover] = useState('');

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const data = await getRejectedReports();
                setReports(data);
            } catch (err) {
                setError(`Failed to load rejected reports: ${err.message}`);
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
            link.setAttribute('download', docname);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            setError(`Failed to download file: ${err.message}`);
        }
    };

    const handleResubmit = async (report) => {
        setSelectedReport(report);
        setFindings('');
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
        if (!findings || !selectedApprover) {
            setError('Please enter findings and select an approver');
            return;
        }
        try {
            await submitFindings(selectedReport.id, findings, selectedApprover, supportingDocument);
            setSuccess('Report resubmitted successfully');
            setShowModal(false);
            setFindings('');
            setSupportingDocument(null);
            setSelectedApprover('');
            const data = await getRejectedReports();
            setReports(data);
        } catch (err) {
            setError(`Failed to resubmit report: ${err.message}`);
        }
    };

    return (
        <div className="container mt-5">
            <h2>Rejected Reports</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            {reports.length === 0 && <div className="alert alert-info">No rejected reports available.</div>}
            {reports.length > 0 && (
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Organization</th>
                            <th>Budget Year</th>
                            <th>Report Type</th>
                            <th>Auditor</th>
                            <th>Reason for Rejection</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.map(report => (
                            <tr key={report.id}>
                                <td>{report.createdDate ? new Date(report.createdDate).toLocaleDateString() : 'N/A'}</td>
                                <td>{report.organization?.orgname || 'N/A'}</td>
                                <td>{report.fiscal_year || 'N/A'}</td>
                                <td>{report.transactiondocument?.reportype || 'N/A'}</td>
                                <td>{report.submittedByAuditorUsername || 'N/A'}</td>
                                <td>{report.reasonOfRejection || 'N/A'}</td>
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
                                    {isSeniorAuditor && (
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => handleResubmit(report)}
                                        >
                                            Resubmit
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {showModal && (
                <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Resubmit</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label htmlFor="findings">Audit Findings:</label>
                                    <textarea
                                        className="form-control"
                                        id="findings"
                                        value={findings}
                                        onChange={(e) => setFindings(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="approver">Select Approver:</label>
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
                                </div>
                                <div className="form-group">
                                    <label htmlFor="supportingDocument">Supporting Document (Optional):</label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        id="supportingDocument"
                                        onChange={(e) => setSupportingDocument(e.target.files[0])}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Close
                                </button>
                                <button type="button" className="btn btn-primary" onClick={handleSubmit}>
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RejectedReports;