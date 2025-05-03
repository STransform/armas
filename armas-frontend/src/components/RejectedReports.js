import React, { useState, useEffect } from 'react';
import { getRejectedReports, downloadFile } from '../file/upload_download';

const RejectedReports = () => {
const [reports, setReports] = useState([]);
const [error, setError] = useState('');
const [success, setSuccess] = useState('');

useEffect(() => {
const fetchReports = async () => {
try {
const data = await getRejectedReports();
setReports(data);
} catch (err) {
setError('Failed to load rejected reports: ' + err.message);
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
setSuccess('File downloaded successfully');
} catch (err) {
setError('Failed to download file: ' + err.message);
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
<th>Status</th>
<th>Remarks</th>
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
<td>{report.reportstatus}</td>
<td>{report.remarks || 'N/A'}</td>
<td>
<button className="btn btn-primary" onClick={() => handleDownload(report.id, report.docname)}>
Download
</button>
</td>
</tr>
))}
</tbody>
</table>
)}
</div>
);
};

export default RejectedReports;