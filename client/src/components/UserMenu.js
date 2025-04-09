import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Menu,
  MenuItem,
  IconButton,
  Avatar,
  Badge,
  Alert,
  Divider,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

function UserMenu({ username, socket }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [loginUsername, setLoginUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Check if the user is logged in with a registered account
  useEffect(() => {
    // Check localStorage for login status
    const storedLoginStatus = localStorage.getItem('isRegisteredUser');
    if (storedLoginStatus === 'true') {
      setIsRegistered(true);
    }
    
    // Listen for authentication events from the server
    if (socket) {
      // Handle successful login
      const handleLoginSuccess = (data) => {
        setIsRegistered(true);
        localStorage.setItem('isRegisteredUser', 'true');
        localStorage.setItem('chatUsername', data.username);
        setErrorMessage('');
        handleCloseDialog();
      };
      
      // Handle registration success
      const handleRegisterSuccess = (data) => {
        setIsRegistered(true);
        localStorage.setItem('isRegisteredUser', 'true');
        localStorage.setItem('chatUsername', data.username);
        setErrorMessage('');
        handleCloseDialog();
      };
      
      // Handle username change success
      const handleUsernameChanged = (data) => {
        setErrorMessage('');
        handleCloseDialog();
      };
      
      // Handle logout
      const handleLogout = () => {
        // Immediately close any open menu
        setAnchorEl(null);
        
        // Update state and clear localStorage
        setIsRegistered(false);
        
        // Clear stored username from localStorage and request a new random username
        localStorage.removeItem('chatUsername');
        localStorage.removeItem('isRegisteredUser');
        socket.emit('logout');
        
        // Redirect to login page after a small delay to ensure UI is updated
        setTimeout(() => {
          window.location.href = '/login';
        }, 50);
      };
      
      // Handle command errors
      const handleCommandError = (error) => {
        setErrorMessage(error.message);
      };
      
      socket.on('login_success', handleLoginSuccess);
      socket.on('register_success', handleRegisterSuccess);
      socket.on('username_changed', handleUsernameChanged);
      socket.on('logout_success', handleLogout);
      socket.on('command_error', handleCommandError);
      
      return () => {
        socket.off('login_success', handleLoginSuccess);
        socket.off('register_success', handleRegisterSuccess);
        socket.off('username_changed', handleUsernameChanged);
        socket.off('logout_success', handleLogout);
        socket.off('command_error', handleCommandError);
      };
    }
  }, [socket]);
  
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const openDialog = (type) => {
    setDialogType(type);
    setNewUsername('');
    setLoginUsername('');
    setPassword('');
    setErrorMessage('');
    setDialogOpen(true);
    handleMenuClose();
  };
  
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setErrorMessage('');
  };
  
  const handleChangeUsername = () => {
    if (newUsername.trim()) {
      socket.emit('change_username', { 
        newUsername: newUsername.trim(),
        isRegistered: isRegistered
      });
      // Only close if registered user (they can use any name)
      // For non-registered users, we'll wait for server response
      if (isRegistered) {
        handleCloseDialog();
      }
    }
  };
  
  const handleRegister = () => {
    if (newUsername.trim() && password.trim()) {
      socket.emit('register_username', { 
        username: newUsername.trim(), 
        password: password.trim() 
      });
      // Don't close dialog yet, wait for server response
    }
  };
  
  const handleLogin = () => {
    if (loginUsername.trim() && password.trim()) {
      socket.emit('login_username', { 
        username: loginUsername.trim(), 
        password: password.trim() 
      });
      // Don't close dialog yet, wait for server response
    }
  };
  
  const handleLogout = () => {
    // Immediately close any open menu
    setAnchorEl(null);
    
    // Update state and clear localStorage
    setIsRegistered(false);
    
    // Clear stored username from localStorage and request a new random username
    localStorage.removeItem('chatUsername');
    localStorage.removeItem('isRegisteredUser');
    socket.emit('logout');
    
    // Redirect to login page after a small delay to ensure UI is updated
    setTimeout(() => {
      window.location.href = '/login';
    }, 50);
  };
  
  return (
    <>
      <Box
        onClick={handleMenuOpen}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          cursor: 'pointer',
          background: 'linear-gradient(to bottom, #ffffff 0%, #f0e5f5 100%)',
          border: '1px solid #9e56b6',
          borderRadius: '3px',
          px: 1,
          py: 0.25,
          fontSize: '11px',
          fontFamily: '"Tahoma", sans-serif',
          color: '#000',
          '&:hover': {
            background: 'linear-gradient(to bottom, #ffffff 0%, #f7eefb 100%)',
          },
        }}
      >
        {isRegistered ? (
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  bgcolor: '#4caf50',
                  borderRadius: '50%',
                  border: '1px solid #fff',
                }}
              />
            }
          >
            <Avatar
              sx={{
                width: 16,
                height: 16,
                fontSize: '10px',
                bgcolor: '#770094',
              }}
            >
              {username.charAt(0).toUpperCase()}
            </Avatar>
          </Badge>
        ) : (
          <Avatar
            sx={{
              width: 16,
              height: 16,
              fontSize: '10px',
              bgcolor: '#9e56b6',
            }}
          >
            {username.charAt(0).toUpperCase()}
          </Avatar>
        )}
        <Typography
          sx={{
            fontSize: '11px',
            fontFamily: '"Tahoma", sans-serif',
          }}
        >
          {username}
        </Typography>
        <KeyboardArrowDownIcon sx={{ fontSize: 14 }} />
      </Box>
      
      {/* Menu for registered users */}
      {isRegistered && (
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          sx={{
            '& .MuiPaper-root': {
              backgroundColor: '#ffffff',
              color: '#000',
              minWidth: '180px',
              borderRadius: '3px',
              boxShadow: '3px 3px 6px rgba(0, 0, 0, 0.2)',
              border: '1px solid #770094',
              padding: 0,
            },
            '& .MuiMenuItem-root': {
              fontSize: '11px',
              fontFamily: '"Tahoma", sans-serif',
              padding: '4px 8px',
              minHeight: '24px',
              '&:hover': {
                backgroundColor: '#f7eefb',
              },
            },
          }}
        >
          <Box 
            sx={{ 
              px: 1.5, 
              py: 1, 
              borderBottom: '1px solid #b57ad9',
              bgcolor: '#f2e9f7',
            }}
          >
            <Typography 
              sx={{ 
                fontSize: '10px', 
                opacity: 0.7,
                fontFamily: '"Tahoma", sans-serif',
                mb: 0.5,
              }}
            >
              Logged in as
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      bgcolor: '#4caf50',
                      borderRadius: '50%',
                      border: '1px solid #fff',
                    }}
                  />
                }
              >
                <Avatar
                  sx={{
                    width: 20,
                    height: 20,
                    fontSize: '12px',
                    bgcolor: '#770094',
                  }}
                >
                  {username.charAt(0).toUpperCase()}
                </Avatar>
              </Badge>
              <Typography 
                sx={{ 
                  fontSize: '12px', 
                  fontWeight: 'bold',
                  fontFamily: '"Tahoma", sans-serif',
                }}
              >
                {username}
                <Typography
                  component="span"
                  sx={{
                    fontSize: '10px',
                    ml: 1,
                    color: '#007700',
                    fontFamily: '"Tahoma", sans-serif',
                  }}
                >
                  (Verified)
                </Typography>
              </Typography>
            </Box>
          </Box>
          
          <MenuItem onClick={handleLogout}>
            Logout
          </MenuItem>
        </Menu>
      )}
      
      {/* Menu for non-registered users */}
      {!isRegistered && (
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          sx={{
            '& .MuiPaper-root': {
              backgroundColor: '#ffffff',
              color: '#000',
              minWidth: '180px',
              borderRadius: '3px',
              boxShadow: '3px 3px 6px rgba(0, 0, 0, 0.2)',
              border: '1px solid #770094',
              padding: 0,
            },
            '& .MuiMenuItem-root': {
              fontSize: '11px',
              fontFamily: '"Tahoma", sans-serif',
              padding: '4px 8px',
              minHeight: '24px',
              '&:hover': {
                backgroundColor: '#f7eefb',
              },
            },
          }}
        >
          <Box 
            sx={{ 
              px: 1.5, 
              py: 1, 
              borderBottom: '1px solid #b57ad9',
              bgcolor: '#f2e9f7',
            }}
          >
            <Typography 
              sx={{ 
                fontSize: '10px', 
                opacity: 0.7,
                fontFamily: '"Tahoma", sans-serif',
                mb: 0.5,
              }}
            >
              Current username
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Avatar
                sx={{
                  width: 20,
                  height: 20,
                  fontSize: '12px',
                  bgcolor: '#9e56b6',
                }}
              >
                {username.charAt(0).toUpperCase()}
              </Avatar>
              <Typography 
                sx={{ 
                  fontSize: '12px', 
                  fontWeight: 'bold',
                  fontFamily: '"Tahoma", sans-serif',
                }}
              >
                {username}
              </Typography>
            </Box>
          </Box>
          
          <MenuItem onClick={() => openDialog('changeUsername')}>
            Change Username
          </MenuItem>
          <MenuItem onClick={() => openDialog('register')}>
            Register Username
          </MenuItem>
          <MenuItem onClick={() => openDialog('login')}>
            Login
          </MenuItem>
        </Menu>
      )}
      
      {/* Dialog for various user actions */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        PaperProps={{
          sx: {
            borderRadius: '3px',
            boxShadow: '5px 5px 15px rgba(0, 0, 0, 0.35)',
            border: '1px solid #7b9ebd',
            maxWidth: '350px',
            width: '100%',
            padding: 0,
            overflow: 'hidden',
            fontFamily: '"Tahoma", sans-serif',
          }
        }}
      >
        {/* Windows-style title bar with gradient */}
        <Box 
          sx={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(to bottom, #b5d0ef 0%, #7b9ebd 100%)',
            color: '#000',
            height: '24px',
            px: 1,
            userSelect: 'none',
          }}
        >
          <Typography 
            sx={{ 
              fontSize: '12px', 
              fontWeight: 'bold',
              fontFamily: '"Tahoma", sans-serif',
            }}
          >
            {dialogType === 'changeUsername' && 'Change Username'}
            {dialogType === 'register' && 'Register New Account'}
            {dialogType === 'login' && 'Login to Your Account'}
          </Typography>
        </Box>
        
        <DialogContent sx={{ px: 2, py: 1.5, bgcolor: '#f0f5fa' }}>
          {errorMessage && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2, 
                fontSize: '11px',
                py: 0,
                fontFamily: '"Tahoma", sans-serif',
              }}
            >
              {errorMessage}
            </Alert>
          )}
          
          {dialogType === 'changeUsername' && (
            <TextField
              autoFocus
              margin="dense"
              label="New Username"
              fullWidth
              variant="outlined"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              InputLabelProps={{
                sx: {
                  fontSize: '12px',
                  fontFamily: '"Tahoma", sans-serif',
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  height: '40px',
                  fontSize: '12px',
                  fontFamily: '"Tahoma", sans-serif',
                },
              }}
            />
          )}
          
          {dialogType === 'register' && (
            <>
              <TextField
                autoFocus
                margin="dense"
                label="Username"
                fullWidth
                variant="outlined"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                InputLabelProps={{
                  sx: {
                    fontSize: '12px',
                    fontFamily: '"Tahoma", sans-serif',
                  }
                }}
                sx={{
                  mb: 1.5,
                  '& .MuiOutlinedInput-root': {
                    height: '40px',
                    fontSize: '12px',
                    fontFamily: '"Tahoma", sans-serif',
                  },
                }}
              />
              <TextField
                margin="dense"
                label="Password"
                type="password"
                fullWidth
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputLabelProps={{
                  sx: {
                    fontSize: '12px',
                    fontFamily: '"Tahoma", sans-serif',
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: '40px',
                    fontSize: '12px',
                    fontFamily: '"Tahoma", sans-serif',
                  },
                }}
              />
            </>
          )}
          
          {dialogType === 'login' && (
            <>
              <TextField
                autoFocus
                margin="dense"
                label="Username"
                fullWidth
                variant="outlined"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                InputLabelProps={{
                  sx: {
                    fontSize: '12px',
                    fontFamily: '"Tahoma", sans-serif',
                  }
                }}
                sx={{
                  mb: 1.5,
                  '& .MuiOutlinedInput-root': {
                    height: '40px',
                    fontSize: '12px',
                    fontFamily: '"Tahoma", sans-serif',
                  },
                }}
              />
              <TextField
                margin="dense"
                label="Password"
                type="password"
                fullWidth
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputLabelProps={{
                  sx: {
                    fontSize: '12px',
                    fontFamily: '"Tahoma", sans-serif',
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: '40px',
                    fontSize: '12px',
                    fontFamily: '"Tahoma", sans-serif',
                  },
                }}
              />
            </>
          )}
        </DialogContent>
        
        <DialogActions sx={{ px: 2, py: 1.5, bgcolor: '#f0f5fa', justifyContent: 'space-between' }}>
          <Button 
            onClick={handleCloseDialog}
            sx={{
              textTransform: 'none',
              fontSize: '11px',
              backgroundColor: '#e1e1e1',
              color: '#000',
              border: '1px solid #999999',
              borderRadius: '3px',
              px: 2,
              py: 0.25,
              '&:hover': {
                backgroundColor: '#f0f0f0',
              },
              fontFamily: '"Tahoma", sans-serif',
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={
              dialogType === 'changeUsername' ? handleChangeUsername :
              dialogType === 'register' ? handleRegister :
              handleLogin
            }
            disabled={
              (dialogType === 'changeUsername' && !newUsername.trim()) ||
              (dialogType === 'register' && (!newUsername.trim() || !password.trim())) ||
              (dialogType === 'login' && (!loginUsername.trim() || !password.trim()))
            }
            sx={{
              textTransform: 'none',
              fontSize: '11px',
              py: 0.25,
              px: 2,
              backgroundColor: '#6689bc',
              color: 'white',
              '&:hover': {
                backgroundColor: '#4471a9',
              },
              '&.Mui-disabled': {
                backgroundColor: '#cccccc',
                color: '#666666',
              },
              fontFamily: '"Tahoma", sans-serif',
            }}
          >
            {dialogType === 'changeUsername' && 'Change'}
            {dialogType === 'register' && 'Register'}
            {dialogType === 'login' && 'Login'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default UserMenu; 