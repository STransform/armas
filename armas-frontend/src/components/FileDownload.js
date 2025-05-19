import React, { useState, useEffect } from 'react';
import { getSentReports, downloadFile, getUsersByRole, assignAuditor } from '../file/upload_download';

const FileDownload = () => {
    const [submittedReports, setSubmittedReports] = useState([]);
    const [approvedReports, setApprovedReports] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [auditors, setAuditors] = useState([]);
    const [selectedAuditor, setSelectedAuditor] = useState('');

    const fetchReports = async () => {
        try {
            const data = await getSentReports();
            const submitted = data.filter(report => report.reportstatus === 'Submitted');
            const approved = data.filter(report => report.reportstatus === 'Approved');
            setSubmittedReports(submitted);
            setApprovedReports(approved);
        } catch (err) {
            setError('Failed to load reports: ' + (err.response?.data?.message || err.message));
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleDownload = async (id, docname, type = 'original') => {
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
            setError('Failed to download file: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleAssignAuditor = async (report) => {
        setSelectedReport(report);
        try {
            const auditorsData = await getUsersByRole('SENIOR_AUDITOR');
            setAuditors(auditorsData);
            setShowAssignModal(true);
        } catch (err) {
            setError('Failed to load auditors: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleAssignSubmit = async () => {
        if (!selectedAuditor) {
            setError('Please select an auditor');
            return;
        }
        try {
            await assignAuditor(selectedReport.id, selectedAuditor);
            setSuccess('Auditor assigned successfully');
            setShowAssignModal(false);
            setSelectedAuditor('');
            fetchReports();
        } catch (err) {
            setError('Failed to assign auditor: ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className="container mt-5">
            {/* <h2>Archiver View</h2> */}
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <h3>Submitted Reports</h3>
            {submittedReports.length === 0 && <div className="alert alert-info">No submitted reports available.</div>}
            {submittedReports.length > 0 && (
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>Submitted Date</th>
                            <th>Organization Name</th>
                            <th>Budget Year</th>
                            <th>Report Type</th>
                            <th>Submitted By</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {submittedReports.map(report => (
                            <tr key={report.id}>
                                <td>{report.createdDate ? new Date(report.createdDate).toLocaleDateString() : 'N/A'}</td>
                                <td>{report.orgname || 'N/A'}</td>
                                <td>{report.fiscal_year || 'N/A'}</td>
                                <td>{report.reportype || 'N/A'}</td>
                                <td>{report.user || 'N/A'}</td>
                                <td>{report.reportstatus}</td>
                                <td>
                                    <button className="btn btn-primary mr-2" onClick={() => handleDownload(report.id, report.docname)}>
                                        Download
                                    </button>
                                    <button className="btn btn-secondary" onClick={() => handleAssignAuditor(report)}>
                                        Assign Auditor
                                    </button>
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
                                <select className="form-control" value={selectedAuditor} onChange={(e) => setSelectedAuditor(e.target.value)}>
                                    <option value="">Select Auditor</option>
                                    {auditors.map(auditor => (
                                        <option key={auditor.id} value={auditor.username}>
                                            {auditor.username} ({auditor.firstName} {auditor.lastName})
                                        </option>
                                    ))}
                                </select>
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