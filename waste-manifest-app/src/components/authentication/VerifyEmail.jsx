import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Alert, CircularProgress, Container, Typography, Button } from "@mui/material";

const API_URL = `${process.env.REACT_APP_API_URL}/api`;

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ success: false, message: "" });

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await fetch(`${API_URL}/verify-email?token=${token}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Verification failed");
        setStatus({ success: true, message: data.message });
      } catch (err) {
        setStatus({ success: false, message: err.message });
      } finally {
        setLoading(false);
      }
    };

    if (token) verify();
    else {
      setStatus({ success: false, message: "Invalid verification link" });
      setLoading(false);
    }
  }, [token]);

  if (loading) {
    return (
      <Container sx={{ textAlign: "center", mt: 8 }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Verifying your email...
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ textAlign: "center", mt: 8 }}>
      {status.success ? (
        <>
          <Alert severity="success" sx={{ mb: 2 }}>{status.message}</Alert>
          <Button variant="contained" href="/login">Go to Login</Button>
        </>
      ) : (
        <>
          <Alert severity="error" sx={{ mb: 2 }}>{status.message}</Alert>
          <Button variant="contained" href="/">Back to Home</Button>
        </>
      )}
    </Container>
  );
}