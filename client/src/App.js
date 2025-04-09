import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import LandingPage from './components/LandingPage';
import ChatRoom from './components/ChatRoom';
import YahooLogin from './components/YahooLogin';
import RegisterPage from './components/RegisterPage';
import SocketDebugger from './components/SocketDebugger';
import { io } from 'socket.io-client';

// Initialize socket connection with the proper server URL
// The server is likely running on a different port (probably 5000)
const socket = io('http://localhost:5000', {
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  timeout: 10000,
  autoConnect: true,
  forceNew: true,
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
  const [socketConnected, setSocketConnected] = useState(socket.connected);
  const [showDebugger, setShowDebugger] = useState(false); // State to toggle debugger

  useEffect(() => {
    // Socket connection event handlers
    const onConnect = () => {
      console.log('Socket connected!');
      setSocketConnected(true);
    };

    const onDisconnect = () => {
      console.log('Socket disconnected!');
      setSocketConnected(false);
    };

    // Debug all socket events
    const debugAllEvents = (event, ...args) => {
      console.log(`[DEBUG] Socket event "${event}":`, args);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.onAny(debugAllEvents);

    // Specific login event handlers
    socket.on('login_success', (data) => {
      console.log('Received login_success event:', data);
    });
    
    socket.on('login_successful', (data) => {
      console.log('Received login_successful event:', data);
    });

    // Handle logout success event
    socket.on('logout_success', () => {
      console.log('Received logout_success event');
      localStorage.removeItem('isRegisteredUser');
      localStorage.removeItem('chatUsername');
    });

    // Make sure socket is connected
    if (!socket.connected) {
      console.log('Attempting to connect socket...');
      socket.connect();
    }

    // Cleanup event listeners on component unmount
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('login_success');
      socket.off('login_successful');
      socket.off('logout_success');
      socket.offAny(debugAllEvents);
    };
  }, []);

  // Toggle debugger visibility
  const toggleDebugger = () => {
    setShowDebugger(prev => !prev);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Socket Debugger - can be toggled with Ctrl+D */}
      {showDebugger && <SocketDebugger socket={socket} />}
      <div onKeyDown={(e) => {
        if (e.ctrlKey && e.key === 'd') {
          e.preventDefault();
          toggleDebugger();
        }
      }} tabIndex={0} style={{ outline: 'none', height: '100%' }}>
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
      </div>
    </ThemeProvider>
  );
}

export default App;
