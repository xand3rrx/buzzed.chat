import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Link,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function RegisterPage({ socket }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const navigate = useNavigate();
  const faceRef = useRef(null);

  useEffect(() => {
    console.log("Socket object in RegisterPage:", socket);
    
    // Check if socket is connected
    if (socket) {
      console.log("Socket connection status:", socket.connected);
      console.log("Socket ID:", socket.id);
      
      if (!socket.connected) {
        console.log("Socket not connected. Attempting to connect...");
        socket.connect();
      }
    } else {
      console.error("Socket object is not available!");
    }
    
    // Check if user is already logged in
    const storedLoginStatus = localStorage.getItem('isRegisteredUser');
    const storedUsername = localStorage.getItem('chatUsername');
    
    if (storedLoginStatus === 'true' && storedUsername) {
      // If already logged in, go to landing page
      navigate('/');
    }
    
    // Function to handle successful registration
    const handleRegisterSuccess = (data) => {
      console.log("Registration successful:", data);
      // Save user data in localStorage
      localStorage.setItem('isRegisteredUser', 'true');
      localStorage.setItem('chatUsername', data?.username || 'defaultUser');
      
      // Update UI state
      setRegisterSuccess(true);
      
      // Wait for animation to complete before redirecting
      setTimeout(() => {
        navigate('/');
      }, 1500);
    };
    
    // Function to handle registration errors
    const handleRegisterError = (error) => {
      console.error("Registration error:", error);
      setError(error?.message || "Registration failed. Please try again.");
    };
    
    // Setup socket event listeners
    const setupSocketListeners = () => {
      // Clean up any existing listeners first
      socket.off('register_success');
      socket.off('username_registered');
      socket.off('command_error');
      
      // Add event listeners
      socket.on('register_success', handleRegisterSuccess);
      socket.on('username_registered', (data) => {
        console.log("Username registered event received:", data);
        // This event is sometimes emitted instead of register_success
        handleRegisterSuccess(data);
      });
      socket.on('command_error', handleRegisterError);
    };
    
    // Wait for socket to connect before setting up listeners
    if (socket.connected) {
      setupSocketListeners();
    } else {
      // Setup listeners once connected
      const onConnect = () => {
        console.log("Socket connected in RegisterPage component");
        setupSocketListeners();
      };
      socket.once('connect', onConnect);
    }
    
    return () => {
      // Remove event listeners when component unmounts
      if (socket) {
        socket.off('register_success', handleRegisterSuccess);
        socket.off('username_registered');
        socket.off('command_error', handleRegisterError);
        socket.off('connect');
      }
    };
  }, [socket, navigate]);

  const handleRegister = () => {
    if (!username.trim() || !password.trim()) {
      setError('Please enter a username and password');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Check socket connection
    if (!socket) {
      setError('Connection to server not available');
      return;
    }
    
    if (!socket.connected) {
      console.log("Socket not connected during registration attempt. Trying to reconnect...");
      setError('Not connected to server. Attempting to reconnect...');
      
      // Try to reconnect and send registration request when connected
      socket.connect();
      socket.once('connect', () => {
        console.log("Socket reconnected, attempting registration now");
        sendRegisterRequest();
      });
      
      return;
    }
    
    // Send registration request directly if already connected
    sendRegisterRequest();
  };
  
  const sendRegisterRequest = () => {
    console.log("Sending registration request for username:", username);
    setError(''); // Clear any previous errors
    
    // Send registration request
    socket.emit('register_username', {
      username: username.trim(),
      password: password.trim()
    });
    
    // Debugging: Log all events for a short period
    const originalOnAny = socket.onAny;
    socket.onAny((event, ...args) => {
      console.log(`[DEBUG] Event after registration attempt: "${event}"`, args);
    });
    
    // Reset onAny after debugging period
    setTimeout(() => {
      socket.onAny = originalOnAny;
    }, 5000);
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#000',
        backgroundImage: 'url(/bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        fontFamily: '"Tahoma", sans-serif',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: 300,
          borderRadius: 0,
          overflow: 'hidden',
          border: '1px solid #999',
          boxShadow: '5px 5px 15px rgba(0, 0, 0, 0.15)',
          backgroundColor: 'white',
        }}
      >
        {/* Title bar */}
        <Box
          sx={{
            height: 22,
            bgcolor: '#a828c5',
            display: 'flex',
            alignItems: 'center',
            px: 1,
            backgroundImage: 'linear-gradient(to right, #9911ba, #7322ab)',
            color: 'white',
          }}
        >
          <Typography 
            variant="caption" 
            sx={{ 
              flexGrow: 1,
              fontSize: '11px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Box
              component="img"
              src="https://i.ibb.co/hxwVLpW9/meetme.png"
              alt="Buzzed Icon"
              sx={{ 
                width: 15, 
                height: 15,
                mr: 0.5,
                mt: '-2px',
                objectFit: 'contain'
              }}
            />
            BUZZED! MESSENGER - REGISTER
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Box
              sx={{
                width: 14,
                height: 14,
                fontSize: '9px',
                lineHeight: '13px',
                textAlign: 'center',
                bgcolor: '#dadada',
                border: '1px solid white',
                borderRadius: '0',
                color: 'black',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: '#efefef',
                },
              }}
            >
              _
            </Box>
            <Box
              sx={{
                width: 14,
                height: 14,
                fontSize: '9px',
                lineHeight: '13px',
                textAlign: 'center',
                bgcolor: '#dadada',
                border: '1px solid white',
                borderRadius: '0',
                color: 'black',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: '#efefef',
                },
              }}
            >
              X
            </Box>
          </Box>
        </Box>

        {/* Menu bar */}
        <Box
          sx={{
            height: 22,
            display: 'flex',
            alignItems: 'center',
            bgcolor: '#efefef',
            borderBottom: '1px solid #cccccc',
            px: 1,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontSize: '11px',
              color: '#000',
              mr: 2,
              cursor: 'pointer',
              '&:hover': {
                color: '#551A8B',
                textDecoration: 'underline',
              },
            }}
            onClick={handleBackToLogin}
          >
            Back to Login
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontSize: '11px',
              color: '#000',
              cursor: 'pointer',
              '&:hover': {
                color: '#551A8B',
                textDecoration: 'underline',
              },
            }}
          >
            Help
          </Typography>
        </Box>

        {/* Main content */}
        <Box sx={{ bgcolor: 'white', p: 2, textAlign: 'center' }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              mb: 2,
              position: 'relative',
            }}
          >
            <Box
              component="img"
              src="https://i.ibb.co/hxwVLpW9/meetme.png"
              alt="Buzzed! Messenger Logo"
              sx={{ width: 120, height: 'auto' }}
            />
            
            {/* Success animation */}
            {registerSuccess && (
              <Box sx={{ position: 'absolute', right: 70, bottom: -10 }}>
                <motion.div
                  ref={faceRef}
                  initial={{ scale: 0 }}
                  animate={{ 
                    scale: [0, 1.2, 1],
                    rotate: [-5, 5, 0],
                    transition: { duration: 0.6 }
                  }}
                >
                  <Box
                    component="div"
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: '#FFDE00',
                      borderRadius: '50%',
                      border: '1px solid #999',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: 'inset -4px -4px 10px rgba(0,0,0,0.1), inset 4px 4px 10px rgba(255,255,255,0.7)',
                    }}
                  >
                    {/* Happy face */}
                    <Box sx={{ position: 'relative' }}>
                      {/* Eyes */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: 24 }}>
                        <Box
                          component="span"
                          sx={{
                            width: 8,
                            height: 8,
                            bgcolor: '#0000AA',
                            borderRadius: '50%',
                            display: 'block',
                          }}
                        />
                        <Box
                          component="span"
                          sx={{
                            width: 8,
                            height: 8,
                            bgcolor: '#0000AA',
                            borderRadius: '50%',
                            display: 'block',
                          }}
                        />
                      </Box>
                      
                      {/* Mouth */}
                      <Box
                        sx={{
                          width: 18,
                          height: 10,
                          bgcolor: '#DD0000',
                          borderRadius: '0 0 10px 10px',
                          margin: '4px auto 0',
                          position: 'relative',
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '3px',
                            backgroundColor: 'white',
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>
                </motion.div>
              </Box>
            )}
          </Box>
          
          <Typography 
            variant="subtitle1" 
            sx={{ 
              mb: 2, 
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#333'
            }}
          >
            {registerSuccess ? 'Registration Successful!' : 'Create a Buzzed! ID'}
          </Typography>

          {!registerSuccess && (
            <>
              <Box sx={{ textAlign: 'left', mb: 2 }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: 'block', 
                    mb: 0.5,
                    fontSize: '11px',
                    color: '#000',
                  }}
                >
                  Choose a Buzzed! ID:
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter a username"
                  sx={{
                    mb: 1.5,
                    '& .MuiOutlinedInput-root': {
                      height: '28px',
                      fontSize: '12px',
                      borderRadius: 0,
                      '& fieldset': {
                        borderColor: '#999',
                      },
                    },
                  }}
                />
                
                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: 'block', 
                    mb: 0.5,
                    fontSize: '11px',
                    color: '#000',
                  }}
                >
                  Password:
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  sx={{
                    mb: 1.5,
                    '& .MuiOutlinedInput-root': {
                      height: '28px',
                      fontSize: '12px',
                      borderRadius: 0,
                      '& fieldset': {
                        borderColor: '#999',
                      },
                    },
                  }}
                />
                
                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: 'block', 
                    mb: 0.5,
                    fontSize: '11px',
                    color: '#000',
                  }}
                >
                  Confirm Password:
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: '28px',
                      fontSize: '12px',
                      borderRadius: 0,
                      '& fieldset': {
                        borderColor: '#999',
                      },
                    },
                  }}
                />
              </Box>

              {error && (
                <Typography 
                  variant="caption" 
                  color="error" 
                  sx={{ 
                    display: 'block', 
                    mb: 1,
                    fontSize: '11px',
                  }}
                >
                  {error}
                </Typography>
              )}

              <Button
                variant="contained"
                fullWidth
                onClick={handleRegister}
                sx={{
                  textTransform: 'none',
                  bgcolor: '#D9BFFF',
                  color: '#000',
                  fontSize: '12px',
                  borderRadius: 0,
                  height: '24px',
                  border: '1px solid #9483A9',
                  fontWeight: 'normal',
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: '#E5D3FF',
                    boxShadow: 'none',
                  },
                }}
              >
                Create Account
              </Button>

              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Link
                  href="#"
                  underline="hover"
                  variant="caption"
                  sx={{
                    fontSize: '11px',
                    color: '#0000EE',
                    cursor: 'pointer',
                  }}
                  onClick={handleBackToLogin}
                >
                  Already have an account? Sign In
                </Link>
              </Box>
            </>
          )}
          
          {registerSuccess && (
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#007700',
                fontSize: '12px'
              }}
            >
              Your account has been created successfully! Redirecting to chat...
            </Typography>
          )}
        </Box>
      </Paper>
    </Box>
  );
}

export default RegisterPage; 