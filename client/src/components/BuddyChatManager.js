import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Box } from '@mui/material';
import BuddyChat from './BuddyChat';

const BuddyChatManager = forwardRef(({ socket }, ref) => {
  const [openChats, setOpenChats] = useState(new Map());
  const [minimizedChats, setMinimizedChats] = useState(new Set());
  const [username, setUsername] = useState('');
  const [buddyList, setBuddyList] = useState([]);

  useEffect(() => {
    // Load username from localStorage
    const storedUsername = localStorage.getItem('chatUsername');
    if (storedUsername) {
      setUsername(storedUsername);
    }

    // Load buddy list from localStorage
    const storedBuddies = JSON.parse(localStorage.getItem('chatBuddies') || '[]');
    setBuddyList(storedBuddies);

    // Listen for username changes
    socket.on('username_assigned', (data) => {
      setUsername(data.username);
    });

    // Listen for buddy list updates
    socket.on('buddy_data_loaded', (data) => {
      setBuddyList(data.buddies);
    });

    // Listen for buddy request responses
    socket.on('buddy_request_response', (data) => {
      if (data.accepted) {
        setBuddyList(prev => {
          const newList = [...prev, data.from];
          localStorage.setItem('chatBuddies', JSON.stringify(newList));
          return newList;
        });
      }
    });

    return () => {
      socket.off('username_assigned');
      socket.off('buddy_data_loaded');
      socket.off('buddy_request_response');
    };
  }, [socket]);

  // Calculate initial position for a new chat window
  const getNewWindowPosition = () => {
    const basePosition = { x: window.innerWidth - 370, y: window.innerHeight - 350 };
    const offset = 20;
    const openCount = openChats.size;
    
    return {
      x: basePosition.x - (openCount * offset),
      y: basePosition.y - (openCount * offset)
    };
  };

  const openChat = (buddy) => {
    if (!openChats.has(buddy)) {
      const newPosition = getNewWindowPosition();
      setOpenChats(prev => {
        const next = new Map(prev);
        next.set(buddy, newPosition);
        return next;
      });
    }
    // If chat was minimized, un-minimize it
    if (minimizedChats.has(buddy)) {
      setMinimizedChats(prev => {
        const next = new Set(prev);
        next.delete(buddy);
        return next;
      });
    }
  };

  const closeChat = (buddy) => {
    setOpenChats(prev => {
      const next = new Map(prev);
      next.delete(buddy);
      return next;
    });
    setMinimizedChats(prev => {
      const next = new Set(prev);
      next.delete(buddy);
      return next;
    });
  };

  const minimizeChat = (buddy) => {
    setMinimizedChats(prev => new Set(prev).add(buddy));
  };

  const restoreChat = (buddy) => {
    setMinimizedChats(prev => {
      const next = new Set(prev);
      next.delete(buddy);
      return next;
    });
  };

  // Expose openChat method through ref
  useImperativeHandle(ref, () => ({
    openChat,
    loadChatHistory: (buddy, messages) => {
      // This method will be called by ChatRoom when chat history is loaded
      // You can implement additional logic here if needed
    }
  }));

  const renderChatWindows = () => {
    return Array.from(openChats.entries()).map(([buddy, position]) => {
      if (minimizedChats.has(buddy)) {
        return null;
      }
      return (
        <BuddyChat
          key={buddy}
          buddy={buddy}
          position={position}
          socket={socket}
          username={username}
          onClose={() => closeChat(buddy)}
          onMinimize={() => minimizeChat(buddy)}
        />
      );
    });
  };

  const renderMinimizedChats = () => {
    if (minimizedChats.size === 0) {
      return null;
    }

    return (
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          right: 0,
          display: 'flex',
          gap: 1,
          p: 1,
          backgroundColor: 'rgba(247, 238, 251, 0.9)',
          borderTop: '1px solid #770094',
          borderLeft: '1px solid #770094',
          maxWidth: '50%',
          overflowX: 'auto',
          '&::-webkit-scrollbar': {
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f0e5f5',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'linear-gradient(to right, #b57ad9 0%, #9e56b6 100%)',
            borderRadius: '4px',
          },
          zIndex: 9998,
        }}
      >
        {Array.from(minimizedChats).map(buddy => (
          <Box
            key={buddy}
            onClick={() => restoreChat(buddy)}
            sx={{
              backgroundColor: '#770094',
              color: '#fff',
              fontSize: '12px',
              fontFamily: '"Tahoma", sans-serif',
              padding: '4px 8px',
              borderRadius: '2px',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: '#a33ebd',
              },
            }}
          >
            {buddy}
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 9000 }}>
      <Box sx={{ position: 'relative', width: '100%', height: '100%', pointerEvents: 'none' }}>
        {renderChatWindows()}
        {renderMinimizedChats()}
      </Box>
    </Box>
  );
});

export default BuddyChatManager; 