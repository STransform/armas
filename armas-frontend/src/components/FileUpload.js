import React, { useState, useEffect } from 'react';
import { CForm, CFormLabel, CFormSelect, CFormInput, CCol } from '@coreui/react';
import { Button, Alert } from '@mui/material';
import { getDocuments, uploadFile, getBudgetYears } from '../file/upload_download';

const FileUpload = ({ onUploadSuccess }) => {
    const [formData, setFormData] = useState({
        reportcategory: 'Report',
        budgetYearId: '',
        transactiondocumentid: '',
    });
    const [file, setFile] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [budgetYears, setBudgetYears] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [docs, years] = await Promise.all([getDocuments(), getBudgetYears()]);
                setDocuments(docs);
                setBudgetYears(years);
                if (docs.length > 0) {
                    setFormData(prev => ({ ...prev, transactiondocumentid: docs[0].id }));
                }
            } catch (err) {
                console.error('Failed to load data:', err.message);
                setError(`Failed to load data: ${err.message}`);
            }
        };
        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a file');
            return;
        }
        if (!formData.budgetYearId) {
            setError('Please select a budget year');
            return;
        }
        if (!formData.transactiondocumentid) {
            setError('Please select a report type');
            return;
        }

        try {
            setError('');
            setSuccess('');
            await uploadFile(file, formData.reportcategory, formData.budgetYearId, formData.transactiondocumentid);
            setSuccess('File uploaded successfully');
            setFile(null);
            setFormData({
                reportcategory: 'Report',
                budgetYearId: '',
                transactiondocumentid: documents.length > 0 ? documents[0].id : '',
            });
            e.target.reset();
            if (onUploadSuccess) onUploadSuccess(); // Trigger refresh
        } catch (err) {
            const errorMessage = err.message || 'File upload failed';
            setError(errorMessage);
            setSuccess('');
            console.log('Upload error:', errorMessage);
        }
    };
    return (
        <div className="container mt-5">
            <h2>Upload File</h2>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            <CForm className="row g-3" onSubmit={handleSubmit}>
                <CCol md={6}>
                    <CFormLabel htmlFor="reportcategory">Type</CFormLabel>
                    <CFormSelect
                        id="reportcategory"
                        name="reportcategory"
                        value={formData.reportcategory}
                        onChange={handleChange}
                    >
                        <option value="Report">Report</option>
                        <option value="Feedback">Feedback</option>
                    </CFormSelect>
                </CCol>
                <CCol md={6}>
                    <CFormLabel htmlFor="budgetYearId">Budget Year</CFormLabel>
                    <CFormSelect
                        id="budgetYearId"
                        name="budgetYearId"
                        value={formData.budgetYearId}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Budget Year</option>
                        {budgetYears.map(year => (
                            <option key={year.id} value={year.id}>
                                {year.fiscalYear}
                            </option>
                        ))}
                    </CFormSelect>
                </CCol>
                <CCol md={6}>
                    <CFormLabel htmlFor="transactiondocumentid">Report Type</CFormLabel>
                    <CFormSelect
                        id="transactiondocumentid"
                        name="transactiondocumentid"
                        value={formData.transactiondocumentid}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Report Type</option>
                        {documents.map(doc => (
                            <option key={doc.id} value={doc.id}>
                                {doc.reportype}
                            </option>
                        ))}
                    </CFormSelect>
                </CCol>
                <CCol md={6}>
                    <CFormLabel htmlFor="file">Choose File</CFormLabel>
                    <CFormInput type="file" id="file" onChange={handleFileChange} required />
                </CCol>
                <CCol xs={12}>
                    <Button type="submit" variant="contained" color="primary">
                        Submit
                    </Button>
                </CCol>
            </CForm>
        </div>
    );
};

export default FileUpload;