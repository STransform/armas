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

export const uploadFile = async (file, reportstatus, fiscal_year, transactiondocumentid) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('reportstatus', reportstatus);
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
    const response = await axiosInstance.get('/transactions/sent-reports');
    return response.data;
};

export const downloadFile = async (id) => {
    const response = await axiosInstance.get(`/transactions/download/${id}`, {
        responseType: 'blob',
    });
    return response;
};