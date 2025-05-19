import React, { useState, useEffect } from 'react';
import { getMyTasks, downloadFile, submitFindings, approveReport, rejectReport, getUsersByRole } from '../file/upload_download';
import { useAuth } from '../views/pages/AuthProvider';

const AuditorTasks = () => {
    const { roles } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showFindingsModal, setShowFindingsModal] = useState(false);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [findings, setFindings] = useState('');
    const [approvalDocument, setApprovalDocument] = useState(null);
    const [approvers, setApprovers] = useState([]);
    const [selectedApprover, setSelectedApprover] = useState('');

    const isSeniorAuditor = roles.includes('SENIOR_AUDITOR');
    const isApprover = roles.includes('APPROVER');

    const fetchMyTasks = async () => {
        try {
            const data = await getMyTasks();
            let filteredTasks;
            if (isSeniorAuditor) {
                filteredTasks = data.filter(task => 
                    task.reportstatus === 'Assigned' || task.reportstatus === 'Rejected'
                );
            } else if (isApprover) {
                filteredTasks = data.filter(task => 
                    task.reportstatus === 'Under Review' || task.reportstatus === 'Approved'
                );
            } else {
                filteredTasks = [];
            }
            setTasks(filteredTasks);
        } catch (err) {
            setError(`Failed to load tasks: ${err.message}`);
        }
    };

    useEffect(() => {
        fetchMyTasks();
    }, [roles]);

    const handleDownload = async (id, docname, supportingDocname, type) => {
        try {
            const response = await downloadFile(id, type);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const filename = type === 'original' ? (docname || 'file') : (supportingDocname || 'file');
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            setError(`Failed to download ${type} file: ${err.message}`);
        }
    };

    const handleSubmitFindings = async (task) => {
        setSelectedTask(task);
        setError('');
        try {
            const approversData = await getUsersByRole('APPROVER');
            setApprovers(approversData);
            setShowFindingsModal(true);
        } catch (err) {
            setError(`Failed to load approvers: ${err.message}`);
        }
    };

    const handleFindingsSubmit = async () => {
        if (!findings || !selectedApprover) {
            setError('Please enter findings and select an approver');
            return;
        }
        try {
            const supportingDocument = document.getElementById('supportingDocument').files[0];
            await submitFindings(selectedTask.id, findings, selectedApprover, supportingDocument);
            setSuccess('Findings submitted successfully');
            setShowFindingsModal(false);
            setFindings('');
            setSelectedApprover('');
            await fetchMyTasks();
        } catch (err) {
            setError(`Failed to submit findings: ${err.message}`);
        }
    };

    const handleApprove = (task) => {
        setSelectedTask(task);
        setApprovalDocument(null);
        setShowApprovalModal(true);
    };

    const handleApproveSubmit = async () => {
        try {
            const approvalFile = document.getElementById('approvalDocument')?.files[0];
            await approveReport(selectedTask.id, approvalFile);
            setSuccess('Report approved successfully');
            setShowApprovalModal(false);
            setApprovalDocument(null);
            await fetchMyTasks();
        } catch (err) {
            setError(`Failed to approve report: ${err.message}`);
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
            const rejectionDocument = document.getElementById('rejectionDocument').files[0];
            await rejectReport(selectedTask.id, findings, rejectionDocument);
            setSuccess('Report rejected successfully');
            setShowFindingsModal(false);
            setFindings('');
            await fetchMyTasks();
        } catch (err) {
            setError(`Failed to reject report: ${err.message}`);
        }
    };

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
                            <th>ID</th>
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
                                <td>{task.id}</td>
                                <td>{task.createdDate ? new Date(task.createdDate).toLocaleDateString() : 'N/A'}</td>
                                <td>{task.reportstatus || 'N/A'}</td>
                                <td>{task.organization?.orgname || 'N/A'}</td>
                                <td>{task.fiscal_year || 'N/A'}</td>
                                <td>{task.transactiondocument?.reportype || 'N/A'}</td>
                                <td>
                                    <button
                                        className="btn btn-primary mr-2"
                                        onClick={() => handleDownload(task.id, task.docname, task.supportingDocname, 'original')}
                                    >
                                        Reports
                                    </button>
                                    {task.supportingDocumentPath && (
                                        <button
                                            className="btn btn-info mr-2"
                                            onClick={() => handleDownload(task.id, task.docname, task.supportingDocname, 'supporting')}
                                        >
                                            Findings
                                        </button>
                                    )}
                                    {isSeniorAuditor && (task.reportstatus === 'Assigned' || task.reportstatus === 'Rejected') && (
                                        <button
                                            className="btn btn-secondary mr-2"
                                            onClick={() => handleSubmitFindings(task)}
                                        >
                                            {task.reportstatus === 'Rejected' ? 'Resubmit' : 'Evaluate'}
                                        </button>
                                    )}
                                    {isApprover && task.reportstatus === 'Under Review' && (
                                        <>
                                            <button
                                                className="btn btn-success mr-2"
                                                onClick={() => handleApprove(task)}
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
                                    {isApprover && task.reportstatus === 'Approved' && (
                                        <span className="text-muted">Approved</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Findings Modal for Senior Auditor */}
            {showFindingsModal && (
                <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{isSeniorAuditor ? 'Submit Findings' : 'Reject Report'}</h5>
                                <button type="button" className="btn-close" onClick={() => setShowFindingsModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label htmlFor="findings">{isSeniorAuditor ? 'Findings' : 'Reason for Rejection'}:</label>
                                    <textarea
                                        className="form-control"
                                        id="findings"
                                        value={findings}
                                        onChange={(e) => setFindings(e.target.value)}
                                    />
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
                                <div className="form-group">
                                    <label htmlFor={isSeniorAuditor ? 'supportingDocument' : 'rejectionDocument'}>
                                        {isSeniorAuditor ? 'Attach Supporting Document' : 'Attach Rejection Document'}:
                                    </label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        id={isSeniorAuditor ? 'supportingDocument' : 'rejectionDocument'}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowFindingsModal(false)}>
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

            {/* Approval Modal for Approver */}
            {showApprovalModal && (
                <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Approve Report</h5>
                                <button type="button" className="btn-close" onClick={() => setShowApprovalModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label htmlFor="approvalDocument">Attach Approval Document (Optional):</label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        id="approvalDocument"
                                        onChange={(e) => setApprovalDocument(e.target.files[0])}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowApprovalModal(false)}>
                                    Close
                                </button>
                                <button type="button" className="btn btn-primary" onClick={handleApproveSubmit}>
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

export default AuditorTasks;