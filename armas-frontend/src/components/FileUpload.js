import React, { useState, useEffect } from 'react';
import { getDocuments, uploadFile } from '../file/upload_download';

const FileUpload = ({ onUploadSuccess }) => {
    const [formData, setFormData] = useState({
        reportcategory: 'Report',
        fiscal_year: '',
        transactiondocumentid: '',
    });
    const [file, setFile] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const budgetYears = ['2020', '2021', '2022', '2023', '2024', '2025'];

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const docs = await getDocuments();
                console.log('Documents fetched:', docs);
                setDocuments(docs);
                if (docs.length > 0) {
                    setFormData(prev => ({ ...prev, transactiondocumentid: docs[0].id }));
                }
            } catch (err) {
                console.error('Failed to load documents:', err.message, err.response?.status, err.response?.data);
                setError(`Failed to load report types: ${err.message}`);
            }
        };
        fetchDocuments();
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

        try {
            await uploadFile(file, formData.reportcategory, formData.fiscal_year, formData.transactiondocumentid);
            setSuccess('File uploaded successfully');
            setFile(null);
            e.target.reset();
            if (onUploadSuccess) onUploadSuccess();
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'File upload failed';
            setError(`File upload failed: ${errorMessage}`);
        }
    };

    return (
        <div className="container mt-5">
            <h2>Upload File</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Type</label>
                    <select className="form-select" name="reportcategory" value={formData.reportcategory} onChange={handleChange}>
                        <option value="Report">Report</option>
                        <option value="Feedback">Feedback</option>
                    </select>
                </div>
                <div className="mb-3">
                    <label className="form-label">Budget Year</label>
                    <select className="form-select" name="fiscal_year" value={formData.fiscal_year} onChange={handleChange} required>
                        <option value="">Select Budget Year</option>
                        {budgetYears.map(year => <option key={year} value={year}>{year}</option>)}
                    </select>
                </div>
                <div className="mb-3">
                    <label className="form-label">Report Type</label>
                    <select className="form-select" name="transactiondocumentid" value={formData.transactiondocumentid} onChange={handleChange} required>
                        <option value="">Select Report Type</option>
                        {documents.map(doc => <option key={doc.id} value={doc.id}>{doc.reportype}</option>)}
                    </select>
                </div>
                <div className="mb-3">
                    <label className="form-label">Choose File</label>
                    <input type="file" className="form-control" onChange={handleFileChange} required />
                </div>
                <button type="submit" className="btn btn-primary">Submit</button>
            </form>
        </div>
    );
};

export default FileUpload;