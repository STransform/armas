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

export const submitFindings = async (transactionId, findings, approverUsername) => {
    try {
        console.log('Submitting findings:', { transactionId, findings, approverUsername });
        const response = await axiosInstance.post(
            `/transactions/submit-findings/${transactionId}`,
            null,
            {
                params: {
                    findings,
                    approverUsername
                }
            }
        );
        console.log('Submit findings response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error submitting findings:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });
        throw error;
    }
};


export const approveReport = async (transactionId) => {
    try {
        console.log('Approving report: transactionId=', transactionId);
        const response = await axiosInstance.post(`/transactions/approve/${transactionId}`);
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

export const rejectReport = async (transactionId, auditorUsername) => {
    try {
        console.log('Rejecting report: transactionId=', transactionId, 'auditorUsername=', auditorUsername);
        const response = await axiosInstance.post(
            `/transactions/reject/${transactionId}`,
            null,
            {
                params: { auditorUsername }
            }
        );
        console.log('Reject report response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error rejecting report:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });
        throw error;
    }
};

export const getMyTasks = async () => {
    try {
        console.log('Fetching tasks');
        const response = await axiosInstance.get('/transactions/tasks');
        console.log('Tasks response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching tasks:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });
        throw error;
    }
};