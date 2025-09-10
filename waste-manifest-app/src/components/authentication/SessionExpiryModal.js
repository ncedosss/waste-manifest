import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";

export default function SessionExpiryModal({ onStayLoggedIn, onLogout }) {
  return (
    <Dialog open>
      <DialogTitle>Session Expiring</DialogTitle>
      <DialogContent>
        Your session will expire soon. Do you want to stay logged in?
      </DialogContent>
      <DialogActions>
        <Button onClick={onLogout} color="error">Logout</Button>
        <Button onClick={onStayLoggedIn} variant="contained" color="primary">
          Stay Logged In
        </Button>
      </DialogActions>
    </Dialog>
  );
}
