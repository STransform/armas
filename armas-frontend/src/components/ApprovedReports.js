import React, { useState, useEffect } from 'react';
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
                    console.log(`Report ID=${report.id}: ` +
                                `CreatedBy=${report.createdBy}, ` +
                                `AssignedByUsername=${report.assignedByUsername}, ` +
                                `ApprovedBy=${report.lastModifiedBy}, ` +
                                `Docname=${report.docname}`);
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
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            {reports.length === 0 && !error && (
                <div className="alert alert-info">No approved reports available.</div>
            )}
            {reports.length > 0 && (
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Organization</th>
                            <th>Budget Year</th>
                            <th>Report Type</th>
                            <th>Auditor</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.map(report => (
                            <tr key={report.id || Math.random()}>
                                <td>{report.createdDate ? new Date(report.createdDate).toLocaleDateString() : 'N/A'}</td>
                                <td>{report.orgname || 'N/A'}</td>
                                <td>{report.fiscalYear || 'N/A'}</td>
                                <td>{report.reportype || 'N/A'}</td>
                                <td>{report.submittedByAuditorUsername || 'N/A'}</td>
                                <td>{report.reportstatus || 'N/A'}</td>
                                <td>
                                    {report.id && report.supportingDocumentPath ? (
                                        <button
                                            className="btn btn-primary mr-2"
                                            onClick={() => handleDownload(report.id, report.supportingDocname, 'supporting')}
                                        >
                                            Download
                                        </button>
                                    ) : (
                                        <span className="text-muted mr-2">No attachment available</span>
                                    )}
                                    <button
                                        className="btn btn-info"
                                        onClick={() => handleDetails(report)}
                                    >
                                        Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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
                                        <p><strong>Date:</strong> {selectedReport.createdDate ? new Date(selectedReport.createdDate).toLocaleDateString() : 'N/A'}</p>
                                        <p><strong>Status:</strong> {selectedReport.reportstatus || 'N/A'}</p>
                                        <p><strong>Organization:</strong> {selectedReport.orgname || 'N/A'}</p>
                                        <p><strong>Budget Year:</strong> {selectedReport.fiscalYear || 'N/A'}</p>
                                        <p><strong>Report Type:</strong> {selectedReport.reportype || 'N/A'}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <p><strong>Auditor:</strong> {selectedReport.submittedByAuditorUsername || 'N/A'}</p>
                                        <p><strong>Approver:</strong> {selectedReport.lastModifiedBy || 'N/A'}</p>
                                        <p><strong>Created By:</strong> {selectedReport.createdBy || 'N/A'}</p>
                                        {/* <p><strong>Document Name:</strong> {selectedReport.docname || 'N/A'}</p> */}
                                        <p><strong>Archiver:</strong> {selectedReport.assignedByUsername || 'N/A'}</p>
                                    </div>
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

export default ApprovedReports;