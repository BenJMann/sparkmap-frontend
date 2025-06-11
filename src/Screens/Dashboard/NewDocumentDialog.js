import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export default function NewDocumentDialog({open, setOpen, createNewDocument}) {

  const [documentName, setDocumentName] = React.useState('')
  const handleClose = () => {
    setOpen(false);
  };

  const handleCreateNew = () => {
    createNewDocument(documentName)
    handleClose();
  }

  return (
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          component: 'form',
          onSubmit: (event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const formJson = Object.fromEntries(formData.entries());
            const email = formJson.email;
            console.log(email);
            handleClose();
          },
        }}
      >
        <DialogTitle>Create</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Create new SparkMap.
          </DialogContentText>
          <TextField
            value={documentName}
            onChange={(e) => setDocumentName(e.target.value)}
            autoFocus
            required
            margin="dense"
            name="documentName"
            label="New SparkMap Name"
            fullWidth
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleCreateNew}>Create</Button>
        </DialogActions>
      </Dialog>
  );
}
