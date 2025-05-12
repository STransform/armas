import React, { useState, useEffect } from 'react';
import { getCorrectedReports, downloadFile } from '../file/upload_download';

const CorrectedReports = () => {
    const [reports, setReports] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const data = await getCorrectilesReports();
                setReports(data);
            } catch (err) {
                setError('Failed to load corrected reports: ' + err.message);
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
            link.setAttribute('download', `${type}_${docname}`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setSuccess(`Downloaded ${type} file successfully`);
        } catch (err) {
            setError(`Failed to download ${type} file: ${err.message}`);
        }
    };

    return (
        <div className="container mt-5">
            <h2>Corrected Reports</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            {reports.length === 0 && <div className="alert alert-info">No corrected reports available.</div>}
            {reports.length > 0 && (
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Organization</th>
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
                                <td>{report.organization?.orgname || 'N/A'}</td>
                                <td>{report.fiscal_year || 'N/A'}</td>
                                <td>{report.transactiondocument?.reportype || 'N/A'}</td>
                                <td>{report.reportstatus || 'N/A'}</td>
                                <td>
                                    <button className="btn btn-primary mr-2" onClick={() => handleDownload(report.id, report.docname, 'original')}>
                                        Download Original
                                    </button>
                                    {report.supportingDocumentPath && (
                                        <button className="btn btn-info mr-2" onClick={() => handleDownload(report.id, report.docname, 'supporting')}>
                                            Download Supporting
                                        </button>
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

export default CorrectedReports;