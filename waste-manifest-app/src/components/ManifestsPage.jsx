import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TablePagination,
  Box,
  TextField,
  InputAdornment,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Header from './Header';
import { useNavigate, useLocation } from 'react-router-dom';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

//const API_URL = 'http://localhost:4000/api';//laptop
//const API_URL = 'http://192.168.18.232:4000/api';//phone
const API_URL = `${process.env.REACT_APP_API_URL}/api`;

export default function ManifestsPage({ user, onLogout, onHome }) {
  const location = useLocation();
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [manifests, setManifests] = useState([]);
  const [manifestsExports, setManifestsExports] = useState([]);
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const rowsPerPage = 10;

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

    useEffect(() => {
        setLoading(true);
    const fetchData = async () => {
        const token = localStorage.getItem('token');
        try {
        const res = await fetch(`${API_URL}/manifests`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch manifests');
        const data = await res.json();
        setManifests(data);
        } catch {
        localStorage.removeItem('token');
        setManifests([]);
        } finally{
            setLoading(false);
        }
    };

    fetchData();
    },[]);

    useEffect(() => {
        setLoading(true);
    const fetchData = async () => {
        const token = localStorage.getItem('token');
        try {
        const res = await fetch(`${API_URL}/manifests-exports`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch manifests');
        const data = await res.json();
        setManifestsExports(data);
        } catch {
        localStorage.removeItem('token');
        setManifestsExports([]);
        } finally{
            setLoading(false);
        }
    };

    fetchData();
    },[]);

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleViewPDF = (manifest) => {
    navigate(`/manifest/${manifest.id}/view`);
  };

  const filteredManifests = manifests.filter((m) => 
    m.id.includes(searchQuery.toLowerCase())
    );

    const paginatedManifests = filteredManifests.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
    );

  const handleExport = () => {
    // Only export what is currently filtered (search applied)
    const exportData = manifestsExports.map((m) => ({
      Date: new Date(m.date).toISOString().split("T")[0],
      Time: m.time,
      Transporter: m.transporter,
      Generator: m.generator,
      "Reference No.": m.reference_no,
      "Manifest No.": m.id,
      Description: m.description,
      Packaging: m.packaging,
      "Waste Type": m.waste_type,
      "Waste Form": m.waste_form,
      Volume: m.volume_l,
      "Density (kg/L)": '',
      "Weight (kg)": m.weight_kg,
      Process: m.process,
      "Final Disposal": m.final_disposal,
      "Planned Disposal Date": m.planned_disposal_date,
      "Disposal Ref. No": '',
      "Quote No,": '',
      "PO No": '',
      Comments: m.Comments
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Manifests");

    // Generate buffer
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const data = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(data, "manifests.xlsx");
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
    {loading &&
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          bgcolor: 'rgba(0, 0, 0, 0.3)', 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1300, 
        }}
      >
        <CircularProgress size={80} thickness={5} />
      </Box>}
      {/* Header */}
    <Header user={user} onLogout={onLogout} onHome={onHome} />
    <Container sx={{ mt: -4 }}>
      <Box sx={{ py: 8, textAlign: 'center', bgcolor: '#f5f5f5' }}>
        <Container maxWidth="md">
          <Typography variant="h3" gutterBottom>
            Waste Manifests
          </Typography>
          <Typography variant="h6" color="text.secondary" paragraph>
            View all waste manifests, and search for specific ones by number
          </Typography>
        </Container>
      </Box>

      {/* 🔍 Search Bar */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4, gap: 2 }}>
        <TextField
          label="Search by Manifest No"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(0);
          }}
          sx={{ width: "100%", maxWidth: 400 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          color="success"
          size="small"
          onClick={handleExport}
          sx={{ whiteSpace: "nowrap",height: "40px" }}
        >
          Export
        </Button>
      </Box>

    <Box
    sx={{
        display: 'flex',
        justifyContent: 'center',
        overflowX: 'auto',
    }}
    >
      <TableContainer component={Paper} sx={{ mt: 2, borderRadius: 2, maxWidth: '100%', overflowX: 'auto'}}>
        <Box sx={{ minWidth: 900 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f0f0f0' }}>
              {[
                'Date',
                'Time',
                'Transporter',
                'Generator',
                'Reference No.',
                'Manifest No.',
                'Description',
                '',
              ].map((header, index) => (
                <TableCell
                  key={index}
                  align="center"
                  sx={{
                    fontWeight: 'bold',
                    fontSize: '0.875rem',
                    padding: '8px',
                  }}
                >
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedManifests.map((m, idx) => (
              <TableRow key={idx}>
                <TableCell align="center">{new Date(m.date).toISOString().split('T')[0]}</TableCell>
                <TableCell align="center">{m.time}</TableCell>
                <TableCell align="center">{m.transporter}</TableCell>
                <TableCell align="center">{m.generator}</TableCell>
                <TableCell align="center">{m.reference_no}</TableCell>
                <TableCell align="center">{m.manifest_no}</TableCell>
                <TableCell align="center">{m.description}</TableCell>
                <TableCell align="center">
                  <Button
                    size="small"
                    variant="contained"
                    sx={{
                      minWidth: 0,
                      padding: '2px 6px',
                      fontSize: '0.75rem',
                      textTransform: 'none',
                    }}
                    onClick={() => handleViewPDF(m)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <TablePagination
        component="div"
        count={filteredManifests.length}    // Use filtered count here
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
    </>
  );
}