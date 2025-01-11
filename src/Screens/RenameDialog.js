import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export default function RenameDialog({open, setOpen, documentId, documentName, renameDocument}) {

  const [newName, setNewName] = React.useState(documentName)
  const handleClose = () => {
    setOpen(false);
  };

  const handleRename = () => {
    console.log(`Renaming ${documentId} from ${documentName} to ${newName}`)
    renameDocument(documentId, newName)
    handleClose();
  }

  return (
    <React.Fragment>
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
        <DialogTitle>Subscribe</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Rename the document.
          </DialogContentText>
          <TextField
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
            required
            margin="dense"
            name="documentName"
            label="New Document Name"
            fullWidth
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleRename}>Rename</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
