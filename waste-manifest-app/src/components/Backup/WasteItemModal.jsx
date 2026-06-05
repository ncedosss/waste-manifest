import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  Button,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

export default function WasteItemModal({ open, onClose, onSave, data, setData, isEditing  }) {
    return(
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
    <DialogTitle>{isEditing ? 'Edit Waste Item' : 'Add Waste Item'}</DialogTitle>
    <DialogContent>
      <TextField
        label="Waste Description"
        fullWidth
        value={data.description}
        onChange={(e) => setData({ ...data, description: e.target.value })}
        sx={{ mt: 2 }}
      />
      <TextField
        label="Packaging"
        fullWidth
        value={data.packaging}
        onChange={(e) => setData({ ...data, packaging: e.target.value })}
        sx={{ mt: 2 }}
      />
      <TextField
        label="Volume (L)"
        type="number"
        fullWidth
        value={data.volume}
        onChange={(e) => setData({ ...data, volume: e.target.value })}
        sx={{ mt: 2 }}
      />
      <TextField
        label="Weight (kg)"
        type="number"
        fullWidth
        value={data.weight}
        onChange={(e) => setData({ ...data, weight: e.target.value })}
        sx={{ mt: 2 }}
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button
        onClick={() => {
          const isValid =
          data.description.trim() !== '' &&
          data.packaging.trim() !== '' &&
          data.volume.trim() !== '' &&
          data.weight.trim() !== '';

          if (!isValid) return
          onSave(data);
          onClose();
        }}
        variant="contained"
      >
        {isEditing ? 'Update' : 'Add'}
      </Button>
    </DialogActions>
  </Dialog>
    );
};