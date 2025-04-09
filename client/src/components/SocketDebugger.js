import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';

function SocketDebugger({ socket }) {
  const [status, setStatus] = useState('unknown');
  const [socketId, setSocketId] = useState('none');
  const [expanded, setExpanded] = useState(false);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (!socket) {
      setStatus('no socket');
      return;
    }

    // Set initial status
    setStatus(socket.connected ? 'connected' : 'disconnected');
    setSocketId(socket.id || 'none');

    // Socket connection status listeners
    const handleConnect = () => {
      setStatus('connected');
      setSocketId(socket.id);
      addLog('Socket connected');
    };

    const handleDisconnect = (reason) => {
      setStatus('disconnected');
      addLog(`Socket disconnected: ${reason}`);
    };

    const handleConnectError = (error) => {
      setStatus('error');
      addLog(`Connection error: ${error?.message || 'unknown error'}`);
    };

    // Add listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);

    // Debug event logger
    if (expanded) {
      const originalOnAny = socket.onAny;
      socket.onAny((event, ...args) => {
        addLog(`Event: ${event}`);
      });

      return () => {
        socket.onAny = originalOnAny;
      };
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
    };
  }, [socket, expanded]);

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-9), `${timestamp}: ${message}`]); // Keep last 10 logs
  };

  const handleConnect = () => {
    if (socket) {
      addLog('Manually connecting socket...');
      socket.connect();
    }
  };

  const handleDisconnect = () => {
    if (socket) {
      addLog('Manually disconnecting socket...');
      socket.disconnect();
    }
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 10,
        right: 10,
        zIndex: 9999,
        width: expanded ? 300 : 'auto',
      }}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          p: 1, 
          backgroundColor: 'rgba(0,0,0,0.8)',
          color: 'white'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: expanded ? 1 : 0 }}>
          <Typography variant="caption" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
            Socket: 
            <Box 
              sx={{ 
                ml: 1, 
                width: 10, 
                height: 10, 
                borderRadius: '50%', 
                bgcolor: status === 'connected' ? 'green' : status === 'disconnected' ? 'red' : 'orange',
                display: 'inline-block' 
              }} 
            />
            <Typography variant="caption" sx={{ ml: 1 }}>
              {status}
            </Typography>
          </Typography>
          <Button 
            variant="text" 
            color="inherit" 
            size="small" 
            onClick={toggleExpanded}
            sx={{ 
              minWidth: 'auto', 
              p: 0.5,
              color: 'white',
              fontSize: '10px'
            }}
          >
            {expanded ? 'Hide' : 'Debug'}
          </Button>
        </Box>
        
        {expanded && (
          <>
            <Typography variant="caption" component="div">
              ID: {socketId}
            </Typography>
            
            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
              <Button 
                variant="outlined" 
                color="primary" 
                size="small" 
                onClick={handleConnect}
                sx={{ 
                  fontSize: '10px', 
                  py: 0, 
                  minHeight: '24px',
                  color: 'white',
                  borderColor: 'white'
                }}
              >
                Connect
              </Button>
              <Button 
                variant="outlined" 
                color="secondary" 
                size="small" 
                onClick={handleDisconnect}
                sx={{ 
                  fontSize: '10px', 
                  py: 0, 
                  minHeight: '24px',
                  color: 'white',
                  borderColor: 'white'
                }}
              >
                Disconnect
              </Button>
            </Box>
            
            <Box 
              sx={{ 
                mt: 1, 
                height: 150, 
                overflow: 'auto', 
                fontSize: '10px',
                backgroundColor: 'rgba(0,0,0,0.5)',
                p: 0.5,
                borderRadius: 1
              }}
            >
              {logs.map((log, i) => (
                <Typography
                  key={i}
                  variant="caption"
                  component="div"
                  sx={{
                    fontSize: '9px',
                    fontFamily: 'monospace',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {log}
                </Typography>
              ))}
              {logs.length === 0 && (
                <Typography variant="caption" sx={{ fontSize: '9px', fontStyle: 'italic' }}>
                  No events logged yet
                </Typography>
              )}
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
}

export default SocketDebugger; 