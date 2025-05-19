import React, { useState, useEffect } from 'react';
import { getApprovedReports, downloadFile } from '../file/upload_download';

const ApprovedReports = () => {
    const [reports, setReports] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const data = await getApprovedReports();
                console.log('Fetched approved reports:', JSON.stringify(data, null, 2));
                data.forEach(report => {
                    console.log(`Report ID=${report.id}: supportingDocumentPath=${report.supportingDocumentPath}, supportingDocname=${report.supportingDocname}`);
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
                                            className="btn btn-primary"
                                            onClick={() => handleDownload(report.id, report.supportingDocname, 'supporting')}
                                        >
                                            Download
                                        </button>
                                    ) : (
                                        <span className="text-muted">No attachment available</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ApprovedReports;