import React, { useState, useEffect } from 'react';
import { getMyTasks, downloadFile, submitFindings, approveReport, rejectReport, getUsersByRole } from '../file/upload_download';
import { useAuth } from '../views/pages/AuthProvider';

const AuditorTasks = () => {
    const { roles } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showFindingsModal, setShowFindingsModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [findings, setFindings] = useState('');
    const [approvers, setApprovers] = useState([]);
    const [selectedApprover, setSelectedApprover] = useState('');

    const fetchMyTasks = async () => {
        try {
            console.log('Fetching tasks for roles:', roles);
            const data = await getMyTasks();
            console.log('Raw tasks fetched:', JSON.stringify(data, null, 2));
            const validTasks = data.filter(task => task && task.id);
            console.log('Valid tasks after filtering:', JSON.stringify(validTasks, null, 2));
            setTasks(validTasks);
            setError('');
            if (validTasks.length === 0) {
                console.warn('No valid tasks returned for user. Check role, database, or backend query.');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Unknown error';
            setError(`Failed to load tasks: ${errorMessage}`);
            console.error('Fetch error:', err.response?.data || err);
        }
    };

    useEffect(() => {
        console.log('Current roles:', roles);
        fetchMyTasks();
    }, [roles]);

    const handleDownload = async (id, docname) => {
        try {
            const response = await downloadFile(id);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', docname || 'file');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setError('');
        } catch (err) {
            setError('Failed to download file: ' + (err.response?.data?.message || err.message));
            console.error('Download error:', err.response?.data || err);
        }
    };

    const handleSubmitFindings = async (task) => {
        setSelectedTask(task);
        setError('');
        try {
            const approversData = await getUsersByRole('APPROVER');
            console.log('Approvers fetched:', approversData);
            setApprovers(approversData);
            setShowFindingsModal(true);
        } catch (err) {
            setError('Failed to load approvers: ' + (err.response?.data?.message || err.message));
            console.error('Error fetching approvers:', err.response?.data || err);
        }
    };

    const handleFindingsSubmit = async () => {
        if (!findings || !selectedApprover) {
            setError('Please enter findings and select an approver');
            return;
        }
        try {
            console.log('Calling submitFindings: transactionId=', selectedTask.id, 'findings=', findings, 'approverUsername=', selectedApprover);
            await submitFindings(selectedTask.id, findings, selectedApprover);
            setSuccess('Findings submitted successfully');
            setShowFindingsModal(false);
            setFindings('');
            setSelectedApprover('');
            await fetchMyTasks();
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Unknown error';
            setError(`Failed to submit findings: ${errorMessage}`);
            console.error('Submit error:', errorMessage, err.response?.data || err);
        }
    };

    const handleApprove = async (id) => {
        try {
            console.log('Calling approveReport for transactionId:', id);
            await approveReport(id);
            setSuccess('Report approved successfully');
            await fetchMyTasks();
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Unknown error';
            setError(`Failed to approve report: ${errorMessage}`);
            console.error('Approve error:', errorMessage, err.response?.data || err);
        }
    };

    const handleReject = async (task) => {
        setSelectedTask(task);
        setError('');
        setShowFindingsModal(true);
    };

    const handleRejectSubmit = async () => {
        if (!findings) {
            setError('Please provide a reason for rejection');
            return;
        }
        try {
            console.log('Calling rejectReport: transactionId=', selectedTask.id);
            await submitFindings(selectedTask.id, findings, selectedTask.user2.username);
            setSuccess('Report rejected and reassigned successfully');
            setShowFindingsModal(false);
            setFindings('');
            await fetchMyTasks();
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Unknown error';
            setError(`Failed to reject report: ${errorMessage}`);
            console.error('Reject error:', errorMessage, err.response?.data || err);
        }
    };

    const isSeniorAuditor = roles.includes('SENIOR_AUDITOR');
    const isApprover = roles.includes('APPROVER');

    return (
        <div className="container mt-5">
            <h2>{isSeniorAuditor ? 'Senior Auditor Tasks' : 'Approver Tasks'}</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            {tasks.length === 0 && !error && (
                <div className="alert alert-info">No assigned tasks available.</div>
            )}
            {tasks.length > 0 && (
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Organization</th>
                            <th>Budget Year</th>
                            <th>Report Type</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.map(task => (
                            <tr key={task.id}>
                                <td>{task.createdDate ? new Date(task.createdDate).toLocaleDateString() : 'N/A'}</td>
                                <td>{task.reportstatus || 'N/A'}</td>
                                <td>{task.organization?.orgname || 'N/A'}</td>
                                <td>{task.fiscal_year || 'N/A'}</td>
                                <td>{task.transactiondocument?.reportype || 'N/A'}</td>
                                <td>
                                    <button
                                        className="btn btn-primary mr-2"
                                        onClick={() => handleDownload(task.id, task.docname)}
                                    >
                                        Download
                                    </button>
                                    {isSeniorAuditor && (task.reportstatus === 'Assigned' || task.reportstatus === 'Rejected') && (
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => handleSubmitFindings(task)}
                                        >
                                            Evaluate
                                        </button>
                                    )}
                                    {isApprover && task.reportstatus === 'Under Review' && (
                                        <>
                                            <button
                                                className="btn btn-success mr-2"
                                                onClick={() => handleApprove(task.id)}
                                            >
                                                Approve
                                            </button>
                                            <button
                                                className="btn btn-danger"
                                                onClick={() => handleReject(task)}
                                            >
                                                Reject
                                            </button>
                                        </>
                                    )}
                                    {isApprover && (task.reportstatus === 'Approved' || task.reportstatus === 'Rejected') && (
                                        <span className="text-muted">Action Completed</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {showFindingsModal && (
                <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{isSeniorAuditor ? 'Submit Findings' : 'Reject Report'}</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowFindingsModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label htmlFor="findings">{isSeniorAuditor ? 'Findings' : 'Reason for Rejection'}:</label>
                                    <textarea
                                        className="form-control"
                                        id="findings"
                                        value={findings}
                                        onChange={(e) => setFindings(e.target.value)}
                                    ></textarea>
                                </div>
                                {isSeniorAuditor && (
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
                                )}
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowFindingsModal(false)}
                                >
                                    Close
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={isSeniorAuditor ? handleFindingsSubmit : handleRejectSubmit}
                                >
                                    {isSeniorAuditor ? 'Submit' : 'Reject'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuditorTasks;