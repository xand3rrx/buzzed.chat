import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
  Tooltip,
  Badge,
  Menu,
  MenuItem,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tab,
  Tabs,
  Popper,
  Paper,
  ListItemAvatar,
  Avatar,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import ReplyIcon from '@mui/icons-material/Reply';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CloseIcon from '@mui/icons-material/Close';
import MinimizeIcon from '@mui/icons-material/Minimize';
import PersonIcon from '@mui/icons-material/Person';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import { useNavigate, useParams } from 'react-router-dom';
import io from 'socket.io-client';
import UserMenu from './UserMenu';
import RoomCustomizationPanel from './RoomCustomizationPanel';
import MentionsPopup from './MentionsPopup.jsx';
import { styled, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import BuddyChatManager from './BuddyChatManager';
import BuddyRequests from './BuddyRequests';

// Use environment variable with fallback to localhost for development
const SOCKET_SERVER = process.env.REACT_APP_SOCKET_SERVER || 'http://localhost:5000';
const socket = io(SOCKET_SERVER, {
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Generate a 3D starfield box shadow string
const generateStarsShadow = (count) => {
  const width = 3000;
  const height = 960;
  const shadows = [];
  
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * width - width / 2);
    const y = Math.floor(Math.random() * height - height / 2);
    // Generate HSL color with light gray to white range (75-100% lightness)
    const lightness = Math.floor(75 + Math.random() * 25);
    shadows.push(`${x}px ${y}px hsl(90, 0%, ${lightness}%)`);
  }
  
  return shadows.join(', ');
};

// Generate a pseudo-random color based on username
const getUsernameColor = (username) => {
  const colors = [
    '#4FC3F7', // light blue
    '#B39DDB', // light purple
    '#E57373', // light red
    '#81C784', // light green
    '#FFF176', // light yellow
    '#FFB74D', // light orange
    '#FF8A65', // light deep orange
    '#4DD0E1', // light cyan
    '#A1887F', // light brown
    '#F06292', // light pink
  ];
  
  // Simple hash function to determine color
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

// Add this emoji data array somewhere near the top of the file after imports
const EMOJIS = [
  '😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊', 
  '😋', '😎', '😍', '😘', '🥰', '😗', '😙', '😚', '🙂', '🤗',
  '🤔', '🤨', '😐', '😑', '😶', '🙄', '😏', '😣', '😥', '😮',
  '🤐', '😯', '😪', '😫', '😴', '😌', '😛', '😜', '😝', '🤤',
  '😒', '😓', '😔', '😕', '🙃', '🤑', '😲', '☹️', '🙁', '😖',
  '😞', '😟', '😤', '😢', '😭', '😦', '😧', '😨', '😩', '🤯',
  '😬', '😰', '😱', '🥵', '🥶', '😳', '🤪', '😵', '😡', '😠'
];

// Replace with GIF emoticons from the client/emoticons folder
const EMOTICONS = [
  { name: 'angel', src: '/emoticons/angel.gif', shortcut: ':angel:' },
  { name: 'angry', src: '/emoticons/angry.gif', shortcut: ':angry:' },
  { name: 'applause', src: '/emoticons/applause.gif', shortcut: ':applause:' },
  { name: 'at wits end', src: '/emoticons/at wits end.gif', shortcut: ':wits:' },
  { name: 'batting eyelashes', src: '/emoticons/batting eyelashes.gif', shortcut: ':batting:' },
  { name: 'big grin', src: '/emoticons/big grin.gif', shortcut: ':D' },
  { name: 'big hug', src: '/emoticons/big hug.gif', shortcut: ':hug:' },
  { name: 'blushing', src: '/emoticons/blushing.gif', shortcut: ':blush:' },
  { name: 'broken heart', src: '/emoticons/broken heart.gif', shortcut: ':((' },
  { name: 'call me', src: '/emoticons/call me.gif', shortcut: ':call:' },
  { name: 'clown', src: '/emoticons/clown.gif', shortcut: ':clown:' },
  { name: 'confused', src: '/emoticons/confused.gif', shortcut: ':?' },
  { name: 'cool', src: '/emoticons/cool.gif', shortcut: ':cool:' },
  { name: 'cowboy', src: '/emoticons/cowboy.gif', shortcut: ':cowboy:' },
  { name: 'crying', src: '/emoticons/crying.gif', shortcut: ':(' },
  { name: 'day dreaming', src: '/emoticons/day dreaming.gif', shortcut: ':dream:' },
  { name: 'devil', src: '/emoticons/devil.gif', shortcut: ':devil:' },
  { name: 'doh', src: '/emoticons/doh.gif', shortcut: ':doh:' },
  { name: 'dont tell anyone', src: '/emoticons/dont tell anyone.gif', shortcut: ':secret:' },
  { name: 'drooling', src: '/emoticons/drooling.gif', shortcut: ':drool:' },
  { name: 'happy', src: '/emoticons/happy.gif', shortcut: ':)' },
  { name: 'hurry up', src: '/emoticons/hurry up.gif', shortcut: ':hurry:' },
  { name: 'hypnotized', src: '/emoticons/hypnotized.gif', shortcut: ':hypno:' },
  { name: 'I dont want to see', src: '/emoticons/I dont want to see.gif', shortcut: ':see:' },
  { name: 'it wasnt me', src: '/emoticons/it wasnt me.gif', shortcut: ':wasntme:' },
  { name: 'kiss', src: '/emoticons/kiss.gif', shortcut: ':kiss:' },
  { name: 'laughing', src: '/emoticons/laughing.gif', shortcut: ':lol:' },
  { name: 'liar', src: '/emoticons/liar.gif', shortcut: ':liar:' },
  { name: 'loser', src: '/emoticons/loser.gif', shortcut: ':loser:' },
  { name: 'love struck', src: '/emoticons/love struck.gif', shortcut: ':love:' },
  { name: 'nail biting', src: '/emoticons/nail biting.gif', shortcut: ':nailbite:' },
  { name: 'nerd', src: '/emoticons/nerd.gif', shortcut: ':nerd:' },
  { name: 'no talking', src: '/emoticons/no talking.gif', shortcut: ':notalk:' },
  { name: 'on the phone', src: '/emoticons/on the phone.gif', shortcut: ':phone:' },
  { name: 'party', src: '/emoticons/party.gif', shortcut: ':party:' },
  { name: 'phbbbbt', src: '/emoticons/phbbbbt.gif', shortcut: ':phbbbbt:' },
  { name: 'pirate', src: '/emoticons/pirate.gif', shortcut: ':pirate:' },
  { name: 'raised eyebrows', src: '/emoticons/raised eyebrows.gif', shortcut: ':eyebrows:' },
  { name: 'rock on', src: '/emoticons/rock on.gif', shortcut: ':rock:' },
  { name: 'rolling eyes', src: '/emoticons/rolling eyes.gif', shortcut: ':rolleyes:' },
  { name: 'rolling on the floor', src: '/emoticons/rolling on the floor.gif', shortcut: ':rofl:' },
  { name: 'sad', src: '/emoticons/sad.gif', shortcut: ':sad:' },
  { name: 'sick', src: '/emoticons/sick.gif', shortcut: ':sick:' },
  { name: 'sigh', src: '/emoticons/sigh.gif', shortcut: ':sigh:' },
  { name: 'silly', src: '/emoticons/silly.gif', shortcut: ':silly:' },
  { name: 'sleepy', src: '/emoticons/sleepy.gif', shortcut: ':sleepy:' },
  { name: 'smug', src: '/emoticons/smug.gif', shortcut: ':smug:' },
  { name: 'straight face', src: '/emoticons/straight face.gif', shortcut: ':|' },
  { name: 'surprise', src: '/emoticons/surprise.gif', shortcut: ':surprise:' },
  { name: 'talk to the hand', src: '/emoticons/talk to the hand.gif', shortcut: ':hand:' },
  { name: 'thinking', src: '/emoticons/thinking.gif', shortcut: ':think:' },
  { name: 'thumbs down', src: '/emoticons/thumbs down.gif', shortcut: ':thumbsdown:' },
  { name: 'thumbs up', src: '/emoticons/thumbs up.gif', shortcut: ':thumbsup:' },
  { name: 'time out', src: '/emoticons/time out.gif', shortcut: ':timeout:' },
  { name: 'tongue', src: '/emoticons/tongue.gif', shortcut: ':p' },
  { name: 'waiting', src: '/emoticons/waiting.gif', shortcut: ':waiting:' },
  { name: 'wave', src: '/emoticons/wave.gif', shortcut: ':wave:' },
  { name: 'whew', src: '/emoticons/whew.gif', shortcut: ':whew:' },
  { name: 'winking', src: '/emoticons/winking.gif', shortcut: ':wink:' },
  { name: 'worried', src: '/emoticons/worried.gif', shortcut: ':worried:' },
  { name: 'yawn', src: '/emoticons/yawn.gif', shortcut: ':yawn:' }
];

// Create a mapping for shortcut replacement
const EMOTICON_MAP = {};
EMOTICONS.forEach(emoticon => {
  EMOTICON_MAP[emoticon.shortcut] = emoticon;
});

// Add a function to group emoticons by category
const groupEmoticonsByCategory = () => {
  const categories = {
    "Smileys": [":)", ":D", ":(", ":?", ":|", ":p", ":cool:", ":wink:", ":blush:", ":sad:", ":angry:"],
    "Actions": [":applause:", ":hurry:", ":wave:", ":hug:", ":waiting:", ":timeout:", ":think:", ":dream:", ":see:"],
    "Silly Faces": [":clown:", ":silly:", ":drool:", ":devil:", ":angel:", ":batting:", ":wits:", ":surprise:"],
    "Reactions": [":rofl:", ":lol:", ":thumbsup:", ":thumbsdown:", ":love:", ":((",  ":rolleyes:", ":eyebrows:"],
    "Activities": [":party:", ":phone:", ":call:", ":pirate:", ":cowboy:", ":rock:", ":nerd:", ":hand:"],
    "Others": [":secret:", ":liar:", ":loser:", ":sick:", ":yawn:", ":hypno:", ":notalk:", ":whew:", ":wasntme:"]
  };
  
  // Create an organized structure with categories
  const categorizedEmoticons = {};
  
  // Map each shortcut to the corresponding emoticon object
  Object.entries(categories).forEach(([category, shortcuts]) => {
    categorizedEmoticons[category] = shortcuts.map(shortcut => {
      // Find the emoticon that matches this shortcut
      return EMOTICONS.find(emoticon => emoticon.shortcut === shortcut);
    }).filter(Boolean); // Remove any undefined entries
  });
  
  return categorizedEmoticons;
};

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

function ChatRoom({ socket, buddyChatManagerRef }) {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [switchingRoom, setSwitchingRoom] = useState(false);
  const [error, setError] = useState(null);
  const [isRoomOwner, setIsRoomOwner] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [characterCount, setCharacterCount] = useState(0);
  const MAX_MESSAGE_LENGTH = 600;
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const [activeUsers, setActiveUsers] = useState(new Set());
  const [mentionSearch, setMentionSearch] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionPosition, setMentionPosition] = useState({ left: 0 });
  const mentionStartIndex = useRef(-1);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const openNotificationsMenu = Boolean(anchorEl);
  const [roomUsers, setRoomUsers] = useState([]);
  const [currentTab, setCurrentTab] = useState(0);
  const [buddyList, setBuddyList] = useState([]);
  const [buddyRequests, setBuddyRequests] = useState([]);
  const [activeBuddyChats, setActiveBuddyChats] = useState(new Set());
  const [buddyMenuAnchor, setBuddyMenuAnchor] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [textFormat, setTextFormat] = useState({
    bold: false,
    italic: false,
    underline: false,
  });
  const [textColor, setTextColor] = useState(TEXT_COLORS[0].value); // Default black
  const [showEmojis, setShowEmojis] = useState(false);
  const [colorPickerAnchor, setColorPickerAnchor] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const [customizationPanelOpen, setCustomizationPanelOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);

  useEffect(() => {
    // Add retro fonts
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=VT323&family=Press+Start+2P&family=Ubuntu+Mono&display=swap';
    document.head.appendChild(link);
    
    // Set loading state when room changes
    setSwitchingRoom(true);
    setMessages([]); // Clear messages when switching rooms
    
    // Check if username exists in localStorage
    const storedUsername = localStorage.getItem('chatUsername');
    
    // Set stored username first to prevent flickering of random username
    if (storedUsername) {
      setUsername(storedUsername);
    }
    
    // Handle socket reconnection
    socket.io.on("reconnect", () => {
      console.log("Socket reconnected");
      if (storedUsername) {
        // Re-emit the stored username when reconnected
        socket.emit('use_existing_username', storedUsername);
        socket.emit('join_room', roomId);
        socket.emit('get_room_data', roomId);
      }
    });
    
    socket.on('username_assigned', (assignedUsername) => {
      if (!storedUsername) {
        // Only set and store username if not already in localStorage
        setUsername(assignedUsername);
        localStorage.setItem('chatUsername', assignedUsername);
      } else {
        // If we already have a stored username, tell the server to use it instead
        socket.emit('use_existing_username', storedUsername);
      }
    });

    // If we have a stored username, use it and tell the server
    if (storedUsername) {
      socket.emit('use_existing_username', storedUsername);
    }

    socket.on('load_messages', (loadedMessages) => {
      setMessages(loadedMessages);
      setSwitchingRoom(false);
      setTimeout(scrollToBottom, 200);
    });

    socket.on('receive_message', (message) => {
      // Only process messages for the current room
      if (message.roomId === roomId) {
        console.log("Received message with color:", message.textColor);
        setMessages((prevMessages) => [...prevMessages, message]);
        // Add user to active users when they send a message
        if (!message.isSystemMessage) {
          setActiveUsers(prev => new Set([...prev, message.username]));
        }
        
        // Check if current user was mentioned or replied to
        if (message.username !== username) {
          // Check for @mentions in the message
          if (message.content.includes(`@${username}`)) {
            const newNotification = {
              id: Date.now(),
              type: 'mention',
              message: `${message.username} mentioned you`,
              content: message.content,
              timestamp: new Date(),
              messageId: message._id,
            };
            setNotifications(prev => [newNotification, ...prev].slice(0, 50));
            setNotificationCount(prev => prev + 1);
            playNotificationSound();
          }
          
          // Check if message is a reply to the current user
          if (message.replyTo && message.replyTo.username === username) {
            const newNotification = {
              id: Date.now(),
              type: 'reply',
              message: `${message.username} replied to your message`,
              content: message.content,
              timestamp: new Date(),
              messageId: message._id,
            };
            setNotifications(prev => [newNotification, ...prev].slice(0, 50));
            setNotificationCount(prev => prev + 1);
            playNotificationSound();
          }
        }
        
        setTimeout(scrollToBottom, 200);
      }
    });

    socket.on('room_data', (roomData) => {
      setRoom(roomData);
      setIsRoomOwner(roomData.owner === username);
      setLoading(false);
      setTimeout(scrollToBottom, 500);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
      setError(error.message);
      setLoading(false);
    });

    // Handle username change responses
    socket.on('username_changed', (data) => {
      // Add a system message
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          _id: Date.now().toString(),
          username: 'System',
          content: `Username changed to "${data.newUsername}"`,
          createdAt: new Date().toISOString(),
          isSystemMessage: true,
          onlyVisibleTo: data.newUsername
        }
      ]);
      
      // Update username in localStorage and state
      setUsername(data.newUsername);
      localStorage.setItem('chatUsername', data.newUsername);
    });

    // Handle username registration responses
    socket.on('username_registered', (data) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          _id: Date.now().toString(),
          username: 'System',
          content: `Username "${data.username}" has been registered successfully.`,
          createdAt: new Date().toISOString(),
          isSystemMessage: true,
          onlyVisibleTo: data.username
        }
      ]);
    });

    // Handle login responses
    socket.on('login_successful', (data) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          _id: Date.now().toString(),
          username: 'System',
          content: `Logged in successfully as "${data.username}".`,
          createdAt: new Date().toISOString(),
          isSystemMessage: true,
          onlyVisibleTo: data.username
        }
      ]);
      
      // Update username in localStorage and state
      setUsername(data.username);
      localStorage.setItem('chatUsername', data.username);
    });

    // Handle command errors (registration failed, login failed, etc.)
    socket.on('command_error', (data) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          _id: Date.now().toString(),
          username: 'System',
          content: data.message,
          createdAt: new Date().toISOString(),
          isSystemMessage: true,
          onlyVisibleTo: username
        }
      ]);
    });

    // Handle room customization updates
    socket.on('room_customized', (data) => {
      if (data.roomId === roomId) {
        setRoom(prevRoom => ({
          ...prevRoom,
          customization: data.customization
        }));
        
        // Add a system message about the customization
        setMessages(prev => [...prev, {
          _id: Date.now().toString(),
          username: 'System',
          content: 'Room customization has been updated by the owner.',
          createdAt: new Date().toISOString(),
          isSystemMessage: true
        }]);
      }
    });

    // Handle message deletion
    socket.on('message_deleted', (data) => {
      setMessages(prevMessages => 
        prevMessages.map(message => 
          message._id === data.messageId 
            ? { 
                ...message, 
                content: data.deletedBy === 'xand3rr' 
                  ? 'This message was deleted by an admin.' 
                  : 'This message was deleted by the room owner.',
                deletedBy: data.deletedBy,
                deletedAt: new Date().toISOString(),
                isDeleted: true 
              }
            : message
        )
      );
    });

    // Handle room members list
    socket.on('room_members', (membersList) => {
      setRoomUsers(membersList.map(member => ({
        id: member.id || `${Date.now()}-${Math.random()}`,
        username: member.username || member,
        color: getUsernameColor(member.username || member),
        isActive: activeUsers.has(member.username || member)
      })));
    });

    // Add handlers for user activity
    socket.on('user_joined', (data) => {
      setActiveUsers(prev => new Set([...prev, data.username]));
      // Add system message for user joining
      setMessages(prev => [...prev, {
        _id: Date.now().toString(),
        username: 'System',
        content: `${data.username} has joined the room`,
        createdAt: new Date().toISOString(),
        isSystemMessage: true
      }]);
    });

    socket.on('user_left', (data) => {
      setActiveUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.username);
        return newSet;
      });
      // Add system message for user leaving
      setMessages(prev => [...prev, {
        _id: Date.now().toString(),
        username: 'System',
        content: `${data.username} has left the room`,
        createdAt: new Date().toISOString(),
        isSystemMessage: true
      }]);
    });

    socket.on('active_users', (activeUsersList) => {
      setActiveUsers(new Set(activeUsersList));
    });

    // Request active users list when joining room
    socket.emit('get_active_users', roomId);

    // Handle available rooms list
    socket.on('rooms_list', (roomsList) => {
      setAvailableRooms(roomsList);
    });

    socket.on('delete_message_response', (data) => {
      if (data.success) {
        setMessages(prevMessages => 
          prevMessages.map(message => 
            message._id === data.messageId 
              ? { 
                  ...message, 
                  content: 'This message was deleted by the room owner.',
                  deletedAt: new Date().toISOString(),
                  isDeleted: true 
                }
              : message
          )
        );
      }
    });

    // Handle room deletion
    socket.on('room_deleted', (data) => {
      if (data.roomId === roomId) {
        // Add a system message about the room deletion
        setMessages(prev => [...prev, {
          _id: Date.now().toString(),
          username: 'System',
          content: `This room has been deleted by ${data.deletedBy}. You will be redirected to the home page.`,
          createdAt: new Date().toISOString(),
          isSystemMessage: true
        }]);
        
        // Redirect to home page after a short delay
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    });

    socket.on('delete_room_response', (data) => {
      if (data.success) {
        // Add a system message about the room deletion
        setMessages(prev => [...prev, {
          _id: Date.now().toString(),
          username: 'System',
          content: `This room has been deleted by ${data.isAdmin ? 'an admin' : 'the room owner'}. You will be redirected to the home page.`,
          createdAt: new Date().toISOString(),
          isSystemMessage: true
        }]);
        
        // Redirect to home page after a short delay
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    });

    socket.emit('join_room', roomId);
    socket.emit('get_room_data', roomId);
    socket.emit('get_rooms');
    socket.emit('get_room_members', roomId);

    // Make sure to scroll to bottom when dependencies change
    setTimeout(scrollToBottom, 500);

    // Load buddy requests from localStorage
    const storedRequests = JSON.parse(localStorage.getItem('buddyRequests') || '[]');
    console.log('Loading stored buddy requests:', storedRequests);
    setBuddyRequests(storedRequests);

    // Load buddy data from server
    socket.emit('load_buddy_data');

    // Listen for buddy data loaded
    socket.on('buddy_data_loaded', (data) => {
      console.log('Buddy data loaded:', data);
      setBuddyList(data.buddies);
      setBuddyRequests(data.requests);
      // Store in localStorage for persistence
      localStorage.setItem('chatBuddies', JSON.stringify(data.buddies));
      localStorage.setItem('buddyRequests', JSON.stringify(data.requests));
    });

    // Listen for buddy requests
    socket.on('buddy_request', (data) => {
      console.log('Received buddy request:', data);
      setBuddyRequests(prev => {
        const newRequests = [...prev, { from: data.from, timestamp: data.timestamp }];
        localStorage.setItem('buddyRequests', JSON.stringify(newRequests));
        return newRequests;
      });
      // Add notification
      setNotifications(prev => [{
        id: Date.now(),
        message: `${data.from} wants to add you as a buddy`,
        content: 'Click to view buddy requests',
        timestamp: Date.now(),
        type: 'buddy_request'
      }, ...prev]);
      setNotificationCount(prev => prev + 1);
    });

    // Listen for buddy request responses
    socket.on('buddy_request_response', (data) => {
      if (data.accepted) {
        setBuddyList(prev => {
          const newBuddyList = [...prev, data.from];
          localStorage.setItem('chatBuddies', JSON.stringify(newBuddyList));
          return newBuddyList;
        });
        
        // Add system message
        setMessages(prev => [...prev, {
          _id: Date.now().toString(),
          username: 'System',
          content: `${data.from} accepted your buddy request`,
          createdAt: new Date().toISOString(),
          isSystemMessage: true,
          onlyVisibleTo: username
        }]);
      } else {
        // Add system message for rejection
        setMessages(prev => [...prev, {
          _id: Date.now().toString(),
          username: 'System',
          content: `${data.from} declined your buddy request`,
          createdAt: new Date().toISOString(),
          isSystemMessage: true,
          onlyVisibleTo: username
        }]);
      }
    });

    // Listen for chat window open requests
    socket.on('open_chat_window', (data) => {
      if (buddyChatManagerRef.current) {
        buddyChatManagerRef.current.openChat(data.from);
      }
    });

    // Listen for chat history loaded
    socket.on('chat_history_loaded', (data) => {
      if (buddyChatManagerRef.current) {
        buddyChatManagerRef.current.loadChatHistory(data.buddy, data.messages);
      }
    });

    return () => {
      socket.off('username_assigned');
      socket.off('load_messages');
      socket.off('receive_message');
      socket.off('room_data');
      socket.off('error');
      socket.off('username_changed');
      socket.off('username_registered');
      socket.off('login_successful');
      socket.off('command_error');
      socket.off('room_customized');
      socket.off('message_deleted');
      socket.off('delete_message_response');
      socket.off('room_members');
      socket.off('rooms_list');
      socket.off('room_deleted');
      socket.off('delete_room_response');
      socket.off('user_joined');
      socket.off('user_left');
      socket.off('active_users');
      socket.off('buddy_request');
      socket.off('buddy_request_response');
      socket.off('buddy_typing');
      socket.off('receive_direct_message');
      socket.off('buddy_data_loaded');
      socket.off('open_chat_window');
      socket.off('chat_history_loaded');
      document.head.removeChild(link);
    };
  }, [roomId, username, socket, buddyChatManagerRef]);

  // Updated scroll function with forced layout
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  };

  // Add an effect to scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      // Send message with reply information if it exists
      socket.emit('send_message', {
        roomId: roomId,
        content: newMessage.trim(),
        textColor: textColor,
        // We don't need to send formatting metadata since the markdown
        // syntax is included directly in the content
        replyTo: replyTo ? {
          _id: replyTo._id,
          username: replyTo.username,
          content: replyTo.content
        } : null,
      });
      setNewMessage('');
      setReplyTo(null);
    }
  };

  const handleReply = (message) => {
    setReplyTo(message);
    inputRef.current?.focus();
  };

  const cancelReply = () => {
    setReplyTo(null);
  };

  // Handle keyboard events
  const handleKeyDown = (e) => {
    // Send message when Enter is pressed (without shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
      return;
    }
    
    if (e.key === '@') {
      mentionStartIndex.current = e.target.selectionStart;
      setShowMentions(true);
      setMentionSearch('');
    } else if (e.key === 'Escape') {
      setShowMentions(false);
      mentionStartIndex.current = -1;
    } else if (e.key === ' ' && mentionStartIndex.current !== -1) {
      setShowMentions(false);
      mentionStartIndex.current = -1;
    }
  };

  // Handle @ mentions
  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value.length <= MAX_MESSAGE_LENGTH) {
      setNewMessage(value);
      setCharacterCount(value.length);
    }

    // Handle mention search
    if (mentionStartIndex.current !== -1) {
      const mentionText = value.slice(mentionStartIndex.current + 1);
      setMentionSearch(mentionText);
      setShowMentions(true);
      
      // Calculate mention popup position based on @ symbol position
      const inputEl = e.target;
      const atSymbolIndex = mentionStartIndex.current;
      
      // Create a temporary span to measure text width
      const span = document.createElement('span');
      span.style.font = window.getComputedStyle(inputEl).font;
      span.style.visibility = 'hidden';
      span.style.position = 'absolute';
      span.textContent = value.substring(0, atSymbolIndex);
      document.body.appendChild(span);
      
      const left = span.offsetWidth;
      document.body.removeChild(span);
      
      setMentionPosition({ left });
    }
  };

  const handleSelectUser = (selectedUser) => {
    if (mentionStartIndex.current !== -1) {
      const beforeMention = newMessage.slice(0, mentionStartIndex.current);
      const afterMention = newMessage.slice(mentionStartIndex.current + mentionSearch.length + 1);
      setNewMessage(`${beforeMention}@${selectedUser} ${afterMention}`);
      mentionStartIndex.current = -1;
      setShowMentions(false);
      setMentionSearch('');
      inputRef.current?.focus();
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  // Apply room customizations to the background and cursor
  const backgroundStyle = room?.customization?.backgroundUrl ? {
    backgroundImage: `url(${room.customization.backgroundUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  } : {};
  
  const cursorStyle = room?.customization?.cursorUrl ? {
    cursor: `url(${room.customization.cursorUrl}) 0 0, auto`,
  } : {};
  
  const renderMessageContent = (content, formatting) => {
    // Check if message has formatting metadata
    const parts = content.split(/(@[\w]+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        const username = part.slice(1);
        return (
          <Typography
            key={index}
            component="span"
            sx={{
              color: getUsernameColor(username),
              fontWeight: 500,
            }}
          >
            {part}
          </Typography>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Add a function to parse emoticons in messages
  const parseEmoticons = (content) => {
    if (!content) return content;
    
    // Create a regex pattern for all emoticon shortcuts
    // We need to escape special characters in the shortcuts
    const shortcuts = Object.keys(EMOTICON_MAP).map(shortcut => 
      shortcut.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    ).join('|');
    
    // If no shortcuts, return content as is
    if (!shortcuts) return content;
    
    // Split by all possible shortcuts
    const regex = new RegExp(`(${shortcuts})`, 'g');
    const parts = content.split(regex);
    
    return parts.map((part, index) => {
      // Check if this part is a known emoticon shortcut
      if (EMOTICON_MAP[part]) {
        const emoticon = EMOTICON_MAP[part];
        return (
          <Box
            key={`emoticon-${index}`}
            component="img"
            src={emoticon.src}
            alt={emoticon.name}
            title={emoticon.name}
            sx={{
              display: 'inline-block',
              verticalAlign: 'middle',
              maxHeight: '24px',
              margin: '0 2px',
            }}
          />
        );
      }
      return part;
    });
  };

  // Add a function to determine if a message has formatting
  const applyFormatting = (message) => {
    const content = message.content;
    // Ensure we have a valid color, with a fallback
    const messageColor = (message.textColor && message.textColor !== 'undefined') 
      ? message.textColor 
      : '#000000';

    console.log("Applying formatting to message:", message._id, "with color:", messageColor, "raw textColor:", message.textColor);
    
    // First check if there are any formatting characters
    const hasFormatting = content && (
      content.includes('**') || 
      content.includes('*') ||
      content.includes('__')
    );
    
    // Check for emoticons in this part
    const hasEmoticons = content && Object.keys(EMOTICON_MAP).some(shortcut => 
      content.includes(shortcut)
    );
    
    // If no formatting, no mentions, and no emoticons, just return the content directly
    if (!hasFormatting && !content.includes('@') && !hasEmoticons) {
      return <span style={{ color: messageColor }}>{content}</span>;
    }
    
    // Process content with both mentions and formatting
    // First split by mentions
    const parts = content.split(/(@[\w]+)/g);
    
    return parts.map((part, index) => {
      // Handle mentions
      if (part.startsWith('@')) {
        const username = part.slice(1);
        return (
          <Typography
            key={index}
            component="span"
            sx={{
              color: getUsernameColor(username),
              fontWeight: 500,
            }}
          >
            {part}
          </Typography>
        );
      }
      
      // Check for emoticons in this part
      const hasEmoticonInPart = Object.keys(EMOTICON_MAP).some(shortcut => 
        part.includes(shortcut)
      );
      
      // If this part has emoticons, parse them
      if (hasEmoticonInPart) {
        return (
          <Box 
            key={index} 
            component="span" 
            sx={{ color: messageColor }}
          >
            {parseEmoticons(part)}
          </Box>
        );
      }
      
      // Process formatting in non-mention parts
      if (hasFormatting) {
        // Prepare result array
        let result = [];
        
        // Use a regex pattern that will match all markdown formatting patterns
        // Order matters here - need to process patterns with higher precedence first
        const patterns = [
          { regex: /\*\*(.*?)\*\*/g, style: (content) => <strong style={{ color: messageColor }}>{content}</strong> },
          { regex: /\*(.*?)\*/g, style: (content) => <em style={{ color: messageColor }}>{content}</em> },
          { regex: /__(.*?)__/g, style: (content) => <span style={{ textDecoration: 'underline', color: messageColor }}>{content}</span> },
        ];
        
        // Start with the original text
        let remaining = part;
        let lastEndIndex = 0;
        
        // For each pattern, find all matches and replace them
        patterns.forEach(({ regex, style }) => {
          // Reset regex state
          regex.lastIndex = 0;
          
          // Create new text by replacing the pattern matches
          let processedText = '';
          let lastIndex = 0;
          let match;
          let allMatches = [];
          
          // Find all matches
          while ((match = regex.exec(remaining)) !== null) {
            allMatches.push({
              startIndex: match.index,
              endIndex: match.index + match[0].length,
              fullMatch: match[0],
              content: match[1]
            });
          }
          
          // Process the text with these matches
          if (allMatches.length > 0) {
            allMatches.forEach(match => {
              // Add text before this match
              processedText += remaining.substring(lastIndex, match.startIndex);
              
              // Add styled match content
              processedText += `###FORMATTED_${result.length}###`;
              result.push(style(match.content));
              
              // Update last index
              lastIndex = match.endIndex;
            });
            
            // Add any remaining text
            processedText += remaining.substring(lastIndex);
            remaining = processedText;
          }
        });
        
        // If there were no matches, just use the original text
        if (result.length === 0) {
          return <span key={index} style={{ color: messageColor }}>{part}</span>;
        }
        
        // Split the remaining text by the placeholder markers
        const segments = remaining.split(/(###FORMATTED_\d+###)/g);
        
        // Convert segments to React elements, replacing placeholders with formatted content
        return (
          <React.Fragment key={index}>
            {segments.map((segment, segmentIndex) => {
              if (segment.startsWith('###FORMATTED_')) {
                const placeholderIndex = parseInt(segment.match(/\d+/)[0], 10);
                return <React.Fragment key={segmentIndex}>{result[placeholderIndex]}</React.Fragment>;
              }
              return segment ? <span key={segmentIndex} style={{ color: messageColor }}>{segment}</span> : null;
            })}
          </React.Fragment>
        );
      }
      
      // Return plain text if no formatting
      return <span key={index} style={{ color: messageColor }}>{part}</span>;
    });
  };

  // Add classic chat sound effect
  const playNotificationSound = () => {
    try {
      // Using a compatible notification sound
      const audio = new Audio('https://www.myinstants.com/media/sounds/facebook-messenger-tone-2020.mp3');
      audio.play();
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  };

  // Function to handle notification menu open
  const handleNotificationsClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Function to handle notification menu close
  const handleNotificationsClose = () => {
    setAnchorEl(null);
  };

  // Function to handle notification item click
  const handleNotificationClick = (notification) => {
    // Find the message element and scroll to it
    const messageElement = document.getElementById(`message-${notification.messageId}`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      messageElement.style.backgroundColor = 'rgba(100, 181, 246, 0.2)';
      setTimeout(() => {
        messageElement.style.backgroundColor = '';
      }, 2000);
    }
    handleNotificationsClose();
    setNotificationCount(0); // Clear the badge counter
  };

  // Function to clear all notifications
  const handleClearNotifications = () => {
    setNotifications([]);
    setNotificationCount(0);
    handleNotificationsClose();
  };

  // Helper to format notification time
  const formatNotificationTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString();
  };

  // Mention handling functions
  const [mentionsSearchResult, setMentionsSearchResult] = useState([]);

  const handleMentionSearch = (text) => {
    const mentionMatch = text.match(/@(\w*)$/);
    if (mentionMatch) {
      const query = mentionMatch[1].toLowerCase();
      setMentionSearch({ query, index: mentionMatch.index });
      const results = roomUsers.filter(user => 
        user.username.toLowerCase().includes(query)
      );
      setMentionsSearchResult(results);
    } else {
      setMentionSearch(null);
      setMentionsSearchResult([]);
    }
  };

  const handleMentionSelect = (user) => {
    if (mentionSearch) {
      const beforeMention = newMessage.substring(0, mentionSearch.index);
      const afterMention = newMessage.substring(mentionSearch.index + `@${mentionSearch.query}`.length);
      setNewMessage(`${beforeMention}@${user} ${afterMention}`);
      setMentionSearch(null);
      setMentionsSearchResult([]);
      inputRef.current?.focus();
    }
  };

  useEffect(() => {
    handleMentionSearch(newMessage);
  }, [newMessage, roomUsers]);
  
  // Add buddy system handlers
  const handleAddBuddy = (buddyUsername) => {
    if (buddyUsername !== username && !buddyList.includes(buddyUsername)) {
      socket.emit('send_buddy_request', { to: buddyUsername });
      
      // Add system message
      setMessages(prev => [...prev, {
        _id: Date.now().toString(),
        username: 'System',
        content: `Buddy request sent to ${buddyUsername}`,
        createdAt: new Date().toISOString(),
        isSystemMessage: true,
        onlyVisibleTo: username
      }]);
    }
  };

  const handleRemoveBuddy = (buddyUsername) => {
    const newBuddyList = buddyList.filter(buddy => buddy !== buddyUsername);
    setBuddyList(newBuddyList);
    localStorage.setItem('chatBuddies', JSON.stringify(newBuddyList));
    
    // Add system message
    setMessages(prev => [...prev, {
      _id: Date.now().toString(),
      username: 'System',
      content: `Removed ${buddyUsername} from your buddy list`,
      createdAt: new Date().toISOString(),
      isSystemMessage: true,
      onlyVisibleTo: username
    }]);
  };

  const handleUserClick = (event, clickedUsername) => {
    if (clickedUsername === username) return;
    setSelectedUser(clickedUsername);
    setBuddyMenuAnchor(event.currentTarget);
  };

  const handleCloseBuddyMenu = () => {
    setBuddyMenuAnchor(null);
    setSelectedUser(null);
  };

  // Handle buddy request actions
  const handleAcceptBuddy = (requesterUsername) => {
    socket.emit('buddy_request_response', { to: requesterUsername, accepted: true });
    const newBuddyList = [...buddyList, requesterUsername];
    setBuddyList(newBuddyList);
    localStorage.setItem('chatBuddies', JSON.stringify(newBuddyList));
    
    // Remove the request
    setBuddyRequests(prev => {
      const newRequests = prev.filter(req => req.from !== requesterUsername);
      localStorage.setItem('buddyRequests', JSON.stringify(newRequests));
      return newRequests;
    });

    // Add system message
    setMessages(prev => [...prev, {
      _id: Date.now().toString(),
      username: 'System',
      content: `You accepted ${requesterUsername}'s buddy request`,
      createdAt: new Date().toISOString(),
      isSystemMessage: true,
      onlyVisibleTo: username
    }]);
  };

  const handleDenyBuddy = (requesterUsername) => {
    socket.emit('buddy_request_response', { to: requesterUsername, accepted: false });
    
    // Remove the request
    setBuddyRequests(prev => {
      const newRequests = prev.filter(req => req.from !== requesterUsername);
      localStorage.setItem('buddyRequests', JSON.stringify(newRequests));
      return newRequests;
    });

    // Add system message
    setMessages(prev => [...prev, {
      _id: Date.now().toString(),
      username: 'System',
      content: `You declined ${requesterUsername}'s buddy request`,
      createdAt: new Date().toISOString(),
      isSystemMessage: true,
      onlyVisibleTo: username
    }]);
  };

  const renderMessage = (message) => {
    // Skip messages that are only visible to specific users if not the intended recipient
    if (message.onlyVisibleTo && message.onlyVisibleTo !== username) {
      return null;
    }

    // Determine if it's the current user's message
    const isCurrentUser = message.username === username;

    return (
      <Box 
        id={`message-${message._id}`}
        key={message._id} 
        sx={{
          display: 'flex',
          flexDirection: 'column',
          mb: 1,
          px: 0.5,
          py: 0.5,
          width: '100%',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.03)',
            '& .message-actions': {
              visibility: 'visible',
            }
          },
          ...(message.isSystemMessage && {
            color: '#808080',
            fontStyle: 'italic',
            fontFamily: '"Tahoma", sans-serif',
            px: 2,
            textAlign: 'center',
            fontSize: '11px',
          }),
        }}
      >
        {/* If message is a reply, show the replied message */}
        {message.replyTo && (
          <Box
            sx={{
              ml: 4,
              mb: 0.5,
              backgroundColor: '#f5f5f5',
              borderRadius: '0',
              position: 'relative',
              borderLeft: '2px solid #a5bedc',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              py: 0.25,
              pl: 1,
              pr: 2,
              fontSize: '11px',
              fontFamily: '"Tahoma", sans-serif',
            }}
          >
            <ReplyIcon sx={{ fontSize: '11px', color: '#6699cc', mr: 0.5 }} />
            <Typography 
              component="span" 
              sx={{ 
                fontSize: '11px',
                color: '#800000',
                fontWeight: 'bold',
                mr: 0.75,
                fontFamily: '"Tahoma", sans-serif',
                cursor: 'pointer',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
              onClick={(e) => handleUserClick(e, message.replyTo.username)}
            >
              {message.replyTo.username}
            </Typography>
            <Typography
              sx={{
                fontSize: '11px',
                color: '#444444',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
                fontFamily: '"Tahoma", sans-serif',
              }}
            >
              {message.replyTo.content}
            </Typography>
          </Box>
        )}

        {/* Message with Buzzed! Messenger style */}
        {!message.isSystemMessage ? (
          <Box sx={{ 
            display: 'flex',
            alignItems: 'flex-start',
          }}>
            <Typography 
              component="span" 
              sx={{ 
                color: '#9a9a9a',
                fontSize: '10px',
                minWidth: '40px',
                mr: 1,
                fontFamily: '"Tahoma", sans-serif',
              }}
            >
              {message.createdAt ? formatTime(message.createdAt) : '--:--'}
            </Typography>
            
            <Typography 
              component="span" 
              onClick={(e) => handleUserClick(e, message.username)}
              sx={{ 
                color: '#800000',
                fontSize: '12px',
                fontWeight: 'bold',
                mr: 0.5,
                fontFamily: '"Tahoma", sans-serif',
                cursor: 'pointer',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              {message.username}:
            </Typography>
            
            <Typography 
              component="span" 
              sx={{ 
                color: message.textColor || '#000000',
                wordBreak: 'break-word',
                fontSize: '12px',
                fontFamily: '"Tahoma", sans-serif',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                flex: 1,
                ...(message.onlyVisibleTo && {
                  fontStyle: 'italic',
                  color: '#666666',
                }),
                ...(message.isDeleted && {
                  fontStyle: 'italic',
                  color: '#999999',
                }),
              }}
            >
              {message.isDeleted ? (
                <span>{message.content}</span>
              ) : (
                <span>{applyFormatting(message)}</span>
              )}
              <Box 
                className="message-actions"
                sx={{ 
                  visibility: 'hidden',
                  display: 'flex',
                  gap: 0.5,
                  ml: 1,
                }}
              >
                {!message.isDeleted && (
                  <Tooltip title="Reply">
                    <IconButton
                      onClick={() => handleReply(message)}
                      size="small"
                      sx={{
                        padding: '2px',
                        color: '#000080',
                        bgcolor: '#f0f0f0',
                        border: '1px solid #d0d0d0',
                        '&:hover': {
                          bgcolor: '#ffffff',
                          border: '1px solid #a0a0a0',
                        },
                        '.MuiSvgIcon-root': {
                          fontSize: '12px',
                        },
                      }}
                    >
                      <ReplyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                {(isRoomOwner || username === 'xand3rr') && !message.isDeleted && message.username !== 'System' && (
                  <Tooltip title={username === 'xand3rr' ? "Admin Delete" : "Delete Message"}>
                    <IconButton
                      onClick={() => {
                        socket.emit('delete_message', { roomId, messageId: message._id });
                      }}
                      size="small"
                      sx={{
                        padding: '2px',
                        color: username === 'xand3rr' ? '#0000CC' : '#800000',
                        bgcolor: '#f0f0f0',
                        border: '1px solid #d0d0d0',
                        '&:hover': {
                          bgcolor: '#ffffff',
                          border: '1px solid #a0a0a0',
                        },
                        '.MuiSvgIcon-root': {
                          fontSize: '12px',
                        },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Typography>
          </Box>
        ) : (
          <Typography 
            sx={{ 
              color: '#666666',
              fontSize: '11px',
              fontStyle: 'italic',
              fontFamily: '"Tahoma", sans-serif',
              textAlign: 'center',
            }}
          >
            {message.content}
          </Typography>
        )}
      </Box>
    );
  };

  if (loading || switchingRoom) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#000',
          position: 'relative',
          backgroundImage: 'url(/bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          fontFamily: '"Tahoma", sans-serif',
        }}
      >
        {/* Main chat container with sidebars */}
        <Box
          sx={{
            display: 'flex',
            width: '1300px',
            height: '700px',
            borderRadius: '0',
            overflow: 'hidden',
            boxShadow: '5px 5px 15px rgba(0, 0, 0, 0.35)',
            border: '1px solid #770094',
          }}
        >
          {/* Left Sidebar - Rooms List */}
          <Box
            sx={{
              width: '200px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRight: '1px solid #770094',
              zIndex: 2,
              backgroundColor: '#f7eefb',
            }}
          >
            <Box 
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'linear-gradient(to bottom, #a33ebd 0%, #770094 100%)',
                color: '#fff',
                height: '24px',
                px: 1,
                userSelect: 'none',
              }}
            >
              <Typography 
                sx={{ 
                  fontSize: '12px', 
                  fontWeight: 'bold',
                  fontFamily: '"Tahoma", sans-serif',
                }}
              >
                Chat Rooms
              </Typography>
            </Box>
            
            <Box sx={{ 
              flex: 1, 
              overflowY: 'auto',
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
            }}>
              <List dense disablePadding>
                {availableRooms.map((chatRoom) => (
                  <ListItem 
                    key={chatRoom._id}
                    button 
                    selected={chatRoom._id === roomId}
                    onClick={() => navigate(`/room/${chatRoom._id}`)}
                    sx={{ 
                      borderBottom: '1px solid #e0e0e0',
                      bgcolor: chatRoom._id === roomId ? '#edd6f8' : 'transparent',
                      '&:hover': {
                        bgcolor: '#f2e3fa',
                      },
                      '&.Mui-selected': {
                        bgcolor: '#e5c7f5',
                        '&:hover': {
                          bgcolor: '#e5c7f5',
                        },
                      },
                    }}
                  >
                    <ListItemAvatar sx={{ minWidth: '36px' }}>
                      <Avatar 
                        sx={{ 
                          width: 28, 
                          height: 28, 
                          bgcolor: '#770094',
                          fontSize: '12px',
                        }}
                      >
                        {chatRoom.name.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={chatRoom.name} 
                      primaryTypographyProps={{ 
                        fontSize: '13px',
                        fontFamily: 'Tahoma',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      secondary={chatRoom.owner === username ? "You own this room" : null}
                      secondaryTypographyProps={{
                        fontSize: '10px',
                        color: '#006600',
                        fontFamily: 'Tahoma',
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Box>

          {/* Main Chat Window with Loading State */}
          <Box
            sx={{
              width: 'calc(100% - 400px)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              zIndex: 1,
              backgroundColor: '#f7eefb',
            }}
          >
            {/* Title bar */}
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
                    height: '16px',
                    width: 'auto',
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
                  {switchingRoom ? 'Switching Rooms...' : 'Connecting to Room...'}
                </Typography>
              </Box>
            </Box>

            {/* Loading content */}
            <Box 
              sx={{ 
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#ffffff',
                p: 3,
              }}
            >
              <Box 
                component="img"
                src="/welcome/sleep.png"
                alt="Loading Character"
                sx={{ 
                  width: 80, 
                  height: 80,
                  mb: 2,
                  objectFit: 'contain',
                }}
              />
              
              <CircularProgress 
                size={24} 
                thickness={5}
                sx={{ 
                  color: '#770094',
                  mb: 2,
                }} 
              />
              
              <Typography 
                sx={{ 
                  fontSize: '11px', 
                  color: '#666',
                  fontFamily: '"Tahoma", sans-serif',
                  fontStyle: 'italic'
                }}
              >
                Please wait while we {switchingRoom ? 'switch' : 'connect'} you to the chat room
              </Typography>
            </Box>
          </Box>

          {/* Right Sidebar - Room Members */}
          <Box
            sx={{
              width: '200px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderLeft: '1px solid #770094',
              zIndex: 2,
              backgroundColor: '#f7eefb',
            }}
          >
            <Box 
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'linear-gradient(to bottom, #a33ebd 0%, #770094 100%)',
                color: '#fff',
                height: '24px',
                px: 1,
                userSelect: 'none',
              }}
            >
              <Typography 
                sx={{ 
                  fontSize: '12px', 
                  fontWeight: 'bold',
                  fontFamily: '"Tahoma", sans-serif',
                }}
              >
                Room Members
              </Typography>
            </Box>
            
            <Box sx={{ 
              flex: 1, 
              overflowY: 'auto',
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
            }}>
              <List dense disablePadding>
                {roomUsers.map((user) => (
                  <ListItem 
                    key={user.id || user.username}
                    sx={{ 
                      borderBottom: '1px solid #e0e0e0',
                      py: 0.75,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                      }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: user.isActive ? '#4caf50' : '#f44336',
                          mr: 1.5,
                          ml: 1,
                          border: '1px solid',
                          borderColor: user.isActive ? '#006600' : '#aa0000',
                        }}
                      />
                      <Typography
                        sx={{
                          fontSize: '13px',
                          fontFamily: 'Tahoma',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          color: '#000000',
                        }}
                      >
                        {user.username}
                        {user.username === username && (
                          <Typography
                            component="span"
                            sx={{
                              fontSize: '10px',
                              color: '#006600',
                              fontFamily: 'Tahoma',
                              ml: 0.5,
                            }}
                          >
                            (You)
                          </Typography>
                        )}
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#000',
          backgroundImage: 'url(/bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          fontFamily: '"Tahoma", sans-serif',
        }}
      >
        <Box
          sx={{
            width: 400,
            borderRadius: 0,
            overflow: 'hidden',
            border: '1px solid #999',
            boxShadow: '5px 5px 15px rgba(0, 0, 0, 0.15)',
            backgroundColor: 'white',
          }}
        >
          {/* Title bar */}
          <Box
            sx={{
              height: 22,
              bgcolor: '#a828c5',
              display: 'flex',
              alignItems: 'center',
              px: 1,
              backgroundImage: 'linear-gradient(to right, #9911ba, #7322ab)',
              color: 'white',
            }}
          >
            <Typography 
              variant="caption" 
              sx={{ 
                flexGrow: 1,
                fontSize: '11px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Box
                component="img"
                src="https://i.ibb.co/hxwVLpW9/meetme.png"
                alt="Buzzed Icon"
                sx={{ 
                  width: 15, 
                  height: 15,
                  mr: 0.5,
                  mt: '-2px',
                  objectFit: 'contain'
                }}
              />
              BUZZED! MESSENGER - ERROR
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Box
                sx={{
                  width: 14,
                  height: 14,
                  fontSize: '9px',
                  lineHeight: '13px',
                  textAlign: 'center',
                  bgcolor: '#dadada',
                  border: '1px solid white',
                  borderRadius: '0',
                  color: 'black',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: '#efefef',
                  },
                }}
              >
                X
              </Box>
            </Box>
          </Box>

          {/* Error content */}
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Box 
              component="img"
              src="/welcome/wake.png"
              alt="Error Character"
              sx={{ 
                width: 80, 
                height: 80,
                mb: 2,
                objectFit: 'contain',
              }}
            />
            
            <Typography 
              sx={{ 
                color: '#770094', 
                fontSize: '16px', 
                fontWeight: 'bold',
                mb: 1,
                fontFamily: '"Tahoma", sans-serif'
              }}
            >
              Error
            </Typography>
            
            <Typography 
              sx={{ 
                fontSize: '12px', 
                color: '#555',
                mb: 3,
                fontFamily: '"Tahoma", sans-serif'
              }}
            >
              {error}
            </Typography>
            
            <Box
              onClick={() => navigate('/')}
              sx={{
                textTransform: 'none',
                bgcolor: '#D9BFFF',
                color: '#000',
                fontSize: '12px',
                borderRadius: 0,
                py: 0.5,
                border: '1px solid #9483A9',
                fontWeight: 'normal',
                boxShadow: 'none',
                cursor: 'pointer',
                width: '60%',
                mx: 'auto',
                '&:hover': {
                  bgcolor: '#E5D3FF',
                },
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontFamily: '"Tahoma", sans-serif'
              }}
            >
              Return to Room List
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  if (!room) {
    return (
      <Box
        sx={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#000',
          backgroundImage: 'url(/bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          fontFamily: '"Tahoma", sans-serif',
        }}
      >
        <Box
          sx={{
            width: 400,
            borderRadius: 0,
            overflow: 'hidden',
            border: '1px solid #999',
            boxShadow: '5px 5px 15px rgba(0, 0, 0, 0.15)',
            backgroundColor: 'white',
          }}
        >
          {/* Title bar */}
          <Box
            sx={{
              height: 22,
              bgcolor: '#a828c5',
              display: 'flex',
              alignItems: 'center',
              px: 1,
              backgroundImage: 'linear-gradient(to right, #9911ba, #7322ab)',
              color: 'white',
            }}
          >
            <Typography 
              variant="caption" 
              sx={{ 
                flexGrow: 1,
                fontSize: '11px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Box
                component="img"
                src="https://i.ibb.co/hxwVLpW9/meetme.png"
                alt="Buzzed Icon"
                sx={{ 
                  width: 15, 
                  height: 15,
                  mr: 0.5,
                  mt: '-2px',
                  objectFit: 'contain'
                }}
              />
              BUZZED! MESSENGER - ERROR
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Box
                sx={{
                  width: 14,
                  height: 14,
                  fontSize: '9px',
                  lineHeight: '13px',
                  textAlign: 'center',
                  bgcolor: '#dadada',
                  border: '1px solid white',
                  borderRadius: '0',
                  color: 'black',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: '#efefef',
                  },
                }}
              >
                X
              </Box>
            </Box>
          </Box>

          {/* Error content */}
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Box 
              component="img"
              src="/welcome/wake.png"
              alt="Error Character"
              sx={{ 
                width: 80, 
                height: 80,
                mb: 2,
                objectFit: 'contain',
              }}
            />
            
            <Typography 
              sx={{ 
                color: '#770094', 
                fontSize: '16px', 
                fontWeight: 'bold',
                mb: 1,
                fontFamily: '"Tahoma", sans-serif'
              }}
            >
              Room Not Found
            </Typography>
            
            <Typography 
              sx={{ 
                fontSize: '12px', 
                color: '#555',
                mb: 3,
                fontFamily: '"Tahoma", sans-serif'
              }}
            >
              The room you are trying to access does not exist or has been deleted.
            </Typography>
            
            <Box
              onClick={() => navigate('/')}
              sx={{
                textTransform: 'none',
                bgcolor: '#D9BFFF',
                color: '#000',
                fontSize: '12px',
                borderRadius: 0,
                py: 0.5,
                border: '1px solid #9483A9',
                fontWeight: 'normal',
                boxShadow: 'none',
                cursor: 'pointer',
                width: '60%',
                mx: 'auto',
                '&:hover': {
                  bgcolor: '#E5D3FF',
                },
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontFamily: '"Tahoma", sans-serif'
              }}
            >
              Return to Room List
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000',
        position: 'relative',
        backgroundImage: 'url(/bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        fontFamily: '"Tahoma", sans-serif',
        ...cursorStyle,
      }}
    >
      {/* Main chat container with sidebars */}
      <Box
        sx={{
          display: 'flex',
          width: '1300px',
          height: '700px',
          borderRadius: '0',
          overflow: 'hidden',
          boxShadow: '5px 5px 15px rgba(0, 0, 0, 0.35)',
          border: '1px solid #770094',
        }}
      >
        {/* Left Sidebar - Rooms List */}
        {showLeftSidebar && (
          <Box
            sx={{
              width: '200px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRight: '1px solid #770094',
              zIndex: 2,
              backgroundColor: '#f7eefb',
            }}
          >
            <Box 
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'linear-gradient(to bottom, #a33ebd 0%, #770094 100%)',
                color: '#fff',
                height: '24px',
                px: 1,
                userSelect: 'none',
              }}
            >
              <Typography 
                sx={{ 
                  fontSize: '12px', 
                  fontWeight: 'bold',
                  fontFamily: '"Tahoma", sans-serif',
                }}
              >
                Chat Rooms
              </Typography>
            </Box>
            
            <Box sx={{ 
              flex: 1, 
              overflowY: 'auto',
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
            }}>
              <List dense disablePadding>
                {availableRooms.map((chatRoom) => (
                  <ListItem 
                    key={chatRoom._id}
                    button 
                    selected={chatRoom._id === roomId}
                    onClick={() => navigate(`/room/${chatRoom._id}`)}
                    sx={{ 
                      borderBottom: '1px solid #e0e0e0',
                      bgcolor: chatRoom._id === roomId ? '#edd6f8' : 'transparent',
                      '&:hover': {
                        bgcolor: '#f2e3fa',
                      },
                      '&.Mui-selected': {
                        bgcolor: '#e5c7f5',
                        '&:hover': {
                          bgcolor: '#e5c7f5',
                        },
                      },
                    }}
                  >
                    <ListItemAvatar sx={{ minWidth: '36px' }}>
                      <Avatar 
                        sx={{ 
                          width: 28, 
                          height: 28, 
                          bgcolor: '#770094',
                          fontSize: '12px',
                        }}
                      >
                        {chatRoom.name.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={chatRoom.name} 
                      primaryTypographyProps={{ 
                        fontSize: '13px',
                        fontFamily: 'Tahoma',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      secondary={chatRoom.owner === username ? "You own this room" : null}
                      secondaryTypographyProps={{
                        fontSize: '10px',
                        color: '#006600',
                        fontFamily: 'Tahoma',
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
            
            <Box 
              sx={{ 
                display: 'flex',
                justifyContent: 'center',
                padding: '8px',
                borderTop: '1px solid #b57ad9', 
                backgroundColor: '#f2e9f7',
              }}
            >
              <Box 
                component="button"
                onClick={() => navigate('/')}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(to bottom, #ffffff 0%, #f0e5f5 100%)',
                  border: '1px solid #9e56b6',
                  borderRadius: '3px',
                  width: '100%',
                  py: 0.5,
                  fontSize: '12px',
                  fontFamily: '"Tahoma", sans-serif',
                  color: '#000',
                  cursor: 'pointer',
                  '&:hover': {
                    background: 'linear-gradient(to bottom, #ffffff 0%, #f0f0f0 100%)',
                  },
                }}
              >
                Join New Room
              </Box>
            </Box>
          </Box>
        )}

        {/* Main Chat Window */}
        <Box
          sx={{
            width: showLeftSidebar && showRightSidebar ? 'calc(100% - 400px)' : 
                  showLeftSidebar || showRightSidebar ? 'calc(100% - 200px)' : '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            zIndex: 1,
            backgroundColor: '#f7eefb',
          }}
        >
          {/* Windows-style title bar with gradient and toggle buttons for sidebars */}
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
              <Tooltip title={showLeftSidebar ? "Hide Rooms List" : "Show Rooms List"}>
                <IconButton
                  size="small"
                  onClick={() => setShowLeftSidebar(!showLeftSidebar)}
                  sx={{
                    padding: 0,
                    width: '16px',
                    height: '16px',
                    mr: 0.5,
                  }}
                >
                  <ArrowBackIcon sx={{ fontSize: '12px', color: '#fff', transform: showLeftSidebar ? 'none' : 'rotate(180deg)' }} />
                </IconButton>
              </Tooltip>
              <Box 
                component="img" 
                src="https://i.ibb.co/hxwVLpW9/meetme.png" 
                alt="Buzzed! Messenger" 
                sx={{ 
                  height: '16px',
                  width: 'auto',
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
                {room.name} - Buzzed! Messenger
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Tooltip title={showRightSidebar ? "Hide Members List" : "Show Members List"}>
                <IconButton
                  size="small"
                  onClick={() => setShowRightSidebar(!showRightSidebar)}
                  sx={{ 
                    padding: 0,
                    width: '16px',
                    height: '16px',
                    mr: 0.5,
                  }}
                >
                  <ArrowBackIcon sx={{ fontSize: '12px', color: '#fff', transform: showRightSidebar ? 'rotate(180deg)' : 'none' }} />
                </IconButton>
              </Tooltip>
              <IconButton 
                size="small" 
                onClick={handleBack}
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
              background: '#ebeef4',
              borderBottom: '1px solid #a5bedc',
            }}
          >
            <Box 
              component="button"
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(to bottom, #ffffff 0%, #e1e1e1 100%)',
                border: '1px solid #999999',
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
              <PersonIcon sx={{ fontSize: '14px', mr: 0.5 }} />
              Invite
            </Box>
            
            {/* Display room owner status */}
            {isRoomOwner && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#ffffc0',
                  border: '1px solid #e0dd80',
                  borderRadius: '3px',
                  px: 1,
                  py: 0.25,
                  fontSize: '11px',
                  fontFamily: '"Tahoma", sans-serif',
                  color: '#000',
                }}
              >
                Room Owner
              </Box>
            )}
            
            <Box sx={{ flexGrow: 1 }} />
            
            {/* Notifications button */}
            <Tooltip title="Notifications">
              <IconButton
                onClick={handleNotificationsClick}
                size="small"
                sx={{
                  width: '24px',
                  height: '24px',
                  background: notificationCount ? 'linear-gradient(to bottom, #ffffd0 0%, #ffffa0 100%)' : 'linear-gradient(to bottom, #ffffff 0%, #e1e1e1 100%)',
                  border: '1px solid #999999',
                  borderRadius: '3px',
                  p: 0.25,
                  '&:hover': {
                    background: 'linear-gradient(to bottom, #ffffff 0%, #f0f0f0 100%)',
                  },
                }}
              >
                <Badge 
                  badgeContent={notificationCount} 
                  color="primary"
                  sx={{
                    '& .MuiBadge-badge': {
                      backgroundColor: '#ff3300',
                      color: '#fff',
                      fontFamily: '"Tahoma", sans-serif',
                      fontWeight: 'bold',
                      fontSize: '9px',
                      minWidth: '14px',
                      height: '14px',
                    }
                  }}
                >
                  <NotificationsIcon sx={{ fontSize: '16px', color: '#000080' }} />
                </Badge>
              </IconButton>
            </Tooltip>
            
            {/* User menu */}
            <UserMenu username={username} socket={socket} />
          </Box>

          {/* Messages container with Buzzed! Messenger style */}
          <Box 
            ref={messagesContainerRef}
            sx={{ 
              flex: 1, 
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              background: '#ffffff',
              backgroundImage: room?.customization?.chatBackgroundUrl ? `url(${room.customization.chatBackgroundUrl})` : 'none',
              backgroundRepeat: 'repeat',
              p: 1,
              position: 'relative',
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
              scrollbarWidth: 'auto',
              scrollbarColor: '#a5bedc #f0f0f0',
              borderTop: '1px solid #7b9ebd',
            }}
          >
            {messages.map((message) => renderMessage(message))}
            <div ref={messagesEndRef} />
          </Box>

          {/* Format toolbar */}
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
                      const selectedText = newMessage.substring(start, end);
                      const newText = newMessage.substring(0, start) + 
                                     `**${selectedText}**` + 
                                     newMessage.substring(end);
                      setNewMessage(newText);
                      // Set cursor position after formatting
                      setTimeout(() => {
                        input.focus();
                        input.setSelectionRange(start + 2, end + 2);
                      }, 0);
                    } else {
                      // Toggle bold for future typing
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
                      const selectedText = newMessage.substring(start, end);
                      const newText = newMessage.substring(0, start) + 
                                     `*${selectedText}*` + 
                                     newMessage.substring(end);
                      setNewMessage(newText);
                      // Set cursor position after formatting
                      setTimeout(() => {
                        input.focus();
                        input.setSelectionRange(start + 1, end + 1);
                      }, 0);
                    } else {
                      // Toggle italic for future typing
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
                      const selectedText = newMessage.substring(start, end);
                      const newText = newMessage.substring(0, start) + 
                                     `__${selectedText}__` + 
                                     newMessage.substring(end);
                      setNewMessage(newText);
                      // Set cursor position after formatting
                      setTimeout(() => {
                        input.focus();
                        input.setSelectionRange(start + 2, end + 2);
                      }, 0);
                    } else {
                      // Toggle underline for future typing
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
            <Tooltip title="Emojis">
              <IconButton 
                size="small" 
                onClick={() => setShowEmojis(!showEmojis)}
                sx={{ 
                  color: showEmojis ? '#0E53A7' : '#666',
                  '&:hover': { bgcolor: '#D9E1F2' }
                }}
              >
                <EmojiEmotionsIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Text Color">
              <IconButton 
                size="small" 
                onClick={(e) => setColorPickerAnchor(e.currentTarget)}
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
            <Menu
              anchorEl={colorPickerAnchor}
              open={Boolean(colorPickerAnchor)}
              onClose={() => setColorPickerAnchor(null)}
              sx={{
                '& .MuiMenu-paper': {
                  backgroundColor: '#ffffff',
                  boxShadow: '2px 2px 5px rgba(0, 0, 0, 0.2)',
                  border: '1px solid #CCD5E4',
                }
              }}
            >
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(4, 1fr)', 
                gap: '4px',
                padding: '8px',
                width: '160px'
              }}>
                {TEXT_COLORS.map((color) => (
                  <Tooltip key={color.value} title={color.name}>
                    <Box
                      onClick={() => {
                        setTextColor(color.value);
                        setColorPickerAnchor(null);
                      }}
                      sx={{ 
                        width: '32px',
                        height: '32px',
                        borderRadius: '4px',
                        backgroundColor: color.value,
                        cursor: 'pointer',
                        border: textColor === color.value ? '2px solid #000' : '1px solid #DDD',
                        '&:hover': {
                          boxShadow: '0 0 5px rgba(0, 0, 0, 0.2)',
                          transform: 'scale(1.05)'
                        },
                        transition: 'all 0.1s ease'
                      }}
                    />
                  </Tooltip>
                ))}
              </Box>
            </Menu>
          </Box>

          {/* Emoji picker */}
          {showEmojis && (
            <Box sx={{ 
              maxHeight: '250px',
              maxWidth: '100%', 
              overflowY: 'auto', 
              overflowX: 'hidden',
              bgcolor: '#f7eefb', 
              border: '1px solid #770094',
              borderTop: 'none',
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
            }}>
              <Typography
                sx={{
                  fontSize: '11px',
                  fontWeight: 'bold',
                  padding: '4px 8px',
                  fontFamily: '"Tahoma", sans-serif',
                  color: '#770094',
                  borderBottom: '1px solid #d0c0dd',
                }}
              >
                Buzzed! Messenger Emoticons
              </Typography>
              
              {(() => {
                // Use the grouping function to organize emoticons
                const categorizedEmoticons = groupEmoticonsByCategory();
                
                return (
                  <Box sx={{ px: 1, py: 1 }}>
                    {/* Render each category */}
                    {Object.entries(categorizedEmoticons).map(([category, emoticons]) => (
                      <Box key={category} sx={{ mb: 2 }}>
                        <Typography 
                          sx={{ 
                            fontSize: '10px', 
                            fontWeight: 'bold', 
                            color: '#770094',
                            mb: 0.5,
                            fontFamily: '"Tahoma", sans-serif',
                          }}
                        >
                          {category}
                        </Typography>
                        
                        <Box sx={{ 
                          display: 'grid',
                          gridTemplateColumns: 'repeat(8, 1fr)',
                          gap: '2px',
                        }}>
                          {emoticons.map((emoticon, index) => (
                            <Tooltip key={index} title={`${emoticon.name} ${emoticon.shortcut}`}>
                              <Box 
                                sx={{ 
                                  cursor: 'pointer', 
                                  padding: '4px',
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  border: '1px solid transparent',
                                  borderRadius: '4px',
                                  '&:hover': { 
                                    bgcolor: '#e5c7f5',
                                    border: '1px solid #b57ad9',
                                  }
                                }}
                                onClick={() => {
                                  setNewMessage(prev => prev + " " + emoticon.shortcut + " ");
                                  inputRef.current?.focus();
                                }}
                              >
                                <Box 
                                  component="img" 
                                  src={emoticon.src} 
                                  alt={emoticon.name}
                                  sx={{ 
                                    maxHeight: '24px',
                                    objectFit: 'contain',
                                  }}
                                />
                              </Box>
                            </Tooltip>
                          ))}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                );
              })()}
              
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'flex-end',
                pt: 1,
                borderTop: '1px solid #d0c0dd',
                px: 1,
                pb: 1
              }}>
                <Typography
                  sx={{
                    fontSize: '9px',
                    fontFamily: '"Tahoma", sans-serif',
                    color: '#666',
                    fontStyle: 'italic'
                  }}
                >
                  Type emoticon shortcuts directly in your message
                </Typography>
              </Box>
            </Box>
          )}

          {/* Input area */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            padding: '8px', 
            bgcolor: '#f0f5fa', 
            borderTop: replyTo ? 'none' : '1px solid #7b9ebd' 
          }}>
            {/* Reply indicator */}
            {replyTo && (
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '4px 12px',
                  backgroundColor: '#EFF2F8',
                  borderRadius: '4px',
                  marginBottom: '8px',
                  borderLeft: '3px solid #6689BC',
                }}
              >
                <ReplyIcon fontSize="small" sx={{ color: '#6689BC', mr: 1 }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: '11px',
                      color: '#444444',
                      fontFamily: 'Tahoma'
                    }}
                  >
                    Replying to <strong style={{ color: '#800000' }}>{replyTo.username}</strong>
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: '11px',
                      color: '#666666',
                      fontFamily: 'Tahoma',
                      maxWidth: '100%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {replyTo.content}
                  </Typography>
                </Box>
                <IconButton 
                  size="small" 
                  onClick={cancelReply}
                  sx={{ 
                    padding: '2px',
                    color: '#666666',
                    '&:hover': { color: '#333333' }
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField
                inputRef={inputRef}
                fullWidth
                placeholder="Type a message..."
                variant="outlined"
                size="small"
                onKeyDown={handleKeyDown}
                value={newMessage}
                onChange={handleInputChange}
                sx={{
                  flexGrow: 1,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#FFFFFF',
                    borderRadius: '20px',
                    fontFamily: 'Tahoma',
                    fontWeight: textFormat.bold ? 'bold' : 'normal',
                    fontStyle: textFormat.italic ? 'italic' : 'normal',
                  },
                  '& .MuiInputBase-input': {
                    color: textColor,
                  }
                }}
              />
              <Typography 
                sx={{ 
                  fontSize: '11px', 
                  color: characterCount === MAX_MESSAGE_LENGTH ? '#ff0000' : '#666666',
                  fontFamily: 'Tahoma',
                  minWidth: '50px',
                  textAlign: 'right'
                }}
              >
                {characterCount}/{MAX_MESSAGE_LENGTH}
              </Typography>
              <MentionsPopup
                users={mentionsSearchResult.map(user => user.username)}
                searchText={mentionSearch ? mentionSearch.query : ''}
                onSelectUser={handleMentionSelect}
              />
              <IconButton
                onClick={handleSubmit} 
                sx={{
                  marginLeft: '8px', 
                  bgcolor: '#6689BC', 
                  color: 'white',
                  borderRadius: '2px',
                  '&:hover': { bgcolor: '#4471A9' },
                  height: '36px',
                  width: '36px',
                  alignSelf: 'flex-end',
                }}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>
        
        {/* Right Sidebar - Room Members and Buddies */}
        {showRightSidebar && (
          <Box
            sx={{
              width: '200px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderLeft: '1px solid #770094',
              zIndex: 2,
              backgroundColor: '#f7eefb',
            }}
          >
            {/* Room Members Section */}
            <Box sx={{ height: '50%', display: 'flex', flexDirection: 'column' }}>
              <Box 
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'linear-gradient(to bottom, #a33ebd 0%, #770094 100%)',
                  color: '#fff',
                  height: '24px',
                  px: 1,
                  userSelect: 'none',
                }}
              >
                <Typography 
                  sx={{ 
                    fontSize: '12px', 
                    fontWeight: 'bold',
                    fontFamily: '"Tahoma", sans-serif',
                  }}
                >
                  Room Members ({roomUsers.length})
                </Typography>
              </Box>
              
              <Box sx={{ 
                flex: 1, 
                overflowY: 'auto',
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
              }}>
                <List dense disablePadding>
                  {roomUsers.map((user) => (
                    <ListItem 
                      key={user.id || user.username}
                      sx={{ 
                        borderBottom: '1px solid #e0e0e0',
                        py: 0.75,
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          width: '100%',
                          cursor: 'pointer',
                          '&:hover': {
                            '& .username': {
                              textDecoration: 'underline',
                            }
                          }
                        }}
                        onClick={(e) => handleUserClick(e, user.username)}
                      >
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: activeUsers.has(user.username) ? '#4caf50' : '#f44336',
                            mr: 1.5,
                            ml: 1,
                            border: '1px solid',
                            borderColor: activeUsers.has(user.username) ? '#006600' : '#aa0000',
                          }}
                        />
                        <Typography
                          className="username"
                          sx={{
                            fontSize: '13px',
                            fontFamily: 'Tahoma',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            color: '#000000',
                          }}
                        >
                          {user.username}
                          {user.username === username && (
                            <Typography
                              component="span"
                              sx={{
                                fontSize: '10px',
                                color: '#006600',
                                fontFamily: 'Tahoma',
                                ml: 0.5,
                              }}
                            >
                              (You)
                            </Typography>
                          )}
                        </Typography>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Box>

            {/* Buddies Section */}
            <Box sx={{ height: '50%', display: 'flex', flexDirection: 'column', borderTop: '1px solid #770094' }}>
              <Box 
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'linear-gradient(to bottom, #a33ebd 0%, #770094 100%)',
                  color: '#fff',
                  height: '24px',
                  px: 1,
                  userSelect: 'none',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography 
                    sx={{ 
                      fontSize: '12px', 
                      fontWeight: 'bold',
                      fontFamily: '"Tahoma", sans-serif',
                    }}
                  >
                    Buddies ({buddyList.length})
                  </Typography>
                  {buddyRequests.length > 0 && (
                    <Box
                      sx={{
                        backgroundColor: '#ff3300',
                        color: '#ffffff',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        padding: '0 4px',
                        borderRadius: '8px',
                        minWidth: '16px',
                        height: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: '"Tahoma", sans-serif',
                      }}
                    >
                      {buddyRequests.length}
                    </Box>
                  )}
                </Box>
              </Box>
              
              {/* Buddy Requests Section */}
              <BuddyRequests
                requests={buddyRequests}
                onAccept={handleAcceptBuddy}
                onDeny={handleDenyBuddy}
              />
              
              {/* Buddies List */}
              <Box sx={{ 
                flex: 1, 
                overflowY: 'auto',
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
              }}>
                <List dense disablePadding>
                  {buddyList.map((buddy) => (
                    <ListItem 
                      key={buddy}
                      disablePadding
                      sx={{
                        py: 0.25,
                        '&:hover': {
                          backgroundColor: '#f0e5f5',
                        }
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          width: '100%',
                          cursor: 'pointer',
                          '&:hover': {
                            '& .username': {
                              textDecoration: 'underline',
                            }
                          }
                        }}
                        onClick={() => buddyChatManagerRef.current?.openChat(buddy)}
                      >
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: activeUsers.has(buddy) ? '#4caf50' : '#f44336',
                            mr: 1.5,
                            ml: 1,
                            border: '1px solid',
                            borderColor: activeUsers.has(buddy) ? '#006600' : '#aa0000',
                          }}
                        />
                        <Typography
                          className="username"
                          sx={{
                            fontSize: '13px',
                            fontFamily: 'Tahoma',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            color: '#000000',
                            flex: 1,
                          }}
                        >
                          {buddy}
                        </Typography>
                        <IconButton
                          edge="end"
                          aria-label="remove buddy"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveBuddy(buddy);
                          }}
                          sx={{ 
                            padding: '2px',
                            mr: 0.5,
                            '&:hover': { 
                              color: '#ff0000',
                              backgroundColor: 'transparent',
                            }
                          }}
                        >
                          <CloseIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Box>
                    </ListItem>
                  ))}
                  {buddyList.length === 0 && (
                    <ListItem sx={{ py: 1 }}>
                      <Typography
                        sx={{
                          fontSize: '12px',
                          fontFamily: '"Tahoma", sans-serif',
                          color: '#666666',
                          textAlign: 'center',
                          width: '100%',
                          fontStyle: 'italic',
                        }}
                      >
                        No buddies added yet
                      </Typography>
                    </ListItem>
                  )}
                </List>
              </Box>
            </Box>
          </Box>
        )}

        {/* Buddy Menu */}
        <Menu
          anchorEl={buddyMenuAnchor}
          open={Boolean(buddyMenuAnchor)}
          onClose={handleCloseBuddyMenu}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
        >
          {selectedUser && !buddyList.includes(selectedUser) && (
            <MenuItem
              onClick={() => {
                handleAddBuddy(selectedUser);
                handleCloseBuddyMenu();
              }}
              sx={{
                fontSize: '12px',
                fontFamily: '"Tahoma", sans-serif',
              }}
            >
              Add to Buddies
            </MenuItem>
          )}
          {selectedUser && buddyList.includes(selectedUser) && (
            <MenuItem
              onClick={() => {
                handleRemoveBuddy(selectedUser);
                handleCloseBuddyMenu();
              }}
              sx={{
                fontSize: '12px',
                fontFamily: '"Tahoma", sans-serif',
                color: '#ff0000',
              }}
            >
              Remove from Buddies
            </MenuItem>
          )}
        </Menu>
      </Box>

      {/* Notification Menu with Buzzed! Messenger Style */}
      <Menu
        anchorEl={anchorEl}
        open={openNotificationsMenu}
        onClose={handleNotificationsClose}
        sx={{
          '& .MuiMenu-paper': {
            backgroundColor: '#ffffff',
            color: '#000000',
            minWidth: '300px',
            maxWidth: '350px',
            maxHeight: '350px',
            overflowY: 'auto',
            boxShadow: '2px 2px 5px rgba(0, 0, 0, 0.3)',
            borderRadius: '0',
            border: '1px solid #770094',
            fontFamily: '"Tahoma", sans-serif',
            '& .MuiMenuItem-root': {
              fontFamily: '"Tahoma", sans-serif',
              fontSize: '12px',
            },
          },
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            px: 1.5,
            py: 0.75,
            background: 'linear-gradient(to bottom, #a33ebd 0%, #770094 100%)',
            borderBottom: '1px solid #770094',
          }}
        >
          <Typography sx={{ fontWeight: 'bold', fontSize: '12px', color: '#ffffff' }}>Notifications</Typography>
          {notifications.length > 0 && (
            <Typography 
              onClick={handleClearNotifications}
              sx={{ 
                fontSize: '11px', 
                color: '#000080', 
                cursor: 'pointer',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Clear all
            </Typography>
          )}
        </Box>
        {notifications.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography sx={{ color: '#666666', fontSize: '12px' }}>
              No notifications yet
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((notification) => (
              <ListItem 
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                sx={{ 
                  py: 0.5,
                  px: 1,
                  borderBottom: '1px solid #efefef',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: '24px', color: notification.type === 'reply' ? '#800000' : '#000080' }}>
                  {notification.type === 'reply' ? <ReplyIcon sx={{ fontSize: '14px' }} /> : <NotificationsIcon sx={{ fontSize: '14px' }} />}
                </ListItemIcon>
                <ListItemText
                  primary={notification.message}
                  secondary={
                    <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between', color: '#666666' }}>
                      <Typography component="span" sx={{ fontSize: '11px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {notification.content}
                      </Typography>
                      <Typography component="span" sx={{ fontSize: '10px', ml: 1 }}>
                        {formatNotificationTime(notification.timestamp)}
                      </Typography>
                    </Box>
                  }
                  primaryTypographyProps={{ 
                    sx: { 
                      fontSize: '12px',
                      color: '#000000',
                      fontFamily: '"Tahoma", sans-serif',
                    }
                  }}
                  secondaryTypographyProps={{
                    sx: {
                      fontFamily: '"Tahoma", sans-serif',
                    }
                  }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Menu>
      
      {/* Room Customization Panel */}
      {isRoomOwner && (
        <RoomCustomizationPanel 
          roomId={roomId}
          socket={socket}
          isRoomOwner={isRoomOwner}
          dialogOpen={customizationPanelOpen}
          setDialogOpen={setCustomizationPanelOpen}
        />
      )}

      {/* Buddy Chat Windows */}
      <BuddyChatManager
        ref={buddyChatManagerRef}
        socket={socket}
        username={username}
        buddyList={buddyList}
      />
    </Box>
  );
}

export default ChatRoom; 