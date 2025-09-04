// src/components/Header.js
import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, IconButton, Avatar,
  Menu, MenuItem, Divider, Box
} from '@mui/material';

export default function Header({ user, onLogout }) {
  const [anchorEl, setAnchorEl] = useState(null);

  if (!user) return null;
  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleSignOut = () => {
    handleClose();
    onLogout();
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {/* Optional: App name or logo */}
        </Typography>
        <IconButton onClick={handleMenu} sx={{ p: 0 }}>
          <Avatar sx={{ bgcolor: '#00695c' }}>
            {user.username.charAt(0).toUpperCase()}
          </Avatar>
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          PaperProps={{
            sx: {
              width: 300,
              borderRadius: 2,
              padding: 2,
              mt: 1,
            },
          }}
        >
          <Box display="flex" alignItems="center" mt={1} mb={2}>
            <Avatar sx={{ bgcolor: '#00695c', mr: 2 }}>
              {user.username.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="body1">{user.email}</Typography>
            </Box>
          </Box>
          <Divider />
          <MenuItem onClick={handleSignOut}>Sign out</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}