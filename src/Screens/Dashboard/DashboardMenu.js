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
import { Upload } from '@mui/icons-material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
function DashboardMenu({setShowNewPopup, setShowImportPopup}) {
    return (
        <Box sx={{
            width: '100%',
            backgroundColor: '#eee'
        }}>
            <Stack direction="row" spacing={5}
                sx={{
                    pt: 3,
                    pb: 3,
                    pl: 10,
                }}>
                    <Stack direction="row" sx= {{
                        border: '1px solid #888',
                        padding: 2,
                        cursor: 'pointer'
                    }}
                        onClick={() => setShowNewPopup(true)}
                    >
                        <AddCircleOutlineIcon sx={{mr: 2}} />
                        <Typography>New</Typography>
                    </Stack>
                    <Stack direction="row" sx= {{
                        border: '1px solid #888',
                        padding: 2,
                        cursor: 'pointer'
                    }}
                        onClick={() => setShowImportPopup(true)}
                    >
                        <Upload sx={{mr: 2}}  />
                        <Typography>Upload CSV</Typography>
                    </Stack>

            </Stack>
        </Box>
    )
}

export default DashboardMenu