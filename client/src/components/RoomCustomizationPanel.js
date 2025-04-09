import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  Typography,
  IconButton,
  Card,
  CardActionArea,
  Grid,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import FormatPaintIcon from '@mui/icons-material/FormatPaint';
import MouseIcon from '@mui/icons-material/Mouse';
import CloseIcon from '@mui/icons-material/Close';
import MinimizeIcon from '@mui/icons-material/Remove';
import MaximizeIcon from '@mui/icons-material/CropSquare';
import LinkIcon from '@mui/icons-material/Link';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ChatIcon from '@mui/icons-material/Chat';

// Example space backgrounds and cursors for quick selection
const backgroundOptions = [
  { name: 'Space', url: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986' },
  { name: 'Galaxy', url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564' },
  { name: 'Nebula', url: 'https://images.unsplash.com/photo-1543722530-d2c3201371e7' },
  { name: 'Stars', url: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a' },
  { name: 'Aurora', url: 'https://images.unsplash.com/photo-1483086431886-3590a88317fe' },
  { name: 'Dark', url: 'https://images.unsplash.com/photo-1572439246916-c7cb7fac6094' }
];

// Chat area background options - lighter patterns that work well with text
const chatBackgroundOptions = [
  { name: 'Light Pattern', url: 'https://www.transparenttextures.com/patterns/light-paper-fibers.png' },
  { name: 'Subtle Dots', url: 'https://www.transparenttextures.com/patterns/subtle-dots.png' },
  { name: 'Grid', url: 'https://www.transparenttextures.com/patterns/grid-me.png' },
  { name: 'Soft Wallpaper', url: 'https://www.transparenttextures.com/patterns/soft-wallpaper.png' },
  { name: 'Textured Paper', url: 'https://www.transparenttextures.com/patterns/textured-paper.png' },
  { name: 'White Texture', url: 'https://www.transparenttextures.com/patterns/white-texture.png' }
];

function RoomCustomizationPanel({ roomId, socket, isRoomOwner, dialogOpen, setDialogOpen }) {
  const [customBackgroundUrl, setCustomBackgroundUrl] = useState('');
  const [customCursorUrl, setCustomCursorUrl] = useState('');
  const [customChatBackgroundUrl, setCustomChatBackgroundUrl] = useState('');
  const [selectedBackground, setSelectedBackground] = useState('');
  const [selectedChatBackground, setSelectedChatBackground] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [previewBackground, setPreviewBackground] = useState('');
  const [previewCursor, setPreviewCursor] = useState('');
  const [previewChatBackground, setPreviewChatBackground] = useState('');
  
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };
  
  const handleTabChange = (newValue) => {
    setActiveTab(newValue);
  };
  
  const handleBackgroundSelect = (url) => {
    setSelectedBackground(url);
    setCustomBackgroundUrl('');
    setPreviewBackground(url);
  };
  
  const handleChatBackgroundSelect = (url) => {
    setSelectedChatBackground(url);
    setCustomChatBackgroundUrl('');
    setPreviewChatBackground(url);
  };
  
  const handleCustomBackgroundChange = (e) => {
    setCustomBackgroundUrl(e.target.value);
    setSelectedBackground('');
    if (e.target.value) {
      setPreviewBackground(e.target.value);
    }
  };
  
  const handleCustomCursorChange = (e) => {
    setCustomCursorUrl(e.target.value);
    if (e.target.value) {
      setPreviewCursor(e.target.value);
    }
  };
  
  const handleCustomChatBackgroundChange = (e) => {
    setCustomChatBackgroundUrl(e.target.value);
    setSelectedChatBackground('');
    if (e.target.value) {
      setPreviewChatBackground(e.target.value);
    }
  };
  
  const handleSaveCustomization = () => {
    // Background customization
    const backgroundUrl = selectedBackground || customBackgroundUrl;
    
    // Cursor customization
    const cursorUrl = customCursorUrl;
    
    // Chat background customization
    const chatBackgroundUrl = selectedChatBackground || customChatBackgroundUrl;
    
    if (backgroundUrl || cursorUrl || chatBackgroundUrl) {
      socket.emit('update_room_customization', { 
        roomId, 
        backgroundUrl, 
        cursorUrl,
        chatBackgroundUrl
      });
    }
    
    handleCloseDialog();
  };
  
  const handlePreviewCustom = (type) => {
    if (type === 'background' && customBackgroundUrl) {
      setPreviewBackground(customBackgroundUrl);
    } else if (type === 'cursor' && customCursorUrl) {
      setPreviewCursor(customCursorUrl);
    } else if (type === 'chatBackground' && customChatBackgroundUrl) {
      setPreviewChatBackground(customChatBackgroundUrl);
    }
  };
  
  // Listen for room data to initialize previews
  React.useEffect(() => {
    if (socket && dialogOpen) {
      // When dialog opens, request room data to initialize previews
      socket.emit('get_room_data', roomId);
      
      const handleRoomData = (roomData) => {
        if (roomData.customization?.backgroundUrl) {
          setPreviewBackground(roomData.customization.backgroundUrl);
        }
        if (roomData.customization?.cursorUrl) {
          setPreviewCursor(roomData.customization.cursorUrl);
        }
        if (roomData.customization?.chatBackgroundUrl) {
          setPreviewChatBackground(roomData.customization.chatBackgroundUrl);
        }
      };
      
      socket.on('room_data', handleRoomData);
      
      return () => {
        socket.off('room_data', handleRoomData);
      };
    }
  }, [socket, dialogOpen, roomId]);
  
  if (!isRoomOwner) return null;
  
  return (
    <>
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#f5eef8',
            color: '#000',
            borderRadius: '0',
            overflow: 'hidden',
            boxShadow: '5px 5px 15px rgba(0, 0, 0, 0.35)',
            border: '1px solid #770094',
            maxWidth: '750px',
            height: 'auto',
            maxHeight: '90vh',
          }
        }}
      >
        {/* Windows-style title bar */}
        <Box 
          sx={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#a1009c',
            color: '#fff',
            height: '22px',
            px: 1,
            userSelect: 'none',
          }}
        >
          <Typography 
            sx={{ 
              fontSize: '11px', 
              fontWeight: 'bold',
              fontFamily: '"Tahoma", sans-serif',
            }}
          >
            Room Customization Settings
          </Typography>
          <Box sx={{ display: 'flex' }}>
            <IconButton 
              size="small" 
              edge="end" 
              color="inherit" 
              sx={{ 
                padding: '2px',
                height: '16px',
                width: '16px',
                marginLeft: '4px',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)'
                }
              }}
            >
              <MinimizeIcon fontSize="small" sx={{ fontSize: '12px' }} />
            </IconButton>
            <IconButton 
              size="small" 
              edge="end" 
              color="inherit" 
              sx={{ 
                padding: '2px',
                height: '16px',
                width: '16px',
                marginLeft: '4px',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)'
                }
              }}
            >
              <MaximizeIcon fontSize="small" sx={{ fontSize: '12px' }} />
            </IconButton>
            <IconButton 
              size="small" 
              edge="end" 
              color="inherit" 
              onClick={handleCloseDialog} 
              aria-label="close"
              sx={{ 
                padding: '2px',
                height: '16px',
                width: '16px',
                marginLeft: '4px',
                '&:hover': {
                  backgroundColor: 'rgba(255, 0, 0, 0.7)'
                }
              }}
            >
              <CloseIcon fontSize="small" sx={{ fontSize: '12px' }} />
            </IconButton>
          </Box>
        </Box>
        
        {/* Main content area with sidebar tabs and content */}
        <Box sx={{ display: 'flex', height: 'calc(100% - 70px)' }}>
          {/* Left sidebar with tabs */}
          <Box 
            sx={{ 
              width: '180px', 
              borderRight: '1px solid #c094ca',
              backgroundColor: '#e9d9ef',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ 
              padding: '10px 8px', 
              borderBottom: '1px solid #c094ca'
            }}>
              <Typography 
                sx={{ 
                  fontSize: '12px', 
                  fontWeight: 'bold', 
                  fontFamily: '"Tahoma", sans-serif',
                  color: '#5c0057'
                }}
              >
                Room Settings
              </Typography>
            </Box>
            
            <List sx={{ padding: 0 }}>
              <ListItem 
                button 
                selected={activeTab === 0}
                onClick={() => handleTabChange(0)}
                sx={{ 
                  paddingY: '6px',
                  paddingX: '8px',
                  minHeight: '32px',
                  borderBottom: '1px solid #e9d9ef',
                  bgcolor: activeTab === 0 ? '#dcc4e9' : 'transparent',
                  '&:hover': {
                    bgcolor: '#e7d3f1',
                  },
                  '&.Mui-selected': {
                    bgcolor: '#dcc4e9',
                    '&:hover': {
                      bgcolor: '#dcc4e9',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: '28px' }}>
                  <ChatIcon sx={{ fontSize: '16px', color: '#5c0057' }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Chat Background" 
                  primaryTypographyProps={{
                    fontSize: '11px',
                    fontFamily: '"Tahoma", sans-serif',
                    color: '#000',
                  }}
                />
              </ListItem>
              
              <ListItem 
                button 
                selected={activeTab === 1}
                onClick={() => handleTabChange(1)}
                sx={{ 
                  paddingY: '6px',
                  paddingX: '8px',
                  minHeight: '32px',
                  borderBottom: '1px solid #e9d9ef',
                  bgcolor: activeTab === 1 ? '#dcc4e9' : 'transparent',
                  '&:hover': {
                    bgcolor: '#e7d3f1',
                  },
                  '&.Mui-selected': {
                    bgcolor: '#dcc4e9',
                    '&:hover': {
                      bgcolor: '#dcc4e9',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: '28px' }}>
                  <MouseIcon sx={{ fontSize: '16px', color: '#5c0057' }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Custom Cursor" 
                  primaryTypographyProps={{
                    fontSize: '11px',
                    fontFamily: '"Tahoma", sans-serif',
                    color: '#000',
                  }}
                />
              </ListItem>
            </List>
            
            <Box sx={{ flexGrow: 1 }} />
            
            <Box sx={{ 
              p: 1.5, 
              borderTop: '1px solid #c094ca'
            }}>
              <Box 
                component="img"
                src="/logo.png"
                alt="MeetMe Logo"
                sx={{ 
                  height: '24px',
                  opacity: 0.7,
                  display: 'block',
                  margin: '0 auto'
                }}
              />
              <Typography 
                sx={{ 
                  fontSize: '9px', 
                  textAlign: 'center', 
                  fontFamily: '"Tahoma", sans-serif',
                  color: '#5c0057',
                  mt: 0.5
                }}
              >
                MeetMe Room Customization v1.0
              </Typography>
            </Box>
          </Box>
          
          {/* Right side content */}
          <Box sx={{ 
            flex: 1, 
            p: 2, 
            backgroundColor: '#f5eef8',
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f0e5f5',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'linear-gradient(to right, #c094ca 0%, #9e56b6 100%)',
              borderRadius: '4px',
            },
          }}>
            {/* Chat Background Tab Content */}
            {activeTab === 0 && (
              <Box>
                <Box sx={{ 
                  mb: 2,
                  pb: 1,
                  borderBottom: '1px solid #c094ca'
                }}>
                  <Typography variant="subtitle1" sx={{ fontFamily: '"Tahoma", sans-serif', fontSize: '13px', fontWeight: 'bold', color: '#5c0057' }}>
                    Chat Area Background
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: '"Tahoma", sans-serif', fontSize: '11px', color: '#333' }}>
                    Select a background pattern for your chat area. Lighter patterns work best for readability.
                  </Typography>
                </Box>
                
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {chatBackgroundOptions.map((bg, index) => (
                    <Grid item xs={4} key={index}>
                      <Card 
                        onClick={() => handleChatBackgroundSelect(bg.url)}
                        sx={{ 
                          position: 'relative',
                          border: selectedChatBackground === bg.url ? '2px solid #a1009c' : '1px solid #c094ca',
                          borderRadius: '3px',
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: '#a1009c',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                          }
                        }}
                      >
                        <CardActionArea>
                          <Box 
                            sx={{
                              height: 100,
                              backgroundColor: '#f8f8f8',
                              backgroundImage: `url(${bg.url})`,
                              backgroundRepeat: 'repeat',
                            }}
                          />
                          <Box 
                            sx={{
                              borderTop: '1px solid #c094ca',
                              padding: '4px 8px',
                              textAlign: 'center',
                              backgroundColor: '#e9d9ef'
                            }}
                          >
                            <Typography variant="caption" sx={{ fontSize: '10px', fontFamily: '"Tahoma", sans-serif' }}>
                              {bg.name}
                            </Typography>
                          </Box>
                        </CardActionArea>
                        {selectedChatBackground === bg.url && (
                          <CheckCircleIcon 
                            sx={{ 
                              position: 'absolute', 
                              top: 5, 
                              right: 5, 
                              color: '#a1009c',
                              fontSize: '16px',
                              filter: 'drop-shadow(0px 0px 1px #fff)'
                            }} 
                          />
                        )}
                      </Card>
                    </Grid>
                  ))}
                </Grid>
                
                <Box sx={{ 
                  backgroundColor: '#f0e5f8',
                  border: '1px solid #c094ca',
                  borderRadius: '3px',
                  p: 2,
                  mt: 2
                }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontFamily: '"Tahoma", sans-serif', fontSize: '11px', fontWeight: 'bold' }}>
                    Use custom background URL
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      placeholder="Enter image URL"
                      value={customChatBackgroundUrl}
                      onChange={handleCustomChatBackgroundChange}
                      variant="outlined"
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LinkIcon sx={{ fontSize: '14px', color: '#5c0057' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          fontSize: '11px',
                          fontFamily: '"Tahoma", sans-serif',
                          backgroundColor: '#fff',
                          '& fieldset': {
                            borderColor: '#c094ca',
                          },
                          '&:hover fieldset': {
                            borderColor: '#a1009c',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#5c0057',
                          },
                        }
                      }}
                    />
                    <Button 
                      onClick={() => handlePreviewCustom('chatBackground')}
                      sx={{
                        fontSize: '11px',
                        fontFamily: '"Tahoma", sans-serif',
                        background: 'linear-gradient(to bottom, #ffffff 0%, #f0f0f0 100%)',
                        border: '1px solid #a1009c',
                        borderRadius: '3px',
                        color: '#5c0057',
                        textTransform: 'none',
                        px: 2,
                        height: '32px',
                        '&:hover': {
                          background: 'linear-gradient(to bottom, #ffffff 0%, #e9e9e9 100%)',
                        }
                      }}
                    >
                      Preview
                    </Button>
                  </Box>
                  
                  <Typography variant="caption" sx={{ display: 'block', mt: 1, fontSize: '10px', fontFamily: '"Tahoma", sans-serif', color: '#555' }}>
                    For best results, use a light repeating pattern that doesn't interfere with text readability.
                  </Typography>
                </Box>
              </Box>
            )}
            
            {/* Cursor Tab Content */}
            {activeTab === 1 && (
              <Box>
                <Box sx={{ 
                  mb: 2,
                  pb: 1,
                  borderBottom: '1px solid #c094ca'
                }}>
                  <Typography variant="subtitle1" sx={{ fontFamily: '"Tahoma", sans-serif', fontSize: '13px', fontWeight: 'bold', color: '#5c0057' }}>
                    Custom Cursor
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: '"Tahoma", sans-serif', fontSize: '11px', color: '#333' }}>
                    Set a custom cursor image for your chat room.
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  backgroundColor: '#f0e5f8',
                  border: '1px solid #c094ca',
                  borderRadius: '3px',
                  p: 2,
                  mb: 3
                }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontFamily: '"Tahoma", sans-serif', fontSize: '11px', fontWeight: 'bold' }}>
                    Enter cursor image URL
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      placeholder="Enter cursor image URL"
                      value={customCursorUrl}
                      onChange={handleCustomCursorChange}
                      variant="outlined"
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LinkIcon sx={{ fontSize: '14px', color: '#5c0057' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          fontSize: '11px',
                          fontFamily: '"Tahoma", sans-serif',
                          backgroundColor: '#fff',
                          '& fieldset': {
                            borderColor: '#c094ca',
                          },
                          '&:hover fieldset': {
                            borderColor: '#a1009c',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#5c0057',
                          },
                        }
                      }}
                    />
                    <Button 
                      onClick={() => handlePreviewCustom('cursor')}
                      sx={{
                        fontSize: '11px',
                        fontFamily: '"Tahoma", sans-serif',
                        background: 'linear-gradient(to bottom, #ffffff 0%, #f0f0f0 100%)',
                        border: '1px solid #a1009c',
                        borderRadius: '3px',
                        color: '#5c0057',
                        textTransform: 'none',
                        px: 2,
                        height: '32px',
                        '&:hover': {
                          background: 'linear-gradient(to bottom, #ffffff 0%, #e9e9e9 100%)',
                        }
                      }}
                    >
                      Preview
                    </Button>
                  </Box>
                  
                  <Typography variant="caption" sx={{ display: 'block', mt: 1, fontSize: '10px', fontFamily: '"Tahoma", sans-serif', color: '#555' }}>
                    For best results, use a transparent PNG image (32x32 pixels recommended).
                  </Typography>
                </Box>

                {/* Live cursor preview */}
                {previewCursor && (
                  <Box sx={{ 
                    border: '1px solid #c094ca',
                    borderRadius: '3px',
                    overflow: 'hidden',
                    mb: 2
                  }}>
                    <Box sx={{ 
                      backgroundColor: '#e9d9ef',
                      borderBottom: '1px solid #c094ca',
                      padding: '4px 8px',
                    }}>
                      <Typography sx={{ fontSize: '11px', fontWeight: 'bold', fontFamily: '"Tahoma", sans-serif' }}>
                        Cursor Preview
                      </Typography>
                    </Box>
                    
                    <Box
                      sx={{
                        height: 150,
                        bgcolor: '#fff',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: `url(${previewCursor}) 0 0, auto`,
                        position: 'relative',
                        overflow: 'hidden',
                        padding: 2
                      }}
                    >
                      <Typography variant="body2" sx={{ mb: 1, fontSize: '11px', fontFamily: '"Tahoma", sans-serif', color: '#555' }}>
                        Move your mouse here to preview cursor
                      </Typography>
                      
                      {/* Interactive elements to test cursor */}
                      <Box sx={{ 
                        display: 'flex', 
                        gap: 2, 
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%', 
                        mt: 2 
                      }}>
                        <Button 
                          variant="outlined" 
                          size="small"
                          sx={{ 
                            fontSize: '11px',
                            fontFamily: '"Tahoma", sans-serif',
                            borderColor: '#a1009c',
                            color: '#5c0057',
                            '&:hover': {
                              borderColor: '#5c0057',
                              backgroundColor: 'rgba(163, 62, 189, 0.05)'
                            }
                          }}
                        >
                          Test Button
                        </Button>
                        
                        <Box 
                          sx={{ 
                            width: 100, 
                            height: 6, 
                            bgcolor: '#e0e0e0', 
                            borderRadius: 3,
                            position: 'relative'
                          }}
                        >
                          <Box 
                            sx={{ 
                              position: 'absolute',
                              left: '40%',
                              top: -4,
                              width: 14,
                              height: 14,
                              bgcolor: '#a1009c',
                              borderRadius: '50%',
                              boxShadow: '0px 0px 3px rgba(0,0,0,0.3)'
                            }}
                          />
                        </Box>
                      </Box>
                      
                      <Typography variant="caption" sx={{ position: 'absolute', bottom: 8, fontSize: '10px', fontFamily: '"Tahoma", sans-serif', color: '#999' }}>
                        Custom cursor: {previewCursor.split('/').pop()}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Box>
        
        {/* Footer with buttons */}
        <Box sx={{ 
          borderTop: '1px solid #c094ca', 
          backgroundColor: '#e9d9ef',
          padding: '8px 12px',
          display: 'flex',
          justifyContent: 'flex-end',
        }}>
          <Button 
            onClick={handleCloseDialog}
            sx={{
              fontSize: '11px',
              fontFamily: '"Tahoma", sans-serif',
              background: 'linear-gradient(to bottom, #ffffff 0%, #f0f0f0 100%)',
              border: '1px solid #a1009c',
              borderRadius: '3px',
              color: '#000',
              textTransform: 'none',
              px: 2,
              '&:hover': {
                background: 'linear-gradient(to bottom, #ffffff 0%, #e9e9e9 100%)',
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveCustomization}
            sx={{
              fontSize: '11px',
              fontFamily: '"Tahoma", sans-serif',
              background: 'linear-gradient(to bottom, #c094ca 0%, #a1009c 100%)',
              border: '1px solid #5c0057',
              borderRadius: '3px',
              color: '#fff',
              textTransform: 'none',
              px: 2,
              ml: 1,
              '&:hover': {
                background: 'linear-gradient(to bottom, #ca9ed0 0%, #b300ad 100%)',
              }
            }}
          >
            Apply Settings
          </Button>
        </Box>
      </Dialog>
    </>
  );
}

export default RoomCustomizationPanel; 