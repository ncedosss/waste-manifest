import React, { useState } from 'react';
import {
  Container, Typography, TextField, Button, Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import { useSearchParams, useNavigate  } from 'react-router-dom';

export default function ResetPassword () {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [password, setPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('http://192.168.18.192:4000/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset failed');
      setSuccessMessage(data.message);
      setTimeout(() => {
      navigate('/');
      }, 3000);
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Typography variant="h4" gutterBottom align="center">Reset Password</Typography>

      <form onSubmit={handleSubmit}>
        <TextField
          label="New Password"
          type="password"
          fullWidth
          margin="normal"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
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

        <Button variant="contained" fullWidth type="submit" sx={{ mt: 2 }}>
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit'}
        </Button>
      </form>
    </Container>
  );
};
