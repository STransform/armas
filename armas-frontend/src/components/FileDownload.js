import React, { useState, useEffect } from 'react';
import { getSentReports, downloadFile } from '../file/upload_download';

const FileDownload = () => {
    const [reports, setReports] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const data = await getSentReports();
                setReports(data);
            } catch (err) {
                setError('Failed to load reports');
            }
        };
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
        } catch (err) {
            setError('Failed to download file');
        }
    };

    return (
        <div className="container mt-5">
            <h2>Download Files</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>Submitted Date</th>
                        <th>Organization Name</th>
                        <th>Budget Year</th>
                        <th>Report Type</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {reports.map(report => (
                        <tr key={report.id}>
                            <td>{new Date(report.createdDate).toLocaleDateString()}</td>
                            <td>{report.orgname}</td>
                            <td>{report.fiscal_year}</td>
                            <td>{report.reportype}</td>
                            <td>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => handleDownload(report.id, report.docname)}
                                >
                                    Download
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default FileDownload;