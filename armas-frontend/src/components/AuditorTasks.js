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
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    // const [findings, setFindings] = useState('');
    const [remarks, setRemarks] = useState('');
    const [reasonOfRejection, setReasonOfRejection] = useState('');
    const [responseNeeded, setResponseNeeded] = useState('Pending'); // New state for response_needed
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
                    ['Assigned', 'Rejected', 'Under Review', 'Corrected'].includes(task.reportstatus)
                );
            } else if (isApprover) {
                filteredTasks = data.filter(task =>
                    ['Under Review', 'Corrected', 'Rejected'].includes(task.reportstatus)
                );
            } else {
                filteredTasks = [];
            }
            setTasks(filteredTasks);
            if (filteredTasks.length === 0) {
                setError('No tasks available for your role.');
            }
            console.log('Filtered tasks:', JSON.stringify(filteredTasks, null, 2));
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
            setSuccess(`Successfully downloaded ${type} document`);
        } catch (err) {
            setError(`Failed to download ${type} file: ${err.message}`);
        }
    };

    const handleSubmitFindings = async (task) => {
        setSelectedTask(task);
        setError('');
        // setFindings('');
        setRemarks('');
        setResponseNeeded('Pending'); // Reset to default
        setSelectedApprover('');
        try {
            const approversData = await getUsersByRole('APPROVER');
            setApprovers(approversData);
            setShowFindingsModal(true);
        } catch (err) {
            setError(`Failed to load approvers: ${err.message}`);
        }
    };

    const handleFindingsSubmit = async () => {
        if (!remarks || !selectedApprover || !responseNeeded) {
            setError('Please enter findings, select an approver, and select response needed');
            return;
        }
        try {
            const supportingDocument = document.getElementById('supportingDocument').files[0];
            await submitFindings(selectedTask.id, remarks, selectedApprover, responseNeeded, supportingDocument);
            setSuccess('Findings submitted successfully');
            setShowFindingsModal(false);
            // setFindings('');
            setRemarks('');
            setResponseNeeded('Pending');
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
        setReasonOfRejection('');
        setError('');
        setShowFindingsModal(true);
    };

    const handleRejectSubmit = async () => {
        if (!reasonOfRejection) {
            setError('Please provide a reason for rejection');
            return;
        }
        try {
            const rejectionDocument = document.getElementById('rejectionDocument').files[0];
            await rejectReport(selectedTask.id, reasonOfRejection, rejectionDocument);
            setSuccess('Report rejected successfully');
            setShowFindingsModal(false);
            setReasonOfRejection('');
            await fetchMyTasks();
        } catch (err) {
            setError(`Failed to reject report: ${err.message}`);
        }
    };

    const handleDetails = (task) => {
        setSelectedTask(task);
        console.log('Opening details modal for task:', JSON.stringify(task, null, 2));
        setShowDetailsModal(true);
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
                            <th>Date</th>
                            <th>Status</th>
                            <th>Organization</th>
                            <th>Budget Year</th>
                            <th>Report Type</th>
                            <th>Auditor</th>
                            {/* <th>Response Needed</th> */}
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.map(task => (
                            <tr key={task.id}>
                                <td>{task.createdDate ? new Date(task.createdDate).toLocaleDateString() : 'N/A'}</td>
                                <td>{task.reportstatus || 'N/A'}</td>
                                <td>{task.orgname || 'N/A'}</td>
                                <td>{task.fiscalYear || 'N/A'}</td>
                                <td>{task.reportype || 'N/A'}</td>
                                <td>
                                    {task.reportstatus === 'Assigned' ?
                                        (task.assignedAuditorUsername || 'N/A') :
                                        (task.submittedByAuditorUsername || 'N/A')}
                                </td>
                                {/* <td>{task.responseNeeded || 'N/A'}</td> */}
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
                                            onClick={() => handleDownload(task.id, task.supportingDocname, task.supportingDocname, 'supporting')}
                                        >
                                            Findings
                                        </button>
                                    )}
                                    <button
                                        className="btn btn-info mr-2"
                                        onClick={() => handleDetails(task)}
                                    >
                                        Details
                                    </button>
                                    {isSeniorAuditor && (task.reportstatus === 'Assigned' || task.reportstatus === 'Rejected') && (
                                        <button
                                            className="btn btn-secondary mr-2"
                                            onClick={() => handleSubmitFindings(task)}
                                        >
                                            {task.reportstatus === 'Rejected' ? 'Resubmit' : 'Evaluate'}
                                        </button>
                                    )}
                                    {isApprover && (task.reportstatus === 'Under Review' || task.reportstatus === 'Corrected') && (
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
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Findings/Rejection Modal */}
            {showFindingsModal && (
                <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{isSeniorAuditor ? 'Submit Findings' : 'Reject Report'}</h5>
                                <button type="button" className="btn-close" onClick={() => setShowFindingsModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                {isSeniorAuditor ? (
                                    <>
                                        <div className="form-group">
                                            <label htmlFor="remarks">Findings:</label>
                                            <textarea
                                                className="form-control"
                                                id="remarks"
                                                value={remarks}
                                                onChange={(e) => setRemarks(e.target.value)}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="responseNeeded">Response Needed:</label>
                                            <select
                                                className="form-control"
                                                id="responseNeeded"
                                                value={responseNeeded}
                                                onChange={(e) => setResponseNeeded(e.target.value)}
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Yes">Yes</option>
                                                <option value="No">No</option>
                                            </select>
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
                                        <div className="form-group">
                                            <label htmlFor="supportingDocument">Attach Supporting Document (Optional):</label>
                                            <input
                                                type="file"
                                                className="form-control"
                                                id="supportingDocument"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="form-group">
                                            <label htmlFor="reasonOfRejection">Reason for Rejection:</label>
                                            <textarea
                                                className="form-control"
                                                id="reasonOfRejection"
                                                value={reasonOfRejection}
                                                onChange={(e) => setReasonOfRejection(e.target.value)}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="rejectionDocument">Attach Rejection Document (Optional):</label>
                                            <input
                                                type="file"
                                                className="form-control"
                                                id="rejectionDocument"
                                            />
                                        </div>
                                    </>
                                )}
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

            {/* Approval Modal */}
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

            {/* Details Modal */}
            {showDetailsModal && selectedTask && (
                <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Task Details</h5>
                                <button type="button" className="btn-close" onClick={() => setShowDetailsModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-6">
                                        <p><strong>Date:</strong> {selectedTask.createdDate ? new Date(selectedTask.createdDate).toLocaleDateString() : 'N/A'}</p>
                                        <p><strong>Status:</strong> {selectedTask.reportstatus || 'N/A'}</p>
                                        <p><strong>Organization:</strong> {selectedTask.orgname || 'N/A'}</p>
                                        <p><strong>Budget Year:</strong> {selectedTask.fiscalYear || 'N/A'}</p>
                                        <p><strong>Created By:</strong> {selectedTask.createdBy || 'N/A'}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <p><strong>Report Type:</strong> {selectedTask.reportype || 'N/A'}</p>
                                        <p><strong>Auditor:</strong> {selectedTask.submittedByAuditorUsername || selectedTask.assignedAuditorUsername || 'N/A'}</p>
                                        <p><strong>Response Needed:</strong> {selectedTask.responseNeeded || 'N/A'}</p>
                                        {/* <p><strong>Document Name:</strong> {selectedTask.docname || 'N/A'}</p> */}
                                        <p><strong>Archiver:</strong> {selectedTask.assignedByUsername || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="row mt-3">
                                    <div className="col-12">
                                        <p><strong>Findings:</strong> {selectedTask.remarks || 'No findings available'}</p>
                                        {selectedTask.reasonOfRejection && (
                                            <p><strong>Reason for Rejection:</strong> {selectedTask.reasonOfRejection}</p>
                                        )}
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

export default AuditorTasks;