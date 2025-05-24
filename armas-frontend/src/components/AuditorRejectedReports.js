import React, { useState, useEffect } from 'react';
import { getRejectedReports, downloadFile, submitFindings, getUsersByRole } from '../file/upload_download';

const AuditorRejectedReports = () => {
    const [reports, setReports] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [findings, setFindings] = useState('');
    const [responseNeeded, setResponseNeeded] = useState('Pending'); // Default to Pending
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

    const handleDownload = async (id, docname, supportingDocname, type) => {
        try {
            const response = await downloadFile(id, type);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const filename = type === 'original' ? docname : supportingDocname;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setSuccess(`Successfully downloaded ${type} document`);
        } catch (err) {
            setError(`Failed to download file: ${err.message}`);
        }
    };

    const handleEvaluate = async (report) => {
        setSelectedReport(report);
        setFindings('');
        setResponseNeeded('Pending');
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
        if (!findings || !selectedApprover || !responseNeeded) {
            setError('Please enter findings, select an approver, and select response needed');
            return;
        }
        try {
            await submitFindings(selectedReport.id, findings, selectedApprover, responseNeeded, supportingDocument);
            setSuccess('Report resubmitted successfully');
            setShowModal(false);
            setFindings('');
            setResponseNeeded('Pending');
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
                            <th>Rejection Reason</th>
                            <th>Response Needed</th>
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
                                <td>{report.remarks || 'N/A'}</td>
                                <td>{report.responseNeeded || 'N/A'}</td>
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
                                        className="btn btn-secondary"
                                        onClick={() => handleEvaluate(report)}
                                    >
                                        Resubmit
                                    </button>
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
                                <h5 className="modal-title">Resubmit Findings</h5>
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
                                    <label htmlFor="responseNeeded">Response Needed:</label>
                                    <select
                                        className="form-control"
                                        id="responseNeeded"
                                        value={responseNeeded}
                                        onChange={(e) => setResponseNeeded(e.target.value)}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                    </select>
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
                                                {approver.firstName} {approver.lastName}
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

export default AuditorRejectedReports;