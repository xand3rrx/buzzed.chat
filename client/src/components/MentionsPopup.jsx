import React from 'react';
import { Box, Typography } from '@mui/material';

const MentionsPopup = ({ users, searchText, onSelectUser }) => {
  const filteredUsers = users.filter(user => 
    user.toLowerCase().includes(searchText.toLowerCase())
  );

  if (filteredUsers.length === 0) return null;

  return (
    <Box
      sx={{
        backgroundColor: 'rgba(30, 30, 30, 0.95)',
        borderRadius: '4px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
        maxHeight: '200px',
        overflowY: 'auto',
        width: '200px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'rgba(17, 17, 17, 0.4)',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(100, 100, 100, 0.6)',
          borderRadius: '4px',
          '&:hover': {
            background: 'rgba(130, 130, 130, 0.8)',
          },
        },
      }}
    >
      {filteredUsers.map((user) => (
        <Box
          key={user}
          onClick={() => onSelectUser(user)}
          sx={{
            px: 2,
            py: 1.5,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: (theme) => theme.palette.primary.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
              fontWeight: 'bold',
            }}
          >
            {user.charAt(0).toUpperCase()}
          </Box>
          <Typography
            sx={{
              fontSize: '0.9rem',
              color: '#fff',
            }}
          >
            {user}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default MentionsPopup; 