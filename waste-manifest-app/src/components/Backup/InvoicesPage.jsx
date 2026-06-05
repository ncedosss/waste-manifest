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
  Box,
  CircularProgress,
  TablePagination,
  TextField,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Header from './Header';

const API_URL = `${process.env.REACT_APP_API_URL}/api`;

/* 🔧 Xero date helper */
function parseXeroDate(xeroDate) {
  if (!xeroDate) return '';
  const match = xeroDate.match(/\d+/);
  if (!match) return '';
  return new Date(Number(match[0])).toISOString().split('T')[0];
}

export default function InvoicesPage({ user, onLogout, onHome }) {
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const rowsPerPage = 10;

  useEffect(() => {
    setLoading(true);

    async function fetchInvoices() {
      try {
        const res = await fetch(`${API_URL}/invoices`);
        if (!res.ok) throw new Error("Failed to fetch invoices");

        const data = await res.json();

        // Check if backend says we need to authenticate
        if (data.needsAuth) {
          const authWindow = window.open(
            data.authUrl,
            "XeroLogin",
            `width=600,height=700,top=${window.screen.height/2-350},left=${window.screen.width/2-300}`
          );

          // Listen for message from popup
          const handleMessage = (event) => {
            if (event.origin !== window.location.origin) return;
            if (event.data === "xero-auth-success") {
              fetchInvoices(); // retry fetching invoices after auth
              window.removeEventListener("message", handleMessage);
            }
          };

          window.addEventListener("message", handleMessage);

          return; // stop further execution until auth
        }

        setInvoices(data.Invoices || []);
      } catch (err) {
        console.error("Invoice fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchInvoices();
  }, []);

  /* 🔍 Search */
  const filteredInvoices = invoices.filter(inv => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;

    return (
      inv.InvoiceNumber?.toLowerCase().includes(q) ||
      inv.Reference?.toLowerCase().includes(q) ||
      inv.Contact?.Name?.toLowerCase().includes(q) ||
      inv.Status?.toLowerCase().includes(q)
    );
  });

  /* 📄 Pagination */
  const paginatedInvoices = filteredInvoices.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <>
      <Header user={user} onLogout={onLogout} onHome={onHome} />

      {loading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            bgcolor: 'rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1300
          }}
        >
          <CircularProgress size={80} thickness={5} />
        </Box>
      )}

      <Container sx={{ mt: -4 }}>
        {/* Hero */}
        <Box sx={{ py: 8, textAlign: 'center', bgcolor: '#f5f5f5' }}>
          <Typography variant="h3">Xero Invoices</Typography>
          <Typography variant="h6" color="text.secondary">
            Synced directly from Xero
          </Typography>
        </Box>

        {/* 🔍 Search */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <TextField
            label="Search invoice / contact / reference"
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
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
        </Box>

        {/* 📊 Table */}
        <TableContainer component={Paper} sx={{ mt: 3, borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f0f0f0' }}>
                {[
                  'Type',
                  'Invoice No',
                  'Contact',
                  'Reference',
                  'Date',
                  'Due Date',
                  'Status',
                  'Total',
                  'Amount Due'
                ].map(h => (
                  <TableCell key={h} align="center" sx={{ fontWeight: 'bold' }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedInvoices.map(inv => (
                <TableRow key={inv.InvoiceID}>
                  <TableCell align="center">{inv.Type}</TableCell>
                  <TableCell align="center">{inv.InvoiceNumber}</TableCell>
                  <TableCell align="center">{inv.Contact?.Name}</TableCell>
                  <TableCell align="center">{inv.Reference || '-'}</TableCell>
                  <TableCell align="center">{parseXeroDate(inv.Date)}</TableCell>
                  <TableCell align="center">{parseXeroDate(inv.DueDate)}</TableCell>
                  <TableCell align="center">{inv.Status}</TableCell>
                  <TableCell align="center">{inv.Total?.toFixed(2)}</TableCell>
                  <TableCell align="center">{inv.AmountDue?.toFixed(2)}</TableCell>
                </TableRow>
              ))}

              {!loading && filteredInvoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No invoices found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <TablePagination
            component="div"
            count={filteredInvoices.length}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[10]}
            labelRowsPerPage=""
          />
        </TableContainer>
      </Container>
    </>
  );
}