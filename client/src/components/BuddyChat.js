import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, IconButton, TextField, Paper, Tooltip, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import MinimizeIcon from '@mui/icons-material/Minimize';
import CloseIcon from '@mui/icons-material/Close';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import Draggable from 'react-draggable';
import SendIcon from '@mui/icons-material/Send';

// Message color options
const TEXT_COLORS = [
  { name: 'Black', value: '#000000' },
  { name: 'Blue', value: '#0000FF' },
  { name: 'Red', value: '#FF0000' },
  { name: 'Green', value: '#008000' },
  { name: 'Purple', value: '#800080' },
  { name: 'Orange', value: '#FFA500' },
  { name: 'Brown', value: '#A52A2A' },
  { name: 'Teal', value: '#008080' },
];

const ChatWindow = styled(Paper)(({ theme }) => ({
  width: 350,
  height: 320,
  display: 'flex',
  flexDirection: 'column',
  position: 'fixed',
  backgroundColor: '#f7eefb',
  border: '1px solid #770094',
  borderRadius: '3px',
  overflow: 'hidden',
  pointerEvents: 'auto',
  zIndex: 9999,
}));

const TitleBar = styled(Box)(({ theme }) => ({
  height: '24px',
  background: 'linear-gradient(to bottom, #a33ebd 0%, #770094 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 4px',
  cursor: 'move',
  userSelect: 'none',
}));

const MessagesContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  padding: theme.spacing(1),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
  backgroundColor: '#ffffff',
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: '#f0e5f5',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'linear-gradient(to right, #b57ad9 0%, #9e56b6 100%)',
    borderRadius: '4px',
  },
}));

const MessageContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: theme.spacing(0.5),
  fontFamily: '"Tahoma", sans-serif',
}));

const TimeStamp = styled(Typography)(({ theme }) => ({
  color: '#9a9a9a',
  fontSize: '10px',
  minWidth: '40px',
  marginRight: theme.spacing(1),
  fontFamily: '"Tahoma", sans-serif',
}));

const Username = styled(Typography)(({ theme }) => ({
  color: '#800000',
  fontSize: '12px',
  fontWeight: 'bold',
  marginRight: theme.spacing(0.5),
  fontFamily: '"Tahoma", sans-serif',
}));

const MessageContent = styled(Typography)(({ theme }) => ({
  wordBreak: 'break-word',
  fontSize: '12px',
  fontFamily: '"Tahoma", sans-serif',
  flex: 1,
}));

const InputContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  borderTop: '1px solid #770094',
  backgroundColor: '#ffffff',
}));

const MessageBubble = styled(Typography)(({ theme, isOwn }) => ({
  backgroundColor: isOwn ? '#e0e0e0' : '#ffffff',
  padding: theme.spacing(0.5),
  borderRadius: 4,
  marginBottom: theme.spacing(0.5),
  wordBreak: 'break-word',
}));

const BuddyChat = ({ buddy, onClose, onMinimize, position, socket, username }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [textFormat, setTextFormat] = useState({
    bold: false,
    italic: false,
    underline: false,
  });
  const [textColor, setTextColor] = useState(TEXT_COLORS[0].value);
  const [showEmojis, setShowEmojis] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const nodeRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Load chat history when chat window opens
    socket.emit('load_chat_history', { buddy });
    
    // Listen for direct messages
    socket.on('receive_direct_message', (messageData) => {
      if ((messageData.from === buddy && messageData.to === username) ||
          (messageData.from === username && messageData.to === buddy)) {
        setMessages(prev => [...prev, messageData]);
        scrollToBottom();
      }
    });

    // Listen for typing status
    socket.on('buddy_typing', (data) => {
      if (data.username === buddy) {
        setIsTyping(data.isTyping);
      }
    });

    // Listen for chat history
    socket.on('chat_history_loaded', (data) => {
      if (data.buddy === buddy) {
        setMessages(data.messages);
        setIsLoading(false);
        scrollToBottom();
      }
    });

    return () => {
      socket.off('receive_direct_message');
      socket.off('buddy_typing');
      socket.off('chat_history_loaded');
    };
  }, [socket, buddy, username]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit('send_direct_message', {
        to: buddy,
        content: message,
        textColor: textColor,
        formatting: textFormat
      });
      setMessage('');
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    
    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Emit typing start
    socket.emit('buddy_typing_start', { to: buddy });

    // Set new timeout
    const timeout = setTimeout(() => {
      socket.emit('buddy_typing_stop', { to: buddy });
    }, 1000);
    
    setTypingTimeout(timeout);
  };

  const applyFormatting = (message) => {
    const content = message.content;
    const messageColor = message.textColor || '#000000';

    // First check if there are any formatting characters
    const hasFormatting = content && (
      content.includes('**') || 
      content.includes('*') ||
      content.includes('__')
    );

    if (!hasFormatting) {
      return <span style={{ color: messageColor }}>{content}</span>;
    }

    // Process formatting
    let result = [];
    const patterns = [
      { regex: /\*\*(.*?)\*\*/g, style: (content) => <strong style={{ color: messageColor }}>{content}</strong> },
      { regex: /\*(.*?)\*/g, style: (content) => <em style={{ color: messageColor }}>{content}</em> },
      { regex: /__(.*?)__/g, style: (content) => <span style={{ textDecoration: 'underline', color: messageColor }}>{content}</span> },
    ];

    let remaining = content;
    patterns.forEach(({ regex, style }) => {
      regex.lastIndex = 0;
      let processedText = '';
      let lastIndex = 0;
      let allMatches = [];

      while (true) {
        const match = regex.exec(remaining);
        if (!match) break;
        allMatches.push({
          startIndex: match.index,
          endIndex: match.index + match[0].length,
          fullMatch: match[0],
          content: match[1]
        });
      }

      if (allMatches.length > 0) {
        allMatches.forEach(match => {
          processedText += remaining.substring(lastIndex, match.startIndex);
          processedText += `###FORMATTED_${result.length}###`;
          result.push(style(match.content));
          lastIndex = match.endIndex;
        });
        processedText += remaining.substring(lastIndex);
        remaining = processedText;
      }
    });

    if (result.length === 0) {
      return <span style={{ color: messageColor }}>{content}</span>;
    }

    const segments = remaining.split(/(###FORMATTED_\d+###)/g);
    return (
      <React.Fragment>
        {segments.map((segment, index) => {
          if (segment.startsWith('###FORMATTED_')) {
            const placeholderIndex = parseInt(segment.match(/\d+/)[0], 10);
            return <React.Fragment key={index}>{result[placeholderIndex]}</React.Fragment>;
          }
          return segment ? <span key={index} style={{ color: messageColor }}>{segment}</span> : null;
        })}
      </React.Fragment>
    );
  };

  return (
    <Draggable
      handle=".handle"
      defaultPosition={position}
      bounds="parent"
      nodeRef={nodeRef}
    >
      <ChatWindow ref={nodeRef}>
        <TitleBar className="handle">
          <Typography
            sx={{
              color: '#fff',
              fontSize: '12px',
              fontWeight: 'bold',
              fontFamily: '"Tahoma", sans-serif',
            }}
          >
            {buddy}
          </Typography>
          <Box>
            <IconButton
              size="small"
              onClick={onMinimize}
              sx={{
                padding: '2px',
                color: '#fff',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
              }}
            >
              <MinimizeIcon sx={{ fontSize: 16 }} />
            </IconButton>
            <IconButton
              size="small"
              onClick={onClose}
              sx={{
                padding: '2px',
                color: '#fff',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
              }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        </TitleBar>

        <MessagesContainer>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress size={20} sx={{ color: '#770094' }} />
            </Box>
          ) : (
            messages.map((msg) => (
              <MessageContainer key={msg._id}>
                <TimeStamp>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </TimeStamp>
                <Username>
                  {msg.from}:
                </Username>
                <MessageContent
                  sx={{
                    color: msg.textColor || '#000000',
                    fontWeight: msg.formatting?.bold ? 'bold' : 'normal',
                    fontStyle: msg.formatting?.italic ? 'italic' : 'normal',
                    textDecoration: msg.formatting?.underline ? 'underline' : 'none'
                  }}
                >
                  {msg.content}
                </MessageContent>
              </MessageContainer>
            ))
          )}
          {isTyping && (
            <Typography sx={{ fontSize: '11px', color: '#666', fontStyle: 'italic', mt: 1 }}>
              {buddy} is typing...
            </Typography>
          )}
          <div ref={messagesEndRef} />
        </MessagesContainer>

        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          bgcolor: '#E8ECF4', 
          padding: '4px 10px', 
          borderTop: '1px solid #CCD5E4'
        }}>
          <Tooltip title="Bold">
            <IconButton 
              size="small" 
              onClick={() => {
                const input = inputRef.current;
                if (input) {
                  const start = input.selectionStart;
                  const end = input.selectionEnd;
                  if (start !== end) {
                    const selectedText = message.substring(start, end);
                    const newText = message.substring(0, start) + 
                                   `**${selectedText}**` + 
                                   message.substring(end);
                    setMessage(newText);
                    setTimeout(() => {
                      input.focus();
                      input.setSelectionRange(start + 2, end + 2);
                    }, 0);
                  } else {
                    setTextFormat(prev => ({ ...prev, bold: !prev.bold }));
                  }
                }
              }}
              sx={{ 
                color: textFormat.bold ? '#0E53A7' : '#666',
                '&:hover': { bgcolor: '#D9E1F2' }
              }}
            >
              <FormatBoldIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Italic">
            <IconButton 
              size="small" 
              onClick={() => {
                const input = inputRef.current;
                if (input) {
                  const start = input.selectionStart;
                  const end = input.selectionEnd;
                  if (start !== end) {
                    const selectedText = message.substring(start, end);
                    const newText = message.substring(0, start) + 
                                   `*${selectedText}*` + 
                                   message.substring(end);
                    setMessage(newText);
                    setTimeout(() => {
                      input.focus();
                      input.setSelectionRange(start + 1, end + 1);
                    }, 0);
                  } else {
                    setTextFormat(prev => ({ ...prev, italic: !prev.italic }));
                  }
                }
              }}
              sx={{ 
                color: textFormat.italic ? '#0E53A7' : '#666',
                '&:hover': { bgcolor: '#D9E1F2' }
              }}
            >
              <FormatItalicIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Underline">
            <IconButton 
              size="small" 
              onClick={() => {
                const input = inputRef.current;
                if (input) {
                  const start = input.selectionStart;
                  const end = input.selectionEnd;
                  if (start !== end) {
                    const selectedText = message.substring(start, end);
                    const newText = message.substring(0, start) + 
                                   `__${selectedText}__` + 
                                   message.substring(end);
                    setMessage(newText);
                    setTimeout(() => {
                      input.focus();
                      input.setSelectionRange(start + 2, end + 2);
                    }, 0);
                  } else {
                    setTextFormat(prev => ({ ...prev, underline: !prev.underline }));
                  }
                }
              }}
              sx={{ 
                color: textFormat.underline ? '#0E53A7' : '#666',
                '&:hover': { bgcolor: '#D9E1F2' }
              }}
            >
              <FormatUnderlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Text Color">
            <IconButton 
              size="small"
              onClick={() => {
                // Cycle through text colors
                const currentIndex = TEXT_COLORS.findIndex(color => color.value === textColor);
                const nextIndex = (currentIndex + 1) % TEXT_COLORS.length;
                setTextColor(TEXT_COLORS[nextIndex].value);
              }}
              sx={{ 
                color: '#666',
                '&:hover': { bgcolor: '#D9E1F2' },
                '& .color-indicator': {
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  position: 'absolute',
                  bottom: '2px',
                  right: '2px',
                  backgroundColor: textColor,
                  border: '1px solid #DDD'
                }
              }}
            >
              <ColorLensIcon fontSize="small" />
              <Box className="color-indicator" />
            </IconButton>
          </Tooltip>
        </Box>

        <InputContainer
          component="form"
          onSubmit={handleSendMessage}
        >
          <TextField
            inputRef={inputRef}
            fullWidth
            size="small"
            value={message}
            onChange={handleTyping}
            placeholder="Type a message..."
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: '13px',
                fontFamily: 'Tahoma',
                backgroundColor: '#ffffff',
                fontWeight: textFormat.bold ? 'bold' : 'normal',
                fontStyle: textFormat.italic ? 'italic' : 'normal',
                textDecoration: textFormat.underline ? 'underline' : 'none',
              },
              '& .MuiInputBase-input': {
                color: textColor,
              }
            }}
          />
        </InputContainer>
      </ChatWindow>
    </Draggable>
  );
};

export default BuddyChat; 