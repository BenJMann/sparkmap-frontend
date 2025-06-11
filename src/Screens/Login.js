import { useState, useEffect, useContext } from "react"

import { useNavigate, Navigate } from "react-router-dom"

import { LoginContext } from "../LoginProvider"

import loginTiles from '../Images/loginTiles.png'

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

function Login() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    const [errorText, setErrorText] = useState("")
    const [loading, setLoading] = useState(false);

    const {loggedIn, login} = useContext(LoginContext)

    const navigate = useNavigate();

    const handleLogin = async () => {
        setErrorText("")
        setLoading(true);
        const result = await login(username, password);
        setLoading(false);
        console.log(result)
        if (result?.error) setErrorText(result.message)
    }

    if (sessionStorage.getItem("token")) return <Navigate to="/dashboard" />

    return (
        <Box
            sx={{
                position: 'relative',
                width: '100%',
                height: '100vh', // or desired height
                overflow: 'hidden',
                backgroundColor: '#e5e3d8'
            }}
            >
            {/* Tile grid container */}
            <Box
                sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, 50px)', // adjust tile size
                gridAutoRows: '50px',
                width: '100%',
                height: '100%',
                zIndex: 0,
                }}
            >
                {Array.from({ length: 500 }).map((_, i) => (
                <Box
                    key={i}
                    component="img"
                    src={loginTiles}
                    alt=""
                    sx={{ width: 50, height: 50 }}
                />
                ))}
            </Box>

            {/* Foreground content */}
            <Box sx={{ position: 'relative', zIndex: 1, p: 5}}>
                <Backdrop
                    sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
                    open={loading}
                    >
                    <CircularProgress color="inherit" />
                </Backdrop>
                <Box className="center-screen">
                    <Paper elevation={3}>
                        <Box  sx={{p: 2, backgroundColor: '#ddd', minWidth: '500px'}}>
                            <Typography variant="h4">Login</Typography>
                        </Box>
                        {errorText && 
                            <Alert sx={{m:3, mt:5}} variant="filled" severity="error">{errorText}</Alert>
                        }
                        <Stack spacing={4} sx={{p: 5}}>
                            <TextField 
                                variant="outlined" 
                                label="Username" 
                                id="username" 
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)} 
                                />
                            <TextField 
                                variant="outlined"
                                label="Password"
                                type="password" 
                                id="password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)}/>

                            <Button 
                                onClick={handleLogin}
                                variant="contained"
                                >Submit</Button>
                        </Stack>
                    </Paper>
                </Box>
            </Box>
        </Box>
        
    )
}

export default Login