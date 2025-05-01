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

export const uploadFile = async (file, responseNeeded, fiscal_year, transactiondocumentid) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('response_needed', responseNeeded);
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

export const downloadFile = async (id) => {
    try {
        const response = await axiosInstance.get(`/transactions/download/${id}`, {
            responseType: 'blob',
        });
        return response;
    } catch (error) {
        console.error('Error downloading file:', error.message, error.response?.status, error.response?.data);
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
        const response = await axiosInstance.post(`/transactions/assign/${transactionId}`, null, {
            params: { auditorUsername }
        });
        return response.data;
    } catch (error) {
        console.error('Error assigning auditor:', error.message, error.response?.status, error.response?.data);
        throw error;
    }
};

export const submitFindings = async (transactionId, findings, approverUsername) => {
    try {
        const response = await axiosInstance.post(`/transactions/submit-findings/${transactionId}`, null, {
            params: { findings, approverUsername }
        });
        return response.data;
    } catch (error) {
        console.error('Error submitting findings:', error.message, error.response?.status, error.response?.data);
        throw error;
    }
};

export const approveReport = async (transactionId) => {
    try {
        const response = await axiosInstance.post(`/transactions/approve/${transactionId}`);
        return response.data;
    } catch (error) {
        console.error('Error approving report:', error.message, error.response?.status, error.response?.data);
        throw error;
    }
};

export const rejectReport = async (transactionId, auditorUsername) => {
    try {
        const response = await axiosInstance.post(`/transactions/reject/${transactionId}`, null, {
            params: { auditorUsername }
        });
        return response.data;
    } catch (error) {
        console.error('Error rejecting report:', error.message, error.response?.status, error.response?.data);
        throw error;
    }
};

export const getMyTasks = async () => {
    try {
        const response = await axiosInstance.get('/transactions/tasks');
        return response.data;
    } catch (error) {
        console.error('Error fetching tasks:', error.message, error.response?.status, error.response?.data);
        throw error;
    }
};

export const getAssignedReportsForAuditor = async (userId) => {
    try {
        const response = await axiosInstance.get('/transactions/tasks');
        return response.data.filter(report => report.user2?.id === userId && ['Assigned', 'Rejected'].includes(report.reportstatus));
    } catch (error) {
        console.error('Error fetching auditor reports:', error.message, error.response?.status, error.response?.data);
        throw error;
    }
};

export const getAssignedReportsForApprover = async (userId) => {
    try {
        const response = await axiosInstance.get('/transactions/tasks');
        return response.data.filter(report => report.user2?.id === userId && report.reportstatus === 'Under Review');
    } catch (error) {
        console.error('Error fetching approver reports:', error.message, error.response?.status, error.response?.data);
        throw error;
    }
};

export const forwardToApprover = async (transactionId, approverUsername) => {
    try {
        const response = await axiosInstance.post(`/transactions/submit-findings/${transactionId}`, null, {
            params: { findings: 'Findings submitted', approverUsername }
        });
        return response.data;
    } catch (error) {
        console.error('Error forwarding to approver:', error.message, error.response?.status, error.response?.data);
        throw error;
    }
};