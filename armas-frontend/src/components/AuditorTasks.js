import React, { useState, useEffect } from 'react';
import { getMyTasks, downloadFile, submitFindings, approveReport, rejectReport, getUsersByRole } from '../file/upload_download';
import { format } from 'date-fns';
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
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedAuditor, setSelectedAuditor] = useState('');
    const [auditors, setAuditors] = useState([]);

    const fetchMyTasks = async () => {
        try {
            const data = await getMyTasks();
            console.log('Raw tasks fetched:', data);
            const validTasks = data.filter(task => 
                task && 
                task.id && 
                task.reportstatus && 
                task.createdDate && 
                task.fiscal_year && 
                task.transactiondocument?.reportype && 
                task.organization?.orgname
            );
            console.log('Valid tasks after filtering:', validTasks);
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
            link.setAttribute('download', docname);
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
        try {
            console.log('Fetching auditors for reject: taskId=', task.id);
            const auditorsData = await getUsersByRole('SENIOR_AUDITOR');
            console.log('Auditors fetched:', auditorsData);
            setAuditors(auditorsData);
            setShowRejectModal(true);
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Unknown error';
            setError(`Failed to load auditors: ${errorMessage}`);
            console.error('Error fetching auditors:', err.response?.data || err);
        }
    };

    const handleRejectSubmit = async () => {
        if (!selectedAuditor) {
            setError('Please select an auditor');
            return;
        }
        try {
            console.log('Calling rejectReport: transactionId=', selectedTask.id, 'auditorUsername=', selectedAuditor);
            await rejectReport(selectedTask.id, selectedAuditor);
            setSuccess('Report rejected successfully');
            setShowRejectModal(false);
            setSelectedAuditor('');
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
                                <td>
                                <td>{task.createdDate ? new Date(task.createdDate).toLocaleDateString() : 'N/A'}</td>
                                </td>
                                <td>{task.reportstatus}</td>
                                <td>{task.organization?.orgname || 'N/A'}</td>
                                <td>{task.fiscal_year}</td>
                                <td>{task.transactiondocument?.reportype || 'N/A'}</td>
                                <td>
                                    <button
                                        className="btn btn-primary mr-2"
                                        onClick={() => handleDownload(task.id, task.docname)}
                                    >
                                        Download
                                    </button>
                                    {isSeniorAuditor && (task.reportstatus === 'Assigned' || task.reportstatus === 'Rejected' || task.reportstatus === 'Under Review') && (
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
                                <h5 className="modal-title">Submit Findings</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowFindingsModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label htmlFor="findings">Findings:</label>
                                    <textarea
                                        className="form-control"
                                        id="findings"
                                        value={findings}
                                        onChange={(e) => setFindings(e.target.value)}
                                    ></textarea>
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
                                    onClick={handleFindingsSubmit}
                                >
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showRejectModal && (
                <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Reject Report</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowRejectModal(false)}
                                ></button>
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
                                                {auditor.firstName} {auditor.lastName} ({auditor.username})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowRejectModal(false)}
                                >
                                    Close
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleRejectSubmit}
                                >
                                    Reject
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