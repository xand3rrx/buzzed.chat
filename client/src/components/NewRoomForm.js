import React, { useState } from 'react';
import {
  Paper,
  TextField,
  Button,
  Box,
  Typography,
} from '@mui/material';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

function NewRoomForm({ onCreateRoom }) {
  const [roomName, setRoomName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (roomName.trim()) {
      onCreateRoom(roomName.trim());
      setRoomName('');
    }
  };

  return (
    <Paper 
      sx={{ 
        background: 'linear-gradient(180deg, rgba(26, 32, 39, 0.95) 0%, rgba(10, 25, 41, 0.95) 100%)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <Box
        sx={{
          p: 2.5,
          borderBottom: '1px solid rgba(66, 165, 245, 0.1)',
          background: 'linear-gradient(90deg, rgba(66, 165, 245, 0.1) 0%, rgba(25, 118, 210, 0.1) 100%)',
        }}
      >
        <Typography 
          variant="h6" 
          sx={{
            color: 'primary.light',
            textShadow: '0 0 10px rgba(79, 195, 247, 0.3)',
            letterSpacing: '0.1em',
          }}
        >
          Launch Station
        </Typography>
      </Box>
      <Box sx={{ p: 2.5 }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Enter station name..."
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(26, 32, 39, 0.7)',
                  '&:hover': {
                    backgroundColor: 'rgba(26, 32, 39, 0.8)',
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'rgba(26, 32, 39, 0.9)',
                  },
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={!roomName.trim()}
              startIcon={<RocketLaunchIcon />}
              sx={{
                background: 'linear-gradient(45deg, rgba(79, 195, 247, 0.2) 0%, rgba(41, 182, 246, 0.2) 100%)',
                border: '1px solid rgba(79, 195, 247, 0.3)',
                color: 'primary.light',
                '&:hover': {
                  background: 'linear-gradient(45deg, rgba(79, 195, 247, 0.3) 0%, rgba(41, 182, 246, 0.3) 100%)',
                },
                '&:disabled': {
                  border: '1px solid rgba(79, 195, 247, 0.1)',
                  color: 'rgba(79, 195, 247, 0.3)',
                },
                minWidth: '120px',
              }}
            >
              Launch
            </Button>
          </Box>
        </form>
      </Box>
    </Paper>
  );
}

export default NewRoomForm; 