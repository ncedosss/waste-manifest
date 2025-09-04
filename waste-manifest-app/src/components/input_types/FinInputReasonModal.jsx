import { Close } from '@mui/icons-material';
import {
  Dialog,
  DialogTitle,
  IconButton,
  DialogContent,
  DialogActions,
  Button,
  TextField
} from '@mui/material';
import { useState } from 'react';

const FinInputReasonModal = ({ open, id, handleClose }) => {
  const modalId = "modal-" + id;
  const [textAreaValue, setTextAreaValue] = useState("");

  return (
    <Dialog maxWidth='xs' open={open} aria-labelledby={modalId}>
      <DialogActions sx={{ position: "absolute", top: 0, right: 0 }}>
        <IconButton size="small" aria-label="close" onClick={handleClose}>
          <Close sx={{ fontSize: "0.91em" }} />
        </IconButton>
      </DialogActions>

      <DialogTitle id={modalId}>
        Provide a reason
      </DialogTitle>

      <DialogContent>
        <TextField
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          placeholder="Type your reason here..."
          value={textAreaValue}
          onChange={(e) => setTextAreaValue(e.target.value)}
        />
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

export default FinInputReasonModal;
