import { Outlet, Link } from "react-router-dom";
import { LoginContext } from "../LoginProvider";
import { useContext } from "react";
import LogoWithGradient from "../Images/LogoWithGradient.png"

import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';

const pages = [['Home', '/'], ['Features','/Features'], ['Docs', '/Documentation']];
const settings = ['Profile', 'Account', 'Dashboard', 'Logout'];

function Header() {
  const [anchorElUser, setAnchorElUser] = React.useState(null);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const {loggedIn} = useContext(LoginContext)

  return (
    <AppBar position="static" 
    sx={{
        background: `linear-gradient(
        to bottom,
        #090424 0%,      /* dark top */
        #090424 50%,      /* dark top */
        #33092d 90%,     /* subtle mid purple-grey sheen */
        #090424 110%     /* dark bottom again */
        )`,
        boxShadow: '0 2px 10px rgba(0,0,0,0.5)'
    }}>
    <Container maxWidth="xl">
        <Toolbar disableGutters>
        <IconButton href="/" sx={{mr: 2, p:0}}>
            <img src={LogoWithGradient} alt="Logo" width={64} height={64}/>
        </IconButton>
        
        <Typography
            variant="h4"
            noWrap
            component="a"
            href="/"
            sx={{
            mr: 2,
            display: { xs: 'none', md: 'flex' },
            fontFamily: 'monospace',
            fontWeight: 700,
            letterSpacing: '.3rem',
            color: 'inherit',
            textDecoration: 'none',
            }}
        >
            SparkMap
        </Typography>

        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
            <Button
                key={page[0]}
                href={page[1]}
                sx={{ mb: 1.5, mt: 2.5, color: 'white', display: 'block' }}
            >
                {page[0]}
            </Button>
            ))}
        </Box>
        { loggedIn ?
            <Box sx={{ flexGrow: 0 }}>
                <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" />
                </IconButton>
                </Tooltip>
                <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
                >
                {settings.map((setting) => (
                    <MenuItem key={setting} onClick={handleCloseUserMenu}>
                    <Typography sx={{ textAlign: 'center' }}>{setting}</Typography>
                    </MenuItem>
                ))}
                </Menu>
            </Box>
            :
            <Box sx={{ flexGrow: 0, display: { xs: 'none', md: 'flex' } }}>
                <Button color="inherit">Register</Button>
                <Typography sx={{mt: 0.7}}>|</Typography>
                <Button color="inherit" href="/login">Login</Button>
            </Box>
        }
        
        </Toolbar>
    </Container>
    </AppBar>
  );
}
export default Header;