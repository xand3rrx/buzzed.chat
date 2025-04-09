import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import LandingPage from './components/LandingPage';
import ChatRoom from './components/ChatRoom';
import YahooLogin from './components/YahooLogin';
import RegisterPage from './components/RegisterPage';
import { io } from 'socket.io-client';

// Use environment variable with fallback to localhost for development
const SOCKET_SERVER = process.env.REACT_APP_SOCKET_SERVER || 'http://localhost:5000';
const socket = io(SOCKET_SERVER, {
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Protected route component to check if user is logged in
const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem('isRegisteredUser') === 'true';
  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }
  return children;
};

const theme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#f2e9f7',
      paper: '#ffffff',
    },
    primary: {
      main: '#770094',
      light: '#9a22bb',
      dark: '#5c0073',
    },
    secondary: {
      main: '#9e56b6',
      light: '#ba7fd0',
      dark: '#7c398f',
    },
    text: {
      primary: '#3b0046',
      secondary: '#5e2e79',
    }
  },
  typography: {
    fontFamily: '"Tahoma", "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          overscrollBehavior: 'none',
          '&::-webkit-scrollbar': {
            width: '16px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f0e5f5',
            border: '1px solid #dcc9e5',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'linear-gradient(to right, #b57ad9 0%, #9e56b6 100%)',
            border: '1px solid #770094',
            borderRadius: '0',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'linear-gradient(to right, #c490e4 0%, #b57ad9 100%)',
          },
        },
      },
    },
  },
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('loggedIn'));
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [socketConnected, setSocketConnected] = useState(socket.connected);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    socket.on('connect', () => {
      if (username) {
        socket.emit('use_existing_username', username);
      }
    });

    socket.on('login_success', (data) => {
      setIsAuthenticated(true);
      setUsername(data.username);
      localStorage.setItem('loggedIn', 'true');
      localStorage.setItem('username', data.username);
    });

    socket.on('login_successful', (data) => {
      setIsAuthenticated(true);
      setUsername(data.username);
      localStorage.setItem('loggedIn', 'true');
      localStorage.setItem('username', data.username);
    });

    socket.on('logout_success', () => {
      setIsAuthenticated(false);
      setUsername('');
      localStorage.removeItem('loggedIn');
      localStorage.removeItem('username');
    });

    return () => {
      socket.off('connect');
      socket.off('login_success');
      socket.off('login_successful');
      socket.off('logout_success');
    };
  }, [username]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<YahooLogin socket={socket} />} />
          <Route path="/register" element={<RegisterPage socket={socket} />} />
          
          {/* Protected routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <LandingPage socket={socket} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/room/:roomId" 
            element={
              <ProtectedRoute>
                <ChatRoom socket={socket} />
              </ProtectedRoute>
            } 
          />
          
          {/* Redirect to login for any other routes */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
