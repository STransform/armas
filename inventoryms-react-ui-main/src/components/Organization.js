import React, { useEffect, useState } from 'react'
import {
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CRow,
    CForm,
    CFormLabel,
    CFormInput
} from '@coreui/react'
import {
    TextField,
    Dialog,
    Snackbar,
    Alert,
    Fade,
    DialogTitle,
    DialogContent,
    DialogActions,
    TablePagination,
    TableContainer,
    Box,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Button
} from '@mui/material'
import VisibilityIcon from '@mui/icons-material/Visibility'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import axiosInstance from "../../axiosConfig";

export default function Organization() {
    const [organizations, setOrganizations] = useState([])
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(5)
    const [filterText, setFilterText] = useState('')
    const [deleteId, setDeleteId] = useState(null)
    const [snackbarOpen, setSnackbarOpen] = useState(false)
    const [snackbarMessage, setSnackbarMessage] = useState('')
    const [snackbarSeverity, setSnackbarSeverity] = useState('success')
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
    const [openAddEdit, setOpenAddEdit] = useState(false)
    const [openDetails, setOpenDetails] = useState(false)
    const [currentOrganization, setCurrentOrganization] = useState({
        id: '',
        orgname: '',
        email: '',
        telephone: '',
        organizationhead: '',
        orgtype: ''
    })
    const [formMode, setFormMode] = useState('')

    // Fetch organizations on component mount
    useEffect(() => {
        axiosInstance.get('/api/organizations')
            .then((response) => {
                setOrganizations(response.data)
            })
            .catch((error) => {
                console.error('There was an error fetching the Organizations:', error)
            })
    }, [])

    const handleConfirmDeleteOpen = (id) => {
        setDeleteId(id)
        setConfirmDeleteOpen(true)
    }

    const handleConfirmDeleteClose = () => {
        setDeleteId(null)
        setConfirmDeleteOpen(false)
    }

    const handleSnackbarClose = () => {
        setSnackbarOpen(false)
    }

    const handleDeleteOrganization = async (id) => {
        try {
            setSnackbarOpen(true)
            await axiosInstance.delete(`/api/organizations/${id}`)
            setOrganizations((organizations) => organizations.filter((org) => org.id !== id))
            setSnackbarMessage('The selected organization has been deleted successfully!')
            setSnackbarSeverity('success')
            handleConfirmDeleteClose()
        } catch (error) {
            console.error('Error occurred deleting the organization: ', error)
            setSnackbarMessage('There was an error deleting the organization! Please try again.')
            setSnackbarSeverity('warning')
            setSnackbarOpen(true)
        }
    }

    const clearForm = () => {
        setCurrentOrganization({
            id: '',
            orgname: '',
            email: '',
            telephone: '',
            organizationhead: '',
            orgtype: ''
        })
    }

    const handleOpenAddEdit = () => {
        setFormMode('new')
        clearForm()
        setOpenAddEdit(true)
    }

    const handleCloseAddEdit = () => {
        setOpenAddEdit(false)
    }

    const handleCloseDetails = () => {
        setOpenDetails(false)
    }

    const handleOpenEdit = (organization) => {
        setCurrentOrganization(organization)
        setFormMode('edit')
        setOpenAddEdit(true)
    }

    const handleOpenDetails = (organization) => {
        setCurrentOrganization(organization)
        setOpenDetails(true)
    }

    const handleChangeAdd = (e) => {
        setCurrentOrganization({ ...currentOrganization, [e.target.id]: e.target.value })
    }

    const handleAddOrganization = async () => {
        try {
            setSnackbarOpen(true)
            const response = await axiosInstance.post('/api/organizations', currentOrganization)
            setOrganizations([...organizations, response.data])
            clearForm()
            setSnackbarMessage('Organization was added successfully!')
            setSnackbarSeverity('success')
            handleCloseAddEdit()
        } catch (error) {
            console.log('There was an error adding the organization!', error)
            setSnackbarMessage('There was an error adding the organization! Please try again.')
            setSnackbarSeverity('warning')
            setSnackbarOpen(true)
        }
    }

    const handleEditOrganization = async () => {
        setSnackbarOpen(true)
        try {
            const response = await axiosInstance.put(`/api/organizations/${currentOrganization.id}`, currentOrganization)
            setOrganizations(organizations.map(org =>
                org.id === currentOrganization.id ? response.data : org
            ))
            clearForm()
            setSnackbarMessage('Organization was updated successfully!')
            setSnackbarSeverity('success')
            handleCloseAddEdit()
        } catch (error) {
            console.log('There was an error updating the organization!', error)
            setSnackbarMessage('There was an error updating the organization! Please try again.')
            setSnackbarSeverity('warning')
        }
    }

    const handleChangePage = (event, newPage) => {
        setPage(newPage)
    }

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10))
        setPage(0)
    }

    const handleFilterChange = (event) => {
        setFilterText(event.target.value)
        setPage(0)
    }

    const filteredOrganizations = organizations.filter(org =>
        org.orgname.toLowerCase().includes(filterText.toLowerCase()) ||
        org.email.toLowerCase().includes(filterText.toLowerCase())
    )

    return (
        <div>
            <CRow>
                <CCol xs={12}>
                    <CCard className="mb-4">
                        <CCardHeader>
                            <strong>Organizations</strong>
                        </CCardHeader>
                        <CCardBody>
                            {filteredOrganizations != null ?
                                <TableContainer>
                                    <Box display="flex" justifyContent="flex-start">
                                        <Button variant='contained' onClick={handleOpenAddEdit}>New Organization</Button>
                                    </Box>
                                    <Box display="flex" justifyContent="flex-end" sx={{ padding: '6px' }}>
                                        <TextField
                                            width="40%"
                                            label="Search Organizations"
                                            variant="outlined"
                                            value={filterText}
                                            onChange={handleFilterChange}
                                            sx={{ padding: '0px' }}
                                        />
                                    </Box>
                                    <Table sx={{
                                        fontSize: '2rem',
                                        '& td': { fontSize: '1rem' },
                                        '& th': { fontWeight: 'bold', fontSize: '1rem', backgroundColor: '#f5f5f5' },
                                        '& tr:nth-of-type(odd)': { backgroundColor: '#f9f9f9' }
                                    }}>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell scope="col">#</TableCell>
                                                <TableCell scope="col">Organization Name</TableCell>
                                                <TableCell scope="col">Email</TableCell>
                                                <TableCell scope="col">Telephone</TableCell>
                                                <TableCell scope="col">Organization Head</TableCell>
                                                <TableCell scope="col">Type</TableCell>
                                                <TableCell scope="col"></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredOrganizations.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((org, index) => (
                                                <TableRow key={org.id}>
                                                    <TableCell scope="row">{page * rowsPerPage + index + 1}</TableCell>
                                                    <TableCell>{org.orgname}</TableCell>
                                                    <TableCell>{org.email}</TableCell>
                                                    <TableCell>{org.telephone}</TableCell>
                                                    <TableCell>{org.organizationhead}</TableCell>
                                                    <TableCell>{org.orgtype}</TableCell>
                                                    <TableCell>
                                                        <Box display="flex" justifyContent="flex-end">
                                                            <Button
                                                                variant="contained"
                                                                color="success"
                                                                size="small"
                                                                startIcon={<VisibilityIcon />}
                                                                onClick={() => handleOpenDetails(org)}
                                                                style={{ marginRight: '8px' }}
                                                            >
                                                                Details
                                                            </Button>
                                                            <Button
                                                                variant="contained"
                                                                color="primary"
                                                                size="small"
                                                                startIcon={<EditIcon />}
                                                                onClick={() => handleOpenEdit(org)}
                                                                style={{ marginRight: '8px' }}
                                                            >
                                                                Edit
                                                            </Button>
                                                            <Button
                                                                variant="contained"
                                                                color="error"
                                                                size="small"
                                                                startIcon={<DeleteIcon />}
                                                                onClick={() => handleConfirmDeleteOpen(org.id)}
                                                            >
                                                                Delete
                                                            </Button>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    <TablePagination
                                        sx={{
                                            ".MuiTablePagination-displayedRows, .MuiTablePagination-selectLabel": {
                                                "marginTop": "1em",
                                                "marginBottom": "1em"
                                            }
                                        }}
                                        component="div"
                                        count={filteredOrganizations.length}
                                        page={page}
                                        onPageChange={handleChangePage}
                                        rowsPerPage={rowsPerPage}
                                        onRowsPerPageChange={handleChangeRowsPerPage}
                                        rowsPerPageOptions={[5, 10, 25]}
                                    />
                                </TableContainer>
                                :
                                <div>Loading...</div>
                            }
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>

            {/* Confirmation Dialog for Deletion */}
            <Dialog
                maxWidth="sm"
                fullWidth
                open={confirmDeleteOpen}
                onClose={handleConfirmDeleteClose}
                TransitionComponent={Fade}
                TransitionProps={{ timeout: 800 }}
            >
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete this organization?
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleConfirmDeleteClose} color="primary">
                        Cancel
                    </Button>
                    <Button
                        onClick={() => handleDeleteOrganization(deleteId)}
                        color="warning"
                        variant="contained"
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal Dialog for Add and Edit Organization */}
            <Dialog
                open={openAddEdit}
                onClose={handleCloseAddEdit}
                TransitionComponent={Fade}
                TransitionProps={{ timeout: 800 }}
                maxWidth="md"
            >
                <DialogTitle>{formMode === 'new' ? 'Add New Organization' : 'Edit Organization'}</DialogTitle>
                <hr />
                <DialogContent>
                    <CForm className="row g-3">
                        <CCol xs={12}>
                            <CFormLabel htmlFor="id">ID</CFormLabel>
                            <CFormInput id="id" onChange={handleChangeAdd} type="text" value={currentOrganization.id} placeholder="Enter organization ID" />
                        </CCol>
                        <CCol xs={12}>
                            <CFormLabel htmlFor="orgname">Organization Name</CFormLabel>
                            <CFormInput id="orgname" value={currentOrganization.orgname} onChange={handleChangeAdd} placeholder="Organization Name" />
                        </CCol>
                        <CCol xs={12}>
                            <CFormLabel htmlFor="email">Email</CFormLabel>
                            <CFormInput id="email" value={currentOrganization.email} onChange={handleChangeAdd} placeholder="Email" />
                        </CCol>
                        <CCol xs={12}>
                            <CFormLabel htmlFor="telephone">Telephone</CFormLabel>
                            <CFormInput id="telephone" value={currentOrganization.telephone} onChange={handleChangeAdd} placeholder="Telephone" />
                        </CCol>
                        <CCol xs={12}>
                            <CFormLabel htmlFor="organizationhead">Organization Head</CFormLabel>
                            <CFormInput id="organizationhead" value={currentOrganization.organizationhead} onChange={handleChangeAdd} placeholder="Organization Head" />
                        </CCol>
                        <CCol xs={12}>
                            <CFormLabel htmlFor="orgtype">Organization Type</CFormLabel>
                            <CFormInput id="orgtype" value={currentOrganization.orgtype} onChange={handleChangeAdd} placeholder="Organization Type" />
                        </CCol>
                    </CForm>
                </DialogContent>
                <hr />
                <DialogActions>
                    <Button onClick={handleCloseAddEdit} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={formMode === 'new' ? handleAddOrganization : handleEditOrganization} color="primary" variant="contained">
                        {formMode === 'edit' ? 'Update Organization' : 'Add Organization'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal Dialog for Viewing Details of an Organization */}
            <Dialog
                open={openDetails}
                onClose={handleCloseDetails}
                TransitionComponent={Fade}
                TransitionProps={{ timeout: 800 }}
                maxWidth="md"
            >
                <DialogTitle>Organization Details</DialogTitle>
                <hr />
                <DialogContent>
                    <CForm className="row g-3">
                        <CCol md={6}>
                            <CFormLabel htmlFor="id">Organization ID</CFormLabel>
                            <CFormInput value={currentOrganization.id} readOnly={true} />
                        </CCol>
                        <CCol md={6}>
                            <CFormLabel htmlFor="orgname">Organization Name</CFormLabel>
                            <CFormInput value={currentOrganization.orgname} readOnly={true} />
                        </CCol>
                        <CCol md={6}>
                            <CFormLabel htmlFor="email">Email</CFormLabel>
                            <CFormInput value={currentOrganization.email} readOnly={true} />
                        </CCol>
                        <CCol md={6}>
                            <CFormLabel htmlFor="telephone">Telephone</CFormLabel>
                            <CFormInput value={currentOrganization.telephone} readOnly={true} />
                        </CCol>
                        <CCol md={6}>
                            <CFormLabel htmlFor="organizationhead">Organization Head</CFormLabel>
                            <CFormInput value={currentOrganization.organizationhead} readOnly={true} />
                        </CCol>
                        <CCol md={6}>
                            <CFormLabel htmlFor="orgtype">Organization Type</CFormLabel>
                            <CFormInput value={currentOrganization.orgtype} readOnly={true} />
                        </CCol>
                    </CForm>
                </DialogContent>
                <hr />
                <DialogActions>
                    <Button onClick={handleCloseDetails} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar Notification */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={snackbarSeverity}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        minWidth: '250px',
                        minHeight: '90px',
                        boxShadow: '4px 4px 6px rgba(0, 0, 0, 0.1)',
                        borderRadius: '8px',
                        overflow: 'hidden',
                    }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </div>
    )
}