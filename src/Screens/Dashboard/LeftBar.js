import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { AccessTime, Home, FolderShared } from '@mui/icons-material';

function LeftBar() {
    return (
        <Stack
            sx={{
                p: 5,
                pl: 4
            }}>
            <Box>
                <IconButton>
                    <AccessTime sx={{mr: 2}} />
                    <Typography>Recent</Typography>
                </IconButton>
            </Box>
            <Box>
                <IconButton>
                    <Home sx={{mr: 2}} />
                    <Typography>Home</Typography>
                </IconButton>
            </Box>
            <Box>
                <IconButton>
                    <FolderShared sx={{mr: 2}} />
                    <Typography>Shared With Me</Typography>
                </IconButton>
            </Box>
        </Stack>
        
    )
}

export default LeftBar