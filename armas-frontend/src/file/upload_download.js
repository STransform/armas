import axiosInstance from '../axiosConfig';

export const getDocuments = async () => {
    try {
        const response = await axiosInstance.get('/transactions/listdocuments');
        return response.data;
    } catch (error) {
        console.error('Error fetching documents:', error.message, error.response?.status, error.response?.data);
        throw error;
    }
};

export const uploadFile = async (file, reportcategory, fiscal_year, transactiondocumentid) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('reportcategory', reportcategory);
    formData.append('fiscal_year', fiscal_year);
    formData.append('transactiondocumentid', transactiondocumentid);

    try {
        const response = await axiosInstance.post('/transactions/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    } catch (error) {
        console.error('Error uploading file:', error.message, error.response?.status, error.response?.data);
        throw error;
    }
};

export const getSentReports = async () => {
    try {
        const response = await axiosInstance.get('/transactions/sent-reports');
        return response.data;
    } catch (error) {
        console.error('Error fetching reports:', error.message, error.response?.status, error.response?.data);
        throw error;
    }
};

export const downloadFile = async (id, type) => {
    try {
        const response = await axiosInstance.get(`/transactions/download/${id}/${type}`, {
            responseType: 'blob',
        });
        return response;
    } catch (error) {
        console.error('Error downloading file:', error.message, error.response?.status, error.response?.data);
        throw error;
    }
};
export const getUnderReviewReports = async () => {
    try {
        const response = await axiosInstance.get('/transactions/under-review-reports');
        console.log('Under review reports response:', response.data);
        return response.data.map(report => ({
            id: report.id,
            createdDate: report.createdDate,
            reportstatus: report.reportstatus,
            organization: { orgname: report.organization ? report.organization.orgname : null },
            fiscal_year: report.fiscal_year,
            transactiondocument: { reportype: report.transactiondocument ? report.transactiondocument.reportype : null },
            docname: report.docname,
            supportingDocumentPath: report.supportingDocumentPath,
            supportingDocname: report.supportingDocname,
            remarks: report.remarks,
            submittedByAuditorUsername: report.submittedByAuditor ? report.submittedByAuditor.username : null
        }));
    } catch (error) {
        console.error('Error fetching under review reports:', error);
        throw error;
    }
};
export const getCorrectedReports = async () => {
    try {
        const response = await axiosInstance.get('/transactions/corrected-reports');
        console.log('Corrected reports response:', response.data);
        return response.data.map(report => ({
            id: report.id,
            createdDate: report.createdDate,
            reportstatus: report.reportstatus,
            organization: report.organization, // Pass the full organization object
            fiscal_year: report.fiscal_year,   // Match the JSON field name (likely fiscal_year)
            transactiondocument: report.transactiondocument, // Pass the full transactiondocument object
            docname: report.docname,
            supportingDocumentPath: report.supportingDocumentPath,
            supportingDocname: report.supportingDocname,
            remarks: report.remarks,
            submittedByAuditorUsername: report.submittedByAuditor ? report.submittedByAuditor.username : null
        }));
    } catch (error) {
        console.error('Error fetching corrected reports:', error);
        throw error;
    }
};

export const getUsersByRole = async (roleName) => {
    try {
        console.log('Fetching users for role:', roleName);
        const response = await axiosInstance.get(`/transactions/users-by-role/${roleName}`);
        console.log('Users fetched:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching users:', error.message, error.response?.status, error.response?.data);
        throw error;
    }
};

export const assignAuditor = async (transactionId, auditorUsername) => {
    try {
        console.log('Calling assignAuditor API: transactionId=', transactionId, ', auditorUsername=', auditorUsername);
        const response = await axiosInstance.post(`/transactions/assign/${transactionId}`, null, {
            params: { auditorUsername }
        });
        console.log('AssignAuditor response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error assigning auditor:', error.message, error.response?.status, error.response?.data);
        throw error;
    }
};

export const submitFindings = async (transactionId, findings, approverUsername, supportingDocument) => {
    const formData = new FormData();
    formData.append('findings', findings);
    formData.append('approverUsername', approverUsername);
    if (supportingDocument) {
        formData.append('supportingDocument', supportingDocument);
    }
    try {
        const response = await axiosInstance.post(`/transactions/submit-findings/${transactionId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    } catch (error) {
        console.error('Error submitting findings:', error.message, error.response?.status, error.response?.data);
        throw error;
    }
};


export const approveReport = async (transactionId, approvalDocument) => {
    try {
        console.log('Approving report: transactionId=', transactionId);
        const formData = new FormData();
        if (approvalDocument) {
            formData.append('approvalDocument', approvalDocument);
        }
        const response = await axiosInstance.post(`/transactions/approve/${transactionId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        console.log('Approve report response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error approving report:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });
        throw error;
    }
};

export const getApprovedReports = async () => {
    try {
        const response = await axiosInstance.get('/transactions/approved-reports');
        console.log('Approved reports response:', JSON.stringify(response.data, null, 2));
        return response.data.map(report => {
            const mappedReport = {
                id: report.id,
                createdDate: report.createdDate,
                reportstatus: report.reportstatus,
                orgname: report.orgname,
                fiscalYear: report.fiscalYear,
                reportype: report.reportype,
                docname: report.docname,
                supportingDocumentPath: report.supportingDocumentPath,
                supportingDocname: report.supportingDocname,
                submittedByAuditorUsername: report.submittedByAuditorUsername || null,
                createdBy: report.createdBy || null, // createdBy
                assignedByUsername: report.assignedByUsername || null, // assignedByUsername
                lastModifiedBy: report.lastModifiedBy || null, // lastModifiedBy
                approverUsername: report.approverUsername || null // approverUsername
            };
            console.log('Mapped report ID=' + report.id + ':', mappedReport);
            return mappedReport;
        });
    } catch (error) {
        console.error('Error fetching approved reports:', error);
        throw error;
    }
};
   export const rejectReport = async (transactionId, rejectionReason, rejectionDocument) => {
    const formData = new FormData();
    formData.append('rejectionReason', rejectionReason);
    if (rejectionDocument) {
        formData.append('rejectionDocument', rejectionDocument);
    }
    try {
        const response = await axiosInstance.post(`/transactions/reject/${transactionId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    } catch (error) {
        console.error('Error rejecting report:', error.message, error.response?.status, error.response?.data);
        throw error;
    }
};

export const getRejectedReports = async () => {
    try {
        const response = await axiosInstance.get('/transactions/rejected-reports');
        console.log('Rejected reports raw response:', JSON.stringify(response.data, null, 2));
        const mappedReports = response.data.map(report => {
            const mappedReport = {
                id: report.id,
                createdDate: report.createdDate,
                reportstatus: report.reportstatus,
                organization: { orgname: report.organization ? report.organization.orgname : null },
                fiscal_year: report.fiscal_year,
                transactiondocument: { reportype: report.transactiondocument ? report.transactiondocument.reportype : null },
                docname: report.docname,
                supportingDocumentPath: report.supportingDocumentPath,
                supportingDocname: report.supportingDocname,
                remarks: report.remarks,
                submittedByAuditorUsername: report.submittedByAuditor ? report.submittedByAuditor.username : null
            };
            console.log('Mapped report ID=' + report.id + ':', mappedReport);
            return mappedReport;
        });
        console.log('All mapped rejected reports:', mappedReports);
        return mappedReports;
    } catch (error) {
        console.error('Error fetching rejected reports:', error);
        throw error;
    }
};

export const getMyTasks = async () => {
    try {
        console.log('Fetching tasks');
        const response = await axiosInstance.get('/transactions/tasks');
        console.log('Tasks raw response:', JSON.stringify(response.data, null, 2));
        const mappedTasks = response.data.map(task => {
            const mappedTask = {
                id: task.id,
                createdDate: task.createdDate,
                reportstatus: task.reportstatus,
                orgname: task.orgname,
                fiscalYear: task.fiscalYear,
                reportype: task.reportype,
                docname: task.docname,
                supportingDocumentPath: task.supportingDocumentPath,
                supportingDocname: task.supportingDocname,
                submittedByAuditorUsername: task.submittedByAuditorUsername || null,
                assignedAuditorUsername: task.assignedAuditorUsername || null,
                createdBy: task.createdBy || null, // Add createdBy
                assignedByUsername: task.assignedByUsername || null // Add assignedByUsername
            };
            console.log('Mapped task ID=' + task.id + ':', mappedTask);
            return mappedTask;
        });
        console.log('All mapped tasks:', mappedTasks);
        return mappedTasks;
    } catch (error) {
        console.error('Error fetching tasks:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });
        throw error;
    }
};