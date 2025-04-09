import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  Paper,
  Link,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function YahooLogin({ socket }) {
  const [animationState, setAnimationState] = useState('sleep');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [autoSignIn, setAutoSignIn] = useState(false);
  const [signInAsInvisible, setSignInAsInvisible] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAwake, setIsAwake] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const navigate = useNavigate();
  const animationRef = useRef(null);

  useEffect(() => {
    // Socket connection check
    if (!socket.connected) {
      socket.connect();
    }

    // Event listeners setup
    socket.on('login_successful', (data) => {
      setIsSubmitting(false);
      localStorage.setItem('loggedIn', 'true');
      localStorage.setItem('username', data.username);
      navigate('/');
    });

    socket.on('command_error', ({ message }) => {
      setIsSubmitting(false);
      setError(message);
      setAnimationState('sleep');
    });

    return () => {
      socket.off('login_successful');
      socket.off('command_error');
    };
  }, [navigate]);

  const handleLogin = () => {
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    setError('');
    setAnimationState('wake');
    setIsSubmitting(true);

    // Handle case where socket might not be connected
    if (!socket.connected) {
      socket.connect();
      // Wait for socket to connect before sending login request
      setTimeout(() => {
        socket.emit('login_username', { username, password });
      }, 1000);
    } else {
      socket.emit('login_username', { username, password });
    }
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#f0f0f0',
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
              src="https://i.imgur.com/jTJ4b6C.png"
              alt="Yahoo Icon"
              sx={{ 
                width: 15, 
                height: 15,
                mr: 0.5,
                mt: '-2px'
              }}
            />
            BUZZED! MESSENGER
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
          >
            Messenger
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
        <Box sx={{ bgcolor: 'white', p: 2, pt: 6, textAlign: 'center' }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              mb: 2,
              position: 'relative',
            }}
          >
            {/* Logo and animated character */}
            <Box
              component="img"
              src="https://i.ibb.co/hxwVLpW9/meetme.png" // Our new logo
              alt="MeetMe Logo"
              sx={{ 
                width: 120, 
                height: 'auto',
                position: 'relative',
                top: '-15px' // Move logo up
              }}
            />
            <Box sx={{ position: 'absolute', left: '60%', top: '45%' }}> {/* Move animation down */}
              <motion.div
                ref={animationRef}
                initial={{ rotate: 0 }}
                animate={
                  isAwake
                    ? {
                        scale: [1, 1.1, 1],
                        rotate: [-5, 5, 0],
                        transition: { duration: 0.5 }
                      }
                    : {}
                }
              >
                <Box
                  component="img"
                  src={isAwake ? "/welcome/wake.png" : "/welcome/sleep.png"}
                  alt={isAwake ? "Awake Character" : "Sleeping Character"}
                  sx={{
                    width: 60,
                    height: 60,
                    objectFit: 'contain',
                  }}
                />
              </motion.div>
            </Box>
          </Box>

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
              Buzzed! ID:
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
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
              placeholder="••••••••"
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

          <Box sx={{ textAlign: 'center', mb: 1 }}>
            <Link
              href="#"
              underline="hover"
              variant="caption"
              sx={{
                fontSize: '11px',
                color: '#0000EE',
                cursor: 'pointer',
              }}
              onClick={handleRegister}
            >
              Get a new Buzzed! ID...
            </Link>
          </Box>

          <Box sx={{ textAlign: 'left', mb: 2 }}>
            <FormControlLabel
              control={
                <Checkbox 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  size="small"
                  sx={{ 
                    padding: '2px',
                    '& .MuiSvgIcon-root': { 
                      fontSize: 14,
                      color: '#666',
                    },
                  }}
                />
              }
              label="Remember my ID & password"
              sx={{
                margin: 0,
                '& .MuiFormControlLabel-label': {
                  fontSize: '11px',
                  color: '#000',
                },
              }}
            />
            <FormControlLabel
              control={
                <Checkbox 
                  checked={autoSignIn}
                  onChange={(e) => setAutoSignIn(e.target.checked)}
                  size="small"
                  sx={{ 
                    padding: '2px',
                    '& .MuiSvgIcon-root': { 
                      fontSize: 14,
                      color: '#666',
                    },
                  }}
                />
              }
              label="Sign in automatically"
              sx={{
                margin: 0,
                '& .MuiFormControlLabel-label': {
                  fontSize: '11px',
                  color: '#000',
                },
              }}
            />
            <FormControlLabel
              control={
                <Checkbox 
                  checked={signInAsInvisible}
                  onChange={(e) => setSignInAsInvisible(e.target.checked)}
                  size="small"
                  sx={{ 
                    padding: '2px',
                    '& .MuiSvgIcon-root': { 
                      fontSize: 14,
                      color: '#666',
                    },
                  }}
                />
              }
              label="Sign in as invisible to everyone"
              sx={{
                margin: 0,
                '& .MuiFormControlLabel-label': {
                  fontSize: '11px',
                  color: '#000',
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
            onClick={handleLogin}
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
            Sign In
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
            >
              Forgot your password?
            </Link>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

export default YahooLogin; 