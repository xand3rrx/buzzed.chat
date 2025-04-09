import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Chip,
  IconButton,
  Avatar,
  ListItemAvatar,
  Tooltip,
  Divider,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import UserMenu from './UserMenu';
import AddIcon from '@mui/icons-material/Add';
import ChatIcon from '@mui/icons-material/Chat';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import MinimizeIcon from '@mui/icons-material/Minimize';
import DOMPurify from 'dompurify';

// Use environment variable with fallback to localhost for development
const SOCKET_SERVER = process.env.REACT_APP_SOCKET_SERVER || 'http://localhost:5000';
const socket = io(SOCKET_SERVER);

// Function to sanitize text
const sanitizeText = (text) => {
  // First use DOMPurify to clean the HTML
  const cleanHtml = DOMPurify.sanitize(text);
  // Then extract just the text content to remove any remaining HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = cleanHtml;
  return tempDiv.textContent || tempDiv.innerText || '';
};

function LandingPage() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const [username, setUsername] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [recentRooms, setRecentRooms] = useState([]);
  const [messages, setMessages] = useState([]);
  const [createRoomError, setCreateRoomError] = useState('');

  useEffect(() => {
    // Add Atkinson Hyperlegible font
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap';
    document.head.appendChild(link);
    
    // Check if username exists in localStorage
    const storedUsername = localStorage.getItem('chatUsername');
    if (storedUsername) {
      setUsername(storedUsername);
      // Tell the server to use the existing username
      socket.emit('use_existing_username', storedUsername);
    }
    
    // Get recent rooms from localStorage
    const recentRoomsData = localStorage.getItem('recentRooms');
    if (recentRoomsData) {
      setRecentRooms(JSON.parse(recentRoomsData));
    }
    
    // Listen for username assignment
    socket.on('username_assigned', (assignedUsername) => {
      if (!storedUsername) {
        setUsername(assignedUsername);
        localStorage.setItem('chatUsername', assignedUsername);
      }
    });
    
    // Handle username change responses
    socket.on('username_changed', (data) => {
      // Update username in localStorage and state
      setUsername(data.newUsername);
      localStorage.setItem('chatUsername', data.newUsername);
    });

    // Handle login responses
    socket.on('login_successful', (data) => {
      // Update username in localStorage and state
      setUsername(data.username);
      localStorage.setItem('chatUsername', data.username);
    });
    
    socket.on('rooms_list', (roomsList) => {
      console.log('Received rooms list:', roomsList);
      setRooms(roomsList);
    });

    socket.on('command_error', (data) => {
      setCreateRoomError(data.message);
    });

    socket.on('room_created', (newRoom) => {
      console.log('Room created:', newRoom);
      setRooms(prevRooms => [...prevRooms, newRoom]);
      addToRecentRooms(newRoom);
      setCreateRoomError(''); // Clear any previous errors
    });

    // Handle room deletion
    socket.on('room_deleted', (data) => {
      console.log('Room deleted:', data);
      // Remove the room from the rooms list
      setRooms(prevRooms => prevRooms.filter(room => room._id !== data.roomId));
      // Remove from recent rooms
      setRecentRooms(prevRooms => prevRooms.filter(room => room._id !== data.roomId));
      // Update localStorage
      localStorage.setItem('recentRooms', JSON.stringify(
        recentRooms.filter(room => room._id !== data.roomId)
      ));
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    socket.emit('get_rooms');

    return () => {
      socket.off('username_assigned');
      socket.off('username_changed');
      socket.off('login_successful');
      socket.off('rooms_list');
      socket.off('room_created');
      socket.off('room_deleted');
      socket.off('error');
      socket.off('command_error');
      document.head.removeChild(link);
    };
  }, []);

  // Function to add a room to the recent rooms list
  const addToRecentRooms = (room) => {
    const updatedRecentRooms = [
      room,
      ...recentRooms.filter(r => r._id !== room._id).slice(0, 9)
    ];
    setRecentRooms(updatedRecentRooms);
    localStorage.setItem('recentRooms', JSON.stringify(updatedRecentRooms));
  };

  const handleCreateRoom = () => {
    const sanitizedRoomName = sanitizeText(newRoomName.trim());
    if (sanitizedRoomName) {
      if (sanitizedRoomName.length > 30) {
        setCreateRoomError('Room name cannot be longer than 30 characters.');
        return;
      }
      console.log('Creating room:', sanitizedRoomName);
      socket.emit('create_room', sanitizedRoomName);
      setNewRoomName('');
    }
  };

  const handleJoinRoom = (room) => {
    // Update the URL structure to /room/:roomId instead of /chat/:roomId
    addToRecentRooms(room);
    navigate(`/room/${room._id}`);
  };

  // Filter rooms based on search query
  const filteredRooms = rooms.filter(room =>
    sanitizeText(room.name).toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get user's active/recent rooms first
  const activeRooms = recentRooms.filter(recentRoom => 
    rooms.some(room => room._id === recentRoom._id)
  );

  // Other available rooms (excluding active ones)
  const otherRooms = filteredRooms.filter(room => 
    !activeRooms.some(activeRoom => activeRoom._id === room._id)
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'url(/bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: '"Tahoma", sans-serif',
      }}
    >
      <Box
        sx={{
          width: '600px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 1,
          borderRadius: '0',
          overflow: 'hidden',
          boxShadow: '5px 5px 15px rgba(0, 0, 0, 0.35)',
          border: '1px solid #770094',
        }}
      >
        {/* Windows-style title bar with gradient */}
        <Box 
          sx={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(to bottom, #a33ebd 0%, #770094 100%)',
            color: '#fff',
            height: '24px',
            px: 0.5,
            userSelect: 'none',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box 
              component="img" 
              src="https://i.ibb.co/hxwVLpW9/meetme.png" 
              alt="Buzzed! Messenger" 
              sx={{ 
                width: 'auto',
                height: '18px',
                mr: 0.5,
              }}
            />
            <Typography 
              sx={{ 
                fontSize: '12px', 
                fontWeight: 'bold',
                fontFamily: '"Tahoma", sans-serif',
              }}
            >
              Buzzed! Messenger - Chat Rooms
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton 
              size="small" 
              sx={{ 
                padding: 0,
                width: '18px',
                height: '18px',
                borderRadius: 0,
                bgcolor: '#f0d5ff',
                border: '1px solid #770094',
                '&:hover': {
                  bgcolor: '#f9e5ff',
                },
              }}
            >
              <CloseIcon sx={{ fontSize: '12px', color: '#000' }} />
            </IconButton>
          </Box>
        </Box>

        {/* Buzzed! Messenger toolbar */}
        <Box 
          sx={{ 
            py: 0.5, 
            px: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            background: '#f2e9f7',
            borderBottom: '1px solid #b57ad9',
          }}
        >
          <Box 
            component="button"
            onClick={() => setShowCreateForm(true)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(to bottom, #ffffff 0%, #f0e5f5 100%)',
              border: '1px solid #9e56b6',
              borderRadius: '3px',
              px: 1,
              py: 0.25,
              fontSize: '11px',
              fontFamily: '"Tahoma", sans-serif',
              color: '#000',
              cursor: 'pointer',
              '&:hover': {
                background: 'linear-gradient(to bottom, #ffffff 0%, #f0f0f0 100%)',
              },
            }}
          >
            <AddIcon sx={{ fontSize: '14px', mr: 0.5 }} />
            Create Room
          </Box>
          
          <Box sx={{ flexGrow: 1 }} />
          
          {/* User menu */}
          <UserMenu username={username} socket={socket} />
        </Box>
        
        {/* Create room form */}
        {showCreateForm && (
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '300px',
            bgcolor: '#ffffff',
            border: '1px solid #770094',
            boxShadow: '5px 5px 15px rgba(0, 0, 0, 0.35)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* Windows-style title bar with gradient */}
            <Box 
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'linear-gradient(to bottom, #a33ebd 0%, #770094 100%)',
                color: '#fff',
                height: '24px',
                px: 0.5,
                userSelect: 'none',
              }}
            >
              <Typography 
                sx={{ 
                  fontSize: '12px', 
                  fontWeight: 'bold',
                  fontFamily: '"Tahoma", sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                <AddIcon sx={{ fontSize: '14px' }} />
                Create New Room
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton 
                  size="small" 
                  onClick={() => {
                    setShowCreateForm(false);
                    setCreateRoomError('');
                  }}
                  sx={{ 
                    padding: 0,
                    width: '18px',
                    height: '18px',
                    borderRadius: 0,
                    bgcolor: '#f0d5ff',
                    border: '1px solid #770094',
                    '&:hover': {
                      bgcolor: '#f9e5ff',
                    },
                  }}
                >
                  <CloseIcon sx={{ fontSize: '12px', color: '#000' }} />
                </IconButton>
              </Box>
            </Box>

            {/* Form content */}
            <Box sx={{ p: 2 }}>
              <Typography sx={{
                fontSize: '11px',
                fontFamily: '"Tahoma", sans-serif',
                color: '#666',
                mb: 1.5,
              }}>
                Enter a name for your new chat room:
              </Typography>

              <TextField
                fullWidth
                size="small"
                value={newRoomName}
                onChange={(e) => {
                  setNewRoomName(e.target.value);
                  setCreateRoomError('');
                }}
                placeholder="Enter room name..."
                inputProps={{
                  maxLength: 30,
                }}
                helperText={createRoomError || `${newRoomName.length}/30 characters`}
                error={!!createRoomError}
                FormHelperTextProps={{
                  sx: {
                    fontSize: '11px',
                    fontFamily: '"Tahoma", sans-serif',
                    mt: 0.5,
                    color: createRoomError ? '#d32f2f' : 'inherit',
                  }
                }}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    fontSize: '12px',
                    fontFamily: '"Tahoma", sans-serif',
                  },
                }}
              />

              {/* Footer with buttons */}
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end', 
                  gap: 1,
                  borderTop: '1px solid #e0e0e0',
                  pt: 2,
                }}
              >
                <Button
                  size="small"
                  onClick={() => {
                    setShowCreateForm(false);
                    setCreateRoomError('');
                  }}
                  sx={{
                    fontSize: '11px',
                    fontFamily: '"Tahoma", sans-serif',
                    textTransform: 'none',
                    color: '#000000',
                    background: 'linear-gradient(to bottom, #ffffff 0%, #e3e3e3 100%)',
                    border: '1px solid #b3b3b3',
                    borderRadius: '3px',
                    px: 2,
                    '&:hover': {
                      background: 'linear-gradient(to bottom, #ffffff 0%, #f2f2f2 100%)',
                      borderColor: '#999999',
                    },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="small"
                  onClick={handleCreateRoom}
                  disabled={!newRoomName.trim() || newRoomName.length > 30 || !!createRoomError}
                  sx={{
                    fontSize: '11px',
                    fontFamily: '"Tahoma", sans-serif',
                    textTransform: 'none',
                    background: 'linear-gradient(to bottom, #a33ebd 0%, #770094 100%)',
                    border: '1px solid #770094',
                    borderRadius: '3px',
                    color: '#ffffff',
                    px: 2,
                    '&:hover': {
                      background: 'linear-gradient(to bottom, #b44dd1 0%, #8f00b3 100%)',
                    },
                    '&.Mui-disabled': {
                      background: 'linear-gradient(to bottom, #e0e0e0 0%, #d0d0d0 100%)',
                      border: '1px solid #cccccc',
                      color: '#999999',
                    },
                  }}
                >
                  Create Room
                </Button>
              </Box>
            </Box>
          </Box>
        )}

        {/* Search box */}
        <Box sx={{
          p: 2,
          bgcolor: '#ffffff',
          borderBottom: '1px solid #e0e0e0',
        }}>
          <Box sx={{ 
            display: 'flex',
            gap: 1,
            alignItems: 'center'
          }}>
            <TextField
              fullWidth
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search rooms..."
              variant="outlined"
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: '#999', mr: 1, fontSize: '18px' }} />,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  height: '32px',
                  fontSize: '12px',
                  backgroundColor: '#ffffff',
                  fontFamily: '"Tahoma", sans-serif',
                },
              }}
            />
          </Box>
        </Box>
        
        {/* Room list section */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            bgcolor: '#ffffff',
            maxHeight: 'calc(100vh - 300px)',
            '&::-webkit-scrollbar': {
              width: '16px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f0f0f0',
              border: '1px solid #d4d4d4',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'linear-gradient(to right, #c1d5f0 0%, #a5bedc 100%)',
              border: '1px solid #7b9ebd',
              borderRadius: '0',
              '&:hover': {
                background: 'linear-gradient(to right, #d7e5f7 0%, #bfd2e8 100%)',
              },
            },
          }}
        >
          {/* Recent/Active Rooms Section */}
          {activeRooms.length > 0 && (
            <>
              <Typography
                sx={{
                  fontSize: '12px',
                  fontWeight: 'bold',
                  padding: 1,
                  fontFamily: '"Tahoma", sans-serif',
                  color: '#6689bc',
                  bgcolor: '#f0f5fa',
                  borderBottom: '1px solid #e0e0e0',
                  position: 'sticky',
                  top: 0,
                  zIndex: 1,
                }}
              >
                Active Rooms
              </Typography>
              <List disablePadding sx={{ mt: 0.5, mb: 1.5 }}>
                {activeRooms.map((room) => (
                  <ListItem
                    key={room._id}
                    disablePadding
                    divider
                    button
                    onClick={() => handleJoinRoom(room)}
                    sx={{
                      '&:hover': {
                        bgcolor: '#f5f8fc',
                      },
                      py: 0.75,
                    }}
                  >
                    <ListItemAvatar sx={{ minWidth: '44px', ml: 1 }}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: '#6689bc',
                          fontSize: '14px',
                        }}
                      >
                        {sanitizeText(room.name).charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={sanitizeText(room.name)}
                      secondary={room.owner === username ? "You own this room" : null}
                      primaryTypographyProps={{
                        fontSize: '13px',
                        fontFamily: '"Tahoma", sans-serif',
                        color: '#000000',
                      }}
                      secondaryTypographyProps={{
                        fontSize: '11px',
                        color: '#006600',
                        fontFamily: '"Tahoma", sans-serif',
                      }}
                    />
                    <Chip
                      size="small"
                      label="Join"
                      sx={{
                        fontSize: '11px',
                        height: '20px',
                        mr: 1,
                        bgcolor: '#eef2f8',
                        border: '1px solid #bfd2e8',
                        fontFamily: '"Tahoma", sans-serif',
                        color: '#000000',
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: '#d7e5f7',
                        },
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}

          {/* Available Rooms Section */}
          <Typography
            sx={{
              fontSize: '12px',
              fontWeight: 'bold',
              padding: 1,
              fontFamily: '"Tahoma", sans-serif',
              color: '#808080',
              bgcolor: '#f0f5fa',
              borderBottom: '1px solid #e0e0e0',
              borderTop: activeRooms.length > 0 ? '1px solid #e0e0e0' : 'none',
              mt: 1,
              position: 'sticky',
              top: activeRooms.length > 0 ? '40px' : '0',
              zIndex: 1,
            }}
          >
            Available Rooms
          </Typography>
          <List disablePadding sx={{ mt: 0.5, mb: 1 }}>
            {otherRooms.length > 0 ? (
              otherRooms.map((room) => (
                <ListItem
                  key={room._id}
                  disablePadding
                  divider
                  button
                  onClick={() => handleJoinRoom(room)}
                  sx={{
                    '&:hover': {
                      bgcolor: '#f5f8fc',
                    },
                    py: 0.75,
                  }}
                >
                  <ListItemAvatar sx={{ minWidth: '44px', ml: 1 }}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: '#6689bc',
                        fontSize: '14px',
                      }}
                    >
                      {sanitizeText(room.name).charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={sanitizeText(room.name)}
                    secondary={room.owner === username ? "You own this room" : null}
                    primaryTypographyProps={{
                      fontSize: '13px',
                      fontFamily: '"Tahoma", sans-serif',
                      color: '#000000',
                    }}
                    secondaryTypographyProps={{
                      fontSize: '11px',
                      color: '#006600',
                      fontFamily: '"Tahoma", sans-serif',
                    }}
                  />
                  <Chip
                    size="small"
                    label="Join"
                    sx={{
                      fontSize: '11px',
                      height: '20px',
                      mr: 1,
                      bgcolor: '#eef2f8',
                      border: '1px solid #bfd2e8',
                      fontFamily: '"Tahoma", sans-serif',
                      color: '#000000',
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: '#d7e5f7',
                      },
                    }}
                  />
                </ListItem>
              ))
            ) : (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography sx={{ fontSize: '12px', color: '#999', fontFamily: '"Tahoma", sans-serif' }}>
                  {searchQuery ? "No matching rooms found" : "No available rooms"}
                </Typography>
              </Box>
            )}
          </List>
        </Box>
        
        {/* Bottom status bar */}
        <Box 
          sx={{ 
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            px: 1,
            py: 0.25,
            background: 'linear-gradient(to bottom, #a33ebd 0%, #770094 100%)',
            fontSize: '10px',
            color: '#ffffff',
            fontFamily: '"Tahoma", sans-serif',
          }}
        >
          <Typography sx={{ fontSize: '10px', fontFamily: '"Tahoma", sans-serif' }}>
            {username} • Online
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Typography sx={{ fontSize: '10px', fontFamily: '"Tahoma", sans-serif' }}>
            Buzzed! Messenger
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default LandingPage; 