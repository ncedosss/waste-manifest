import { Close } from '@mui/icons-material';
import {
  Dialog,
  DialogTitle,
  IconButton,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
} from '@mui/material';
import { useState } from 'react';

const RELATION_OPTIONS = ["Sister", "Brother", "Uncle", "Spouse"];

const FinInputBureauAccountSharingModal = ({ open, id, handleClose }) => {
  const modalId = "modal-" + id;
  const [amount, setAmount] = useState("");             // New state for amount
  const [selectedRelation, setSelectedRelation] = useState("");

  return (
    <Dialog maxWidth='xs' open={open} aria-labelledby={modalId}>
      <DialogActions sx={{ position: "absolute", top: 0, right: 0 }}>
        <IconButton size="small" aria-label="close" onClick={handleClose}>
          <Close sx={{ fontSize: "0.91em" }} />
        </IconButton>
      </DialogActions>

      <DialogTitle id={modalId}>
        Please enter the amount you pay and the relationship of the person you share with.
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          label="Amount Paid"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <TextField
          select
          label="Relation"
          value={selectedRelation || ""}
          onChange={(e) => {
            setSelectedRelation(e.target.value);
          }}
          fullWidth
        >
          {RELATION_OPTIONS.map((option, index) => (
            <MenuItem key={index} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={handleClose}
          variant="contained"
        >
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FinInputBureauAccountSharingModal;
