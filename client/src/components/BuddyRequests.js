import React from 'react';
import { Box, Typography, IconButton, List, ListItem, ListItemText, ListItemSecondaryAction } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';

const RequestItem = styled(ListItem)(({ theme }) => ({
  backgroundColor: '#fff',
  marginBottom: theme.spacing(0.5),
  borderRadius: '4px',
  border: '1px solid #e0d0f0',
  '&:hover': {
    backgroundColor: '#f9f5fc',
  },
}));

const BuddyRequests = ({ requests, onAccept, onDeny }) => {
  if (!requests || requests.length === 0) {
    return null;
  }

  return (
    <Box sx={{ 
      mb: 1,
      backgroundColor: '#f0e5f5',
      borderBottom: '1px solid #d0c0dd',
      p: 1 
    }}>
      <Typography
        sx={{
          fontSize: '11px',
          fontWeight: 'bold',
          color: '#770094',
          mb: 1,
          fontFamily: 'Tahoma',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        Pending Buddy Requests ({requests.length})
      </Typography>
      <List dense disablePadding>
        {requests.map((request) => (
          <RequestItem key={`${request.from}-${request.timestamp}`}>
            <ListItemText
              primary={request.from}
              primaryTypographyProps={{
                sx: {
                  fontSize: '12px',
                  fontFamily: 'Tahoma',
                  color: '#800000',
                  fontWeight: 'bold'
                },
              }}
              secondary={`Sent ${new Date(request.timestamp).toLocaleDateString()}`}
              secondaryTypographyProps={{
                sx: {
                  fontSize: '10px',
                  fontFamily: 'Tahoma',
                  color: '#666'
                },
              }}
            />
            <ListItemSecondaryAction>
              <IconButton
                size="small"
                onClick={() => onAccept(request.from)}
                sx={{
                  color: '#008000',
                  padding: '4px',
                  mr: 0.5,
                  border: '1px solid #ccc',
                  backgroundColor: '#fff',
                  '&:hover': { 
                    backgroundColor: '#e8f5e8',
                    border: '1px solid #008000'
                  },
                }}
              >
                <CheckIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => onDeny(request.from)}
                sx={{
                  color: '#cc0000',
                  padding: '4px',
                  border: '1px solid #ccc',
                  backgroundColor: '#fff',
                  '&:hover': { 
                    backgroundColor: '#fee7e7',
                    border: '1px solid #cc0000'
                  },
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </ListItemSecondaryAction>
          </RequestItem>
        ))}
      </List>
    </Box>
  );
};

export default BuddyRequests; 