import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, TablePagination, Box,
  TextField, InputAdornment, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, Snackbar, Alert, IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Header from './Header';
import { useNavigate } from 'react-router-dom';
import FinField from './input_types/FinField';

//const API_URL = 'http://localhost:4000/api'; // Change as needed
const API_URL = `${process.env.REACT_APP_API_URL}/api`;
export default function EntitiesPage({ user, onLogout, onHome }) {
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [state, setState] = useState({ name: '', address: '', contact_person: '', contact_no: '', email: '', ipwis_no: '' });
  const [successMessage, setSuccessMessage] = useState('');
  const rowsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    fetchEntities();
  }, []);

  const fetchEntities = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/entities`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        onLogout(); // Force logout if token expired
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch entities');
      const data = await res.json();
      setEntities(data);
    } catch {
      localStorage.removeItem('token');
      setEntities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleEditClick = (entity) => {
    setSelectedEntity(entity);
    setState({
      name: entity.name,
      address: entity.address,
      contact_person: entity.contact_person,
      contact_no: entity.contact_no,
      ipwis_no: entity.ipwis_no
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedEntity) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/entities/${selectedEntity.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(state)
      });
      if (res.status === 401) {
        onLogout(); // Force logout if token expired
        return;
      }
      if (!res.ok) throw new Error('Update failed');
      await fetchEntities();
      setSuccessMessage(`Entity ${state.name} updated successfully.`);
      setEditModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (entity) => {
    setSelectedEntity(entity);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedEntity) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/entities/${selectedEntity.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        onLogout(); // Force logout if token expired
        return;
      }
      if (!res.ok) throw new Error('Delete failed');
      await fetchEntities();
      setSuccessMessage(`Entity ${selectedEntity.name} deleted successfully.`);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteConfirmOpen(false);
      setSelectedEntity(null);
      setLoading(false);
    }
  };

  const filteredEntities = entities.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedEntities = filteredEntities.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleFieldChange = (field) => (e) => {
    setState((prev) => ({ ...prev, [field]: e.value }));
  };

  return (
    <>
    <Snackbar
        open={!!successMessage}
        autoHideDuration={5000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
        <Alert
            severity="success"
            variant="filled"
            onClose={() => setSuccessMessage('')}
            sx={{
            width: '100%',
            fontWeight: 'bold',
            fontSize: '1rem',
            }}
        >
            {successMessage}
        </Alert>
    </Snackbar>
      {loading && (
        <Box sx={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          bgcolor: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1300
        }}>
          <CircularProgress size={80} thickness={5} />
        </Box>
      )}

      <Header user={user} onLogout={onLogout} onHome={onHome} />

      <Container sx={{ mt: -4 }}>
        <Box sx={{ py: 8, textAlign: 'center', bgcolor: '#f5f5f5' }}>
          <Container maxWidth="md">
            <Typography variant="h3" gutterBottom>Entities</Typography>
            <Typography variant="h6" color="text.secondary">Manage and search for entities</Typography>
          </Container>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <TextField
            label="Search by Entity Name"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0);
            }}
            sx={{ width: '100%', maxWidth: 400 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              )
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', overflowX: 'auto' }}>
          <TableContainer component={Paper} sx={{ mt: 2, borderRadius: 2, maxWidth: '100%' }}>
            <Box sx={{ minWidth: 900 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f0f0f0' }}>
                    {['Id', 'Type', 'Name', 'Address', 'Contact Person', 'Contact No', 'Email', 'IPWS No', 'Date Created', '']
                      .map((header, index) => (
                        <TableCell key={index} align="center" sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>
                          {header}
                        </TableCell>
                      ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedEntities.map((m, idx) => (
                    <TableRow key={idx}>
                      <TableCell align="center">{m.id}</TableCell>
                      <TableCell align="center">{m.type}</TableCell>
                      <TableCell align="center">{m.name}</TableCell>
                      <TableCell align="center">{m.address}</TableCell>
                      <TableCell align="center">{m.contact_person}</TableCell>
                      <TableCell align="center">{m.contact_no}</TableCell>
                      <TableCell align="center">{m.email}</TableCell>
                      <TableCell align="center">{m.ipwis_no}</TableCell>
                      <TableCell align="center">{m.created_at}</TableCell>
                      <TableCell align="center">
                      <Button
                        size="small"
                        onClick={() => handleEditClick(m)}
                        sx={{ minWidth: 0, padding: '4px', marginRight: 1 }}
                        aria-label="edit"
                      >
                        <EditIcon fontSize="small" />
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => {handleDeleteClick(m)}}
                        sx={{ minWidth: 0, padding: '4px' }}
                        aria-label="delete"
                      >
                        <DeleteIcon fontSize="small" />
                      </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <TablePagination
                component="div"
                count={filteredEntities.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[10]}
                labelRowsPerPage=""
              />
            </Box>
          </TableContainer>
        </Box>
        <Box
          sx={{
            position: "sticky",
            bottom: 0,
            display: "flex",
            justifyContent: "center",
            backgroundColor: "#fff",
            borderTop: "1px solid #ddd",
            py: 1,
            zIndex: 10,
          }}
        >
          <Box sx={{ width: "100%", maxWidth: 1100, textAlign: "center" }}>
            <Button variant="contained" onClick={() => navigate(-1)}>
              Back
            </Button>
          </Box>
        </Box>
      </Container>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Entity</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            variant="outlined"
            fullWidth
            value={state.name}
            onChange={(e) => setState({ ...state, name: e.target.value })}
            sx={{ mt: 2 }}
          />
          <TextField
            label="Address"
            variant="outlined"
            fullWidth
            multiline
            value={state.address}
            onChange={(e) => setState({ ...state, address: e.target.value })}
            sx={{ mt: 2 }}
          />
          <TextField
            label="Contact Person"
            variant="outlined"
            fullWidth
            value={state.contact_person}
            onChange={(e) => setState({ ...state, contact_person: e.target.value })}
            sx={{ mt: 2 }}
          />
          <FinField
            id='ContactNo'
            fullWidth
            required
            placeholder='eg. 0730000000'
            helperText='Please enter a valid contact number'
            label='Contact No'
            validationMethod='phone'
            autoComplete='mobile-number'
            value={state.contact_no}
            callback={handleFieldChange("contact_no")}
            sx={{ mt: 2 }}
          />
          <FinField
            id='Email'
            fullWidth
            required
            placeholder='eg. test@email.com'
            helperText='Please enter a valid email address'
            label='Email'
            validationMethod='email'
            value={state.email}
            callback={handleFieldChange("email")}
            sx={{ mt: 2 }}
          />
          <TextField
            label="IPWIS No"
            variant="outlined"
            fullWidth
            value={state.ipwis_no}
            onChange={(e) => setState({ ...state, ipwis_no: e.target.value })}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditModalOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Are you sure you want to delete this entity?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}