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
    TableContainer, Box, Table, TableHead, 
    TableRow, TableCell, TableBody, Button
  } 
    from '@mui/material';
import Paper from '@mui/material/Paper';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axiosInstance from '../../axiosConfig';

export default function Brand() {

    const [brands, setBrands] = useState([])
    const [page, setPage] = useState(0);  // Current page index
    const [rowsPerPage, setRowsPerPage] = useState(5);  // Number of rows per page
    const [filterText, setFilterText] = useState("");
    const [deleteId, setDeleteId] = useState(null)
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // 'success' or 'warning'
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
    const [openAddEdit, setOpenAddEdit] = useState(false)
    const [openDetails, setOpenDetails] = useState(false)
    const [currentBrand, setCurrentBrand] = useState({
      title: '',
      summary: '',
      content: '',
      created_at: new Date().toISOString(),  // Set current datetime
      updated_at: new Date().toISOString()
    })
    const [formMode, setFormMode] = useState('')
   
    // Display the initial list
    useEffect(() => {
      axiosInstance.get('/brands').then((response) => {
          setBrands(response.data)
      })
      .catch((error) => {
          console.error("There was an error fetching the Brands:", error);
      });
    }, [])

    const handleConfirmDeleteOpen = (id) => {
        setDeleteId(id)
        setConfirmDeleteOpen(true)
    }
    const handleConfirmDeleteClose = (id) => {
        setDeleteId(null)
        setConfirmDeleteOpen(false)
    }
    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };
    const handleDeleteBrand = async (id) => {
        try {
          setSnackbarOpen(true);
    
          await axiosInstance.delete(`/brand/${id}`);
          setBrands((brands) => brands.filter((brand) => brand.id !== id));
    
          setSnackbarMessage('The selected brand has been deleted successfully!');
          setSnackbarSeverity('success');
          
          handleConfirmDeleteClose();
        } catch (error) {
          console.error('Error occurred deleting the brand: ', error);
          setSnackbarMessage('There was an error deleting the brand! Please try again.');
          setSnackbarSeverity('warning');
          setSnackbarOpen(true);
        }
    };

  const clearForm = () => {
    setCurrentBrand({
      title: '',
      summary: '',
      content: '',
      created_at: new Date().toISOString()  // Set current datetime
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

    const handleOpenEdit = (brand) => {
      setCurrentBrand(brand); 
      setFormMode('edit');
      setOpenAddEdit(true);
    };

    const handleOpenDetails = (brand) => {
      setCurrentBrand(brand);
      setOpenDetails(true);
    };

    const handleChangeAdd = (e) => {
      setCurrentBrand({...currentBrand, [e.target.id]: e.target.value});
    }

    const handleAddBrand = async () => {
      try {
          setSnackbarOpen(true)
          const response = await axiosInstance.post('/brands', {
              ...currentBrand,
              createdAt: new Date().toISOString()  // Set current datetime
          })
          setBrands([...brands, response.data])
          clearForm();
          setSnackbarMessage('Brand was added successfully!');
          setSnackbarSeverity('success');
          handleCloseAddEdit();
      }catch(error){
          console.log('There was an error adding the brand!', error)
          setSnackbarMessage('There was an error deleting the brand! Please try again.');
          setSnackbarSeverity('warning');
          setSnackbarOpen(true);
      }
    }

    const handleEditBrand = async () => {
      setSnackbarOpen(true)
      try {
          const response = await axiosInstance.put(`/brand/${currentBrand.id}`, {
              ...currentBrand,
              updatedAt: new Date().toISOString(),  // Set current datetime
          })
          setBrands(brands.map(brand =>
              brand.id === currentBrand.id ? response.data : brand
          ));

          clearForm();
          setSnackbarMessage('Brand was updated successfully!');
          setSnackbarSeverity('success');
          handleCloseAddEdit();
      }catch(error){
          console.log('There was an error adding the Brand!', error)
          setSnackbarMessage('There was an error updating the brand! Please try again.');
          setSnackbarSeverity('warning');
      }
    }
    // Handle page change
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    // Handle rows per page change
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);  // Reset to the first page whenever rows per page changes
    };

    const handleFilterChange = (event) => {
        setFilterText(event.target.value);
        setPage(0); // Reset to the first page when filtering
    };

  // Ensure brands is an array before filtering
  const filteredBrands = brands.filter(brand =>
  brand.title.toLowerCase().includes(filterText.toLowerCase()) ||
  brand.summary.toLowerCase().includes(filterText.toLowerCase())
  );
  
  return (
    <div>
      <CRow>
          <CCol xs={12}>
              <CCard className="mb-4">
              <CCardHeader>
                  <strong>React Table</strong> <small>Basic example</small>
              </CCardHeader>
              <CCardBody>         
                  {filteredBrands != null?  
                      <TableContainer> 
                          <Box display="flex" justifyContent="flex-start">
                              <Button variant='contained' onClick={handleOpenAddEdit}>New Brand</Button>
                          </Box>
                          <Box display="flex" 
                            justifyContent="flex-end"  
                            sx={{ padding: '6px' }}>
                              <TextField
                                  width="40%"
                                  label="Search Brands"
                                  variant="outlined"
                                  value={filterText}
                                  onChange={handleFilterChange}
                                  sx={{ padding: '0px' }}
                              />
                          </Box>
                          <Table 
                            sx={{ fontSize: '2rem', '& td':{fontSize: '1rem'}, '& th': { fontWeight: 'bold', fontSize: '1rem', backgroundColor: '#f5f5f5' }, '& tr:nth-of-type(odd)': { backgroundColor: '#f9f9f9' } }}>
                          <TableHead>
                              <TableRow>
                                  <TableCell scope="col">#</TableCell>
                                  <TableCell scope="col">Brand Name</TableCell>
                                  <TableCell scope="col">Description</TableCell>
                                  <TableCell scope="col">Date Added</TableCell>
                                  <TableCell scope="col"></TableCell>
                              </TableRow>
                          </TableHead>
                          <TableBody>
                              { filteredBrands.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((brand, index) => (
                                  <TableRow key={index + 1}>
                                      <TableCell scope="row">{page * rowsPerPage + index + 1}</TableCell>
                                      <TableCell>{brand.title}</TableCell>
                                      <TableCell>{brand.summary}</TableCell>
                                      <TableCell>
                                      {new Date(brand.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} | {' '}
                                      {new Date(brand.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                                      </TableCell>
                                      <TableCell>
                                      <Box display="flex" justifyContent="flex-end">
                                          <Button
                                              variant="contained"
                                              color="success"
                                              size="small"
                                              startIcon={<VisibilityIcon />}
                                              onClick={() => handleOpenDetails(brand)}
                                              style={{ marginRight: '8px' }}
                                          >
                                              Details
                                          </Button>
                                          <Button
                                              variant="contained"
                                              color="primary"
                                              size="small"
                                              startIcon={<EditIcon />}
                                              onClick={() => handleOpenEdit(brand)}
                                              style={{ marginRight: '8px' }}
                                          >
                                              Edit
                                          </Button>
                                          <Button
                                              variant="contained"
                                              color="error"
                                              size="small"
                                              startIcon={<DeleteIcon />}
                                              onClick={() => handleConfirmDeleteOpen(brand.id)}
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
                              count={brands.length}
                              page={page}
                              onPageChange={handleChangePage}
                              rowsPerPage={rowsPerPage}
                              onRowsPerPageChange={handleChangeRowsPerPage}
                              rowsPerPageOptions={[5, 10, 25]}  // Options for rows per page
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
      maxWidth="sm" // Options: 'xs', 'sm', 'md', 'lg', 'xl', false
      fullWidth      
      open={confirmDeleteOpen} 
      onClose={handleConfirmDeleteClose}
      TransitionComponent={Fade}
      TransitionProps={{ timeout: 800 }} // Adjust the timeout value as needed
    >
      <DialogTitle>Confirm Deletion</DialogTitle>
      <DialogContent>
        Are you sure you want to delete this brand?
      </DialogContent>
      <DialogActions>
        <Button onClick={handleConfirmDeleteClose} color="primary">
          Cancel
        </Button>
        <Button
          onClick={() => {
            handleDeleteBrand(deleteId);
          }}
          color="warning"
          variant="contained"
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
    
    {/* Modal Dialog for Add and Edit Brand */}
    <Dialog 
      open={openAddEdit} 
      onClose={handleCloseAddEdit}
      TransitionComponent={Fade}
      TransitionProps={{ timeout: 800 }} // Adjust the timeout value as needed
      maxWidth="md"
    >
        <DialogTitle>{formMode =='new'? 'Add New brand': "Edit brand"}</DialogTitle>
        <hr></hr>
        <DialogContent>
          <CForm className="row g-3">
              <CCol xs={12}>
                <CFormLabel htmlFor="inputTitle">Title</CFormLabel>
                <CFormInput id="title" onChange={handleChangeAdd} type='text' value={currentBrand.title} placeholder="Enter brand title" />
              </CCol>
              <CCol xs={12}>
                <CFormLabel htmlFor="inputSummary">Summary</CFormLabel>
                <CFormInput id="summary" value={currentBrand.summary} onChange={handleChangeAdd} placeholder="Summary" />
              </CCol>
              <CCol xs={12}>
                <CFormLabel htmlFor="inputContent">Content</CFormLabel>
                <CFormInput id="content" value={currentBrand.content} onChange={handleChangeAdd} placeholder="Content" />
              </CCol>
          </CForm>
        </DialogContent>
        <hr></hr>
        <DialogActions>
          <Button onClick={handleCloseAddEdit} color="primary">
            Cancel
          </Button>
          <Button onClick={formMode == 'new'? handleAddBrand : handleEditBrand} color="primary" variant="contained">
            {formMode == 'edit'? 'Update brand': 'Add brand'}
          </Button>
        </DialogActions>
    </Dialog>

    {/* Modal Dialog for Viewing Details of a brand */}
    <Dialog 
      open={openDetails} 
      onClose={handleCloseDetails}
      TransitionComponent={Fade}
      TransitionProps={{ timeout: 800 }} // Adjust the timeout value as needed
      maxWidth="md"
    >
        <DialogTitle>Brand Details</DialogTitle>
        <hr></hr>
        <DialogContent>
          <CForm className="row g-3">
              <CCol md={6}>
                <CFormLabel htmlFor="inputEmail4">Brand Id</CFormLabel>
                <CFormInput value={currentBrand.id} readOnly={true}></CFormInput>
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="inputSubCatetory">Acquistion Date</CFormLabel>
                <CFormInput 
                  value= {new Date(currentBrand.createdAt).toLocaleDateString()} readOnly={true}
                >
                </CFormInput>
              </CCol>
              <CCol xs={12}>
                <CFormLabel htmlFor="inputTitle">Title</CFormLabel>
                <CFormInput id="title" readOnly={true} type='text' value={currentBrand.title} placeholder="Enter Brand title" />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="inputEmail4">Catetory</CFormLabel>
                het
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="inputSubCatetory">SubCatetory</CFormLabel>
                hey
              </CCol>
              <CCol xs={12}>
                <CFormLabel htmlFor="inputSummary">Summary</CFormLabel>
                <CFormInput id="summary" value={currentBrand.summary} readOnly={true} placeholder="Summary" />
              </CCol>
              <CCol xs={12}>
                <CFormLabel htmlFor="inputContent">Content</CFormLabel>
                <CFormInput id="content" value={currentBrand.content} readOnly={true} placeholder="Content" />
              </CCol>
          </CForm>
        </DialogContent>
        <hr></hr>
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
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }} // Positioning the snackbar at the top-right
    >
      <Alert 
        onClose={handleSnackbarClose} 
        severity={snackbarSeverity} 
        sx={{
          display: 'flex',
          alignItems: 'center',
          minWidth: '250px',
          minHeight: '90px', // Increase the height of the snackbar
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