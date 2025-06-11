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

function Register() {
    return (
        <Box sx={{
            p: 10
        }}>
            <Paper sx={{p: 4}}>
                <Typography variant="h3" sx={{pb: 2}}>Registration</Typography>
                <Typography variant="p">Registration isn't yet open to the public. If you are interested in giving SparkMap a test drive, and you know Ben personally, send him a message asking for an account.</Typography>
            </Paper> 
        </Box>
    )
}

export default Register