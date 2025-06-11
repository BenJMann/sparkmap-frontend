import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';

import { useCSVReader } from 'react-papaparse';
import { Typography } from '@mui/material';

const styles = {
  progressBarBackgroundColor: {
    width: "20px",
    backgroundColor: 'red',
  },
};



export default function UploadCSVDialog({open, setOpen, loadCSV}) {

    const [nestedJSON, setNestedJSON] = React.useState(null);
    const { CSVReader } = useCSVReader();
    const [documentName, setDocumentName] = React.useState('')
    const handleClose = () => {
        setOpen(false);
    };

    const handleCreateNew = () => {
        loadCSV(documentName, nestedJSON)
        handleClose();
    }

    function gridToNestedJSON(grid) {
        const root = [];
        const stack = [{ level: -1, children: root }];
      
        for (const row of grid) {
          // Find the first non-empty cell and its level
          const level = row.findIndex(cell => cell !== undefined && cell !== null && cell !== '');
          if (level === -1) continue;
      
          const node = { text: row[level], children: [] };
      
          // Find the appropriate parent based on the current level
          while (stack.length > 0 && stack[stack.length - 1].level >= level) {
            stack.pop();
          }
      
          // Add the node to the parent's children
          stack[stack.length - 1].children.push(node);
      
          // Push the current node onto the stack
          stack.push({ level, children: node.children });
        }
      
        setNestedJSON(root)
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
                sx={{mb: 4}}
            />
            <CSVReader
                onUploadAccepted={(results) => {
                    gridToNestedJSON(results.data)
                }}
                >
                {({
                    getRootProps,
                    acceptedFile,
                    ProgressBar,
                    getRemoveFileProps,
                }) => (
                    <>
                    <Stack spacing={4}>
                        <Button variant="contained" type='button' {...getRootProps()}>
                        Upload
                        </Button>
                        {acceptedFile &&
                            <Typography>{acceptedFile.name}</Typography>
                        }
                    </Stack>
                    <ProgressBar style={styles.progressBarBackgroundColor} />
                    </>
                )}
            </CSVReader>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleCreateNew}>Create</Button>
        </DialogActions>
      </Dialog>
  );
}
