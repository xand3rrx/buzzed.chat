import React from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Typography,
  Box,
} from '@mui/material';

function ChatRoomList({ rooms, currentRoom, onRoomSelect }) {
  return (
    <Paper 
      sx={{ 
        flex: 1, 
        overflow: 'auto',
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
          Space Stations
        </Typography>
      </Box>
      <List sx={{ p: 2 }}>
        {rooms.map((room) => (
          <ListItem key={room._id} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              selected={currentRoom?._id === room._id}
              onClick={() => onRoomSelect(room)}
              sx={{
                borderRadius: 2,
                border: '1px solid',
                borderColor: currentRoom?._id === room._id 
                  ? 'rgba(79, 195, 247, 0.3)'
                  : 'rgba(66, 165, 245, 0.1)',
                background: currentRoom?._id === room._id
                  ? 'linear-gradient(135deg, rgba(79, 195, 247, 0.2) 0%, rgba(41, 182, 246, 0.2) 100%)'
                  : 'transparent',
                '&:hover': {
                  background: 'linear-gradient(135deg, rgba(79, 195, 247, 0.1) 0%, rgba(41, 182, 246, 0.1) 100%)',
                  borderColor: 'rgba(79, 195, 247, 0.2)',
                },
              }}
            >
              <ListItemText
                primary={room.name}
                secondary={`Created ${new Date(room.createdAt).toLocaleDateString()}`}
                primaryTypographyProps={{
                  sx: {
                    color: currentRoom?._id === room._id ? 'primary.light' : 'text.primary',
                    fontFamily: 'Orbitron',
                    fontSize: '0.9rem',
                    letterSpacing: '0.05em',
                  }
                }}
                secondaryTypographyProps={{
                  sx: {
                    color: 'text.secondary',
                    fontSize: '0.75rem',
                  }
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
        {rooms.length === 0 && (
          <ListItem>
            <ListItemText
              primary="No stations found"
              secondary="Create a new station to start chatting"
              primaryTypographyProps={{
                sx: {
                  color: 'text.secondary',
                  fontFamily: 'Orbitron',
                  fontSize: '0.9rem',
                  letterSpacing: '0.05em',
                }
              }}
              secondaryTypographyProps={{
                sx: {
                  color: 'text.secondary',
                  fontSize: '0.75rem',
                }
              }}
            />
          </ListItem>
        )}
      </List>
    </Paper>
  );
}

export default ChatRoomList; 