import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Snackbar,
  Box,
  CircularProgress
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { IconButton, InputAdornment } from '@mui/material';

const API_URL = `${process.env.REACT_APP_API_URL}/api`;
//const API_URL = 'http://localhost:4000/api';
//const API_URL = 'http://192.168.18.232:4000/api';//phone

export default function Authentication({ setUser }) {
  const [mode, setMode] = useState('login'); // or 'register'
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [showPassword, setShowPassword ] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [enableButton, setEnableButton] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Check if token exists in localStorage on mount
    const token = localStorage.getItem('token');
    if (token) {
      fetchProfile(token);
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async (token) => {
    try {
      const res = await fetch(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch profile');
      const data = await res.json();
      setUser(data.user);
    } catch {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const isEmailValid = validateEmail(form.email);
    const isPasswordFilled = form.password.trim() !== '';
    setEnableButton(isEmailValid && isPasswordFilled);
  }, [form.email, form.password]);

  const handleChange = (e) => {
    setError('');
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === 'email') {
      if (!validateEmail(e.target.value)) {
        setEmailError('Please enter a valid email address');
      } else {
        setEmailError('');
      }
    }
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (emailError) {
      setError('Fix errors before submitting');
      return;
    }
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? 'login' : 'register';
      const body = mode === 'login' ? { email: form.email, password: form.password } : form;
      const res = await fetch(`${API_URL}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      if (mode === 'login') {
        localStorage.setItem('token', data.token);
        setUser(data.user);
      } else {
        setSuccessMessage('Registration successful! Please check your email to verify your account.');
        setMode('login');
      }
    } catch (err) {
      setError(err.message);
    }finally{
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateEmail(form.email)) {
            setEmailError('Please enter a valid email address');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: form.email }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to send reset link');
            setSuccessMessage('Reset link sent. Please check your email.');
            setMode('login');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };


  return (
    <>
{loading && (
  <Box
    sx={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0,0,0,0.4)", // grey overlay
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999, // keep it on top of everything
    }}
  >
    <CircularProgress size={60} sx={{ color: "#fff" }} />
  </Box>
)}
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
    <Grid container justifyContent="center" alignItems="center" sx={{ minHeight: '100vh', px: 2 }}>
    <Grid item xs={12} sm={8} md={5}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          {mode === 'login' ? 'Login' : mode !== 'forgot' ? 'Register' : 'Reset'}
        </Typography>

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <TextField
              label="Username"
              name="username"
              value={form.username}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
          )}
          <>
          {mode !== 'forgot' && (
          <TextField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            error={!!emailError}
            helperText={emailError}
          />
          )}
          </>
          <>
          {mode !== 'forgot' && (
          <TextField
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            InputProps={{
                endAdornment: (
                <InputAdornment position="end">
                    <IconButton onClick={togglePasswordVisibility} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                </InputAdornment>
                ),
            }}
          />
        )}
        </>
        <>
        {mode !== 'forgot' && (
        <Box sx={{ textAlign: 'right', mt: 1 }}>
        <Typography
            variant="body2"
            component="span"
            sx={{
            cursor: 'pointer',
            color: 'primary.main',
            display: 'inline',
            '&:hover': { textDecoration: 'underline' },
            }}
            onClick={() => {setMode('forgot'); setError('')}}
        >
            Forgot Password?
        </Typography>
        </Box>
        )}
        </>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          <>
        {mode !== 'forgot' && (
          <Button
            variant="contained"
            type="submit"
            fullWidth
            sx={{ mt: 3, mb: 1 }}
            disabled={!enableButton}
          >
            {mode === 'login' ? 'Login' : 'Register'}
          </Button>
          )}
          </>
        </form>
          {mode !== 'forgot' && (
        <Button
          variant="outlined"
          fullWidth
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login');
            setError('');
          }}
        >
          Switch to {mode === 'login' ? 'Register' : 'Login'}
        </Button>
          )}
        {mode === 'forgot' && (
        <form onSubmit={handleForgotPassword}>
            <TextField
            label="Enter your email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            error={!!emailError}
            helperText={emailError}
            />
            {error && (
            <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
            )}
            <Button variant="contained" type="submit" fullWidth sx={{ mt: 3, mb: 1 }} disabled={loading}>
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Reset Link'}
            </Button>
            <Button fullWidth onClick={() => setMode('login')}>Back to Login</Button>
        </form>
        )}
      </Paper>
    </Grid>
  </Grid>
  </>
  );
}
