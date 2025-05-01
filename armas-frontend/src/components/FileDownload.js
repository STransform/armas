import React, { useState, useEffect } from 'react';
import { getSentReports, downloadFile, getUsersByRole, assignAuditor } from '../file/upload_download';

const FileDownload = () => {
    const [reports, setReports] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [auditors, setAuditors] = useState([]);
    const [selectedAuditor, setSelectedAuditor] = useState('');

    const fetchReports = async () => {
        try {
            const data = await getSentReports();
            console.log('Reports fetched:', data);
            setReports(data);
            setError('');
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Unknown error';
            setError(`Failed to load reports: ${errorMessage}`);
            console.error('Error fetching reports:', err);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleDownload = async (id, docname) => {
        try {
            const response = await downloadFile(id);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', docname);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setError('');
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Unknown error';
            setError(`Failed to download file: ${errorMessage}`);
            console.error('Error downloading file:', err);
        }
    };

    const handleAssignAuditor = async (report) => {
        setSelectedReport(report);
        setError('');
        setSuccess('');
        setAuditors([]);
        setSelectedAuditor('');
        try {
            const auditorsData = await getUsersByRole('SENIOR_AUDITOR');
            console.log('Auditors fetched:', auditorsData);
            if (auditorsData.length === 0) {
                setError('No auditors available to assign');
                return;
            }
            setAuditors(auditorsData);
            setShowAssignModal(true);
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Unknown error';
            setError(`Failed to load auditors: ${errorMessage}`);
            console.error('Error fetching auditors:', err);
        }
    };

    const handleAssignSubmit = async () => {
        if (!selectedAuditor) {
            setError('Please select an auditor');
            return;
        }
        try {
            console.log('Assigning auditor: transactionId=', selectedReport.id, ', auditorUsername=', selectedAuditor);
            await assignAuditor(selectedReport.id, selectedAuditor);
            setSuccess('Auditor assigned successfully');
            setShowAssignModal(false);
            setSelectedAuditor('');
            await fetchReports(); // Refresh the list to remove the assigned task
            setError('');
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Unknown error';
            setError(`Failed to assign auditor: ${errorMessage}`);
            console.error('Error assigning auditor:', err);
        }
    };

    return (
        <div className="container mt-5">
            <h2>Submitted Reports</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            {reports.length === 0 && !error && (
                <div className="alert alert-info">No reports available.</div>
            )}
            {reports.length > 0 && (
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>Submitted Date</th>
                            <th>Organization Name</th>
                            <th>Budget Year</th>
                            <th>Report Type</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.map(report => (
                            <tr key={report.id}>
                                <td>{report.createdDate ? new Date(report.createdDate).toLocaleDateString() : 'N/A'}</td>
                                <td>{report.orgname || 'N/A'}</td>
                                <td>{report.fiscal_year || 'N/A'}</td>
                                <td>{report.reportype || 'N/A'}</td>
                                <td>{report.reportstatus || 'N/A'}</td>
                                <td>
                                    <button
                                        className="btn btn-primary mr-2"
                                        onClick={() => handleDownload(report.id, report.docname)}
                                    >
                                        Download
                                    </button>
                                    {report.reportstatus === 'Submitted' && (
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => handleAssignAuditor(report)}
                                        >
                                            Assign Auditor
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {showAssignModal && (
                <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Assign Auditor</h5>
                                <button type="button" className="btn-close" onClick={() => setShowAssignModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label htmlFor="auditor">Select Auditor:</label>
                                    <select
                                        className="form-control"
                                        id="auditor"
                                        value={selectedAuditor}
                                        onChange={(e) => setSelectedAuditor(e.target.value)}
                                    >
                                        <option value="">Select Auditor</option>
                                        {auditors.map(auditor => (
                                            <option key={auditor.id} value={auditor.username}>
                                                {auditor.username} ({auditor.firstName} {auditor.lastName})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAssignModal(false)}>Close</button>
                                <button type="button" className="btn btn-primary" onClick={handleAssignSubmit}>Assign</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileDownload;