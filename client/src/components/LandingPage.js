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

const socket = io('http://localhost:5000');

function LandingPage() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const [username, setUsername] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [recentRooms, setRecentRooms] = useState([]);

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

    socket.on('room_created', (newRoom) => {
      console.log('Room created:', newRoom);
      setRooms(prevRooms => [...prevRooms, newRoom]);
      // Add to recent rooms
      addToRecentRooms(newRoom);
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
      socket.off('error');
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
    if (newRoomName.trim()) {
      console.log('Creating room:', newRoomName.trim());
      socket.emit('create_room', newRoomName.trim());
      setNewRoomName('');
      setShowCreateForm(false);
    }
  };

  const handleJoinRoom = (room) => {
    // Update the URL structure to /room/:roomId instead of /chat/:roomId
    addToRecentRooms(room);
    navigate(`/room/${room._id}`);
  };

  // Filter rooms based on search query
  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
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
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#ebeef4',
        backgroundImage: 'url(https://wallpapercave.com/wp/wp2754141.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
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
              alt="MeetMe" 
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
            p: 2,
            bgcolor: '#f7eefb',
            borderBottom: '1px solid #b57ad9',
          }}>
            <Typography
              sx={{ 
                fontSize: '12px',
                fontWeight: 'bold',
                mb: 1,
                fontFamily: '"Tahoma", sans-serif',
              }}
            >
              Create New Chat Room
            </Typography>
            <Box sx={{ 
              display: 'flex',
              gap: 1,
              alignItems: 'center'
            }}>
              <TextField
                fullWidth
                size="small"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="Room name"
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: '30px',
                    fontSize: '12px',
                    backgroundColor: '#ffffff',
                    fontFamily: '"Tahoma", sans-serif',
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={handleCreateRoom}
                disabled={!newRoomName.trim()}
                sx={{
                  textTransform: 'none',
                  fontSize: '12px',
                  py: 0.5,
                  minWidth: '60px',
                  backgroundColor: '#770094',
                  '&:hover': {
                    backgroundColor: '#5c0073',
                  },
                  '&.Mui-disabled': {
                    backgroundColor: '#cccccc',
                  },
                  fontFamily: '"Tahoma", sans-serif',
                }}
              >
                Create
              </Button>
              <IconButton
                size="small"
                onClick={() => setShowCreateForm(false)}
                sx={{
                  width: '24px',
                  height: '24px',
                  color: '#666',
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        )}

        {/* Search box */}
        <Box sx={{
          p: 2,
          bgcolor: '#ffffff',
          borderBottom: '1px solid #e0e0e0',
          mb: 1,
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
                  mt: 1,
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
                        {room.name.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={room.name}
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
                      {room.name.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={room.name}
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