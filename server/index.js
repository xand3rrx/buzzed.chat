const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const app = express();
app.use(cors({
  origin: ['https://buzzed.chat', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
}));
app.use(express.json());

const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: ['https://buzzed.chat', 'http://localhost:3000'],
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true
  }
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Models
const Room = require('./models/Room');
const Message = require('./models/Message');
const User = require('./models/User');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// Function to sanitize text
const sanitizeText = (text) => {
  if (!text) return '';
  // First use DOMPurify to clean the HTML
  const cleanHtml = DOMPurify.sanitize(text);
  // Then extract just the text content to remove any remaining HTML
  const tempDiv = window.document.createElement('div');
  tempDiv.innerHTML = cleanHtml;
  return tempDiv.textContent || tempDiv.innerText || '';
};

// Generate random username
const generateUsername = () => {
  const adjectives = ['Happy', 'Lucky', 'Sunny', 'Clever', 'Swift', 'Brave'];
  const nouns = ['Panda', 'Tiger', 'Eagle', 'Dolphin', 'Fox', 'Wolf'];
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}${Math.floor(Math.random() * 1000)}`;
};

// Store usernames with socket IDs for persistence
const socketUsers = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected with ID:', socket.id);
  
  // Create a username variable scoped to this socket
  let socketUsername;
  
  // Check if this socket already had a username assigned (from reconnection)
  if (socketUsers.has(socket.id)) {
    socketUsername = socketUsers.get(socket.id);
    console.log(`Reconnected user with ID ${socket.id} as ${socketUsername}`);
    socket.emit('username_assigned', socketUsername);
  } else {
    // Generate a new username
    socketUsername = generateUsername();
    socketUsers.set(socket.id, socketUsername);
    socket.emit('username_assigned', socketUsername);
  }
  
  // Use existing username from localStorage
  socket.on('use_existing_username', (storedUsername) => {
    socketUsername = storedUsername;
    socketUsers.set(socket.id, storedUsername);
    console.log(`User is using existing username: ${storedUsername} (Socket ID: ${socket.id})`);
  });

  // Change username
  socket.on('change_username', async (data) => {
    console.log(`User changing username from ${socketUsername} to ${data.newUsername}`);
    
    const sanitizedNewUsername = sanitizeText(data.newUsername);
    
    // Check if this is a registered user by checking localStorage flag sent from client
    const isRegisteredUser = data.isRegistered || false;
    
    // If not a registered user, check if the requested username is already registered
    if (!isRegisteredUser) {
      try {
        const existingUser = await User.findOne({ username: sanitizedNewUsername });
        
        if (existingUser) {
          return socket.emit('command_error', { 
            message: `Username "${sanitizedNewUsername}" is already registered by another user.` 
          });
        }
      } catch (error) {
        console.error('Error checking username availability:', error);
      }
    }
    
    // Update the socket username
    const oldUsername = socketUsername;
    socketUsername = sanitizedNewUsername;
    
    // Update username in the socketUsers map
    socketUsers.set(socket.id, sanitizedNewUsername);
    
    // Emit event to confirm the change
    socket.emit('username_changed', { 
      oldUsername, 
      newUsername: sanitizedNewUsername 
    });
  });

  // Create room
  socket.on('create_room', async (roomName) => {
    try {
      const sanitizedRoomName = sanitizeText(roomName);
      
      // Check room name length
      if (!sanitizedRoomName || sanitizedRoomName.length > 30) {
        return socket.emit('command_error', { 
          message: 'Room name must be between 1 and 30 characters long.' 
        });
      }

      // Check if room name already exists (case-insensitive)
      const existingRoom = await Room.findOne({ 
        name: sanitizedRoomName 
      }).collation({ locale: 'en', strength: 2 });

      if (existingRoom) {
        return socket.emit('command_error', { 
          message: `A room with this name already exists (names are case-insensitive). "${existingRoom.name}" is already in use.` 
        });
      }
      
      console.log('Creating room:', sanitizedRoomName);
      const newRoom = await Room.create({ 
        name: sanitizedRoomName,
        owner: socketUsername 
      });
      console.log('Room created successfully:', newRoom);
      io.emit('room_created', newRoom);
      // Also emit rooms_list to update all clients
      const rooms = await Room.find();
      io.emit('rooms_list', rooms);
    } catch (error) {
      if (error.code === 11000) {
        // Handle duplicate key error
        return socket.emit('command_error', { 
          message: 'A room with this name already exists (names are case-insensitive).' 
        });
      }
      console.error('Error creating room:', error);
      socket.emit('error', { message: 'Failed to create room' });
    }
  });

  // Register username with password
  socket.on('register_username', async (data) => {
    try {
      const sanitizedUsername = sanitizeText(data.username);
      
      // Check if username is already registered (case-insensitive)
      const existingUser = await User.findOne({ 
        usernameLower: sanitizedUsername.toLowerCase() 
      });
      
      if (existingUser) {
        return socket.emit('command_error', { 
          message: `Username "${sanitizedUsername}" is already registered (usernames are case-insensitive).` 
        });
      }
      
      // Create new user
      const newUser = new User({ 
        username: sanitizedUsername,
        usernameLower: sanitizedUsername.toLowerCase()
      });
      newUser.setPassword(data.password);
      await newUser.save();
      
      // Update the socket username
      const oldUsername = socketUsername;
      socketUsername = sanitizedUsername;
      
      // Update username in the socketUsers map
      socketUsers.set(socket.id, sanitizedUsername);
      
      console.log(`Username "${sanitizedUsername}" registered successfully`);
      socket.emit('username_registered', { username: sanitizedUsername });
      
      // Emit register_success event for authentication tracking
      socket.emit('register_success', { username: sanitizedUsername });
    } catch (error) {
      console.error('Error registering username:', error);
      socket.emit('command_error', { 
        message: 'Failed to register username. Please try again.' 
      });
    }
  });

  // Login with username and password
  socket.on('login_username', async (data) => {
    try {
      const sanitizedUsername = sanitizeText(data.username);
      
      // Find the user (case-insensitive)
      const user = await User.findOne({ 
        usernameLower: sanitizedUsername.toLowerCase() 
      });
      
      if (!user) {
        return socket.emit('command_error', { 
          message: `Username "${sanitizedUsername}" is not registered.` 
        });
      }
      
      // Validate the password
      if (!user.validatePassword(data.password)) {
        return socket.emit('command_error', { 
          message: 'Invalid password.' 
        });
      }
      
      // Update the socket username with the exact case from the database
      const oldUsername = socketUsername;
      socketUsername = user.username; // Use the case from the database
      
      // Update username in the socketUsers map
      socketUsers.set(socket.id, user.username);
      
      console.log(`User logged in as "${user.username}"`);
      socket.emit('login_successful', { username: user.username });
      
      // Emit login_success event for authentication tracking
      socket.emit('login_success', { username: user.username });
    } catch (error) {
      console.error('Error logging in:', error);
      socket.emit('command_error', { 
        message: 'Failed to log in. Please try again.' 
      });
    }
  });

  // Handle logout
  socket.on('logout', () => {
    console.log(`User ${socketUsername} logged out`);
    // Generate a new temporary username
    const newTempUsername = generateUsername();
    socketUsername = newTempUsername;
    socketUsers.set(socket.id, newTempUsername);
    
    // Emit the new username and logout success events
    socket.emit('username_assigned', newTempUsername);
    socket.emit('logout_success');
  });

  // Join room
  socket.on('join_room', async (roomId) => {
    socket.join(roomId);
    console.log(`User ${socketUsername} joined room ${roomId}`);
    
    // Load previous messages
    const messages = await Message.find({ roomId }).sort({ createdAt: -1 }).limit(50);
    socket.emit('load_messages', messages.reverse());
    
    // Update room members for all users in the room
    updateAndNotifyRoomMembers(roomId);
  });

  // Function to update and notify room members
  async function updateAndNotifyRoomMembers(roomId) {
    try {
      // Get all sockets in this room
      const socketsInRoom = await io.in(roomId).fetchSockets();
      
      // Extract usernames from socket data
      const members = socketsInRoom.map(socket => {
        const memberUsername = socketUsers.get(socket.id);
        return {
          id: socket.id,
          username: memberUsername,
          isActive: true
        };
      });
      
      // Send the updated members list to all clients in the room
      io.to(roomId).emit('room_members', members);
    } catch (error) {
      console.error('Error updating room members:', error);
    }
  }

  // Update room customization
  socket.on('update_room_customization', async (data) => {
    try {
      const { roomId, backgroundUrl, cursorUrl, chatBackgroundUrl } = data;
      
      // Find the room
      const room = await Room.findById(roomId);
      
      if (!room) {
        return socket.emit('command_error', { 
          message: 'Room not found' 
        });
      }
      
      // Check if the user is the room owner
      if (room.owner !== socketUsername) {
        return socket.emit('command_error', { 
          message: 'Only the room owner can customize the room' 
        });
      }
      
      // Update the room customization
      room.customization = {
        backgroundUrl: backgroundUrl || room.customization.backgroundUrl,
        cursorUrl: cursorUrl || room.customization.cursorUrl,
        chatBackgroundUrl: chatBackgroundUrl || room.customization.chatBackgroundUrl
      };
      
      await room.save();
      
      // Notify all users in the room about the customization change
      io.to(roomId).emit('room_customized', { 
        roomId, 
        customization: room.customization 
      });
      
      console.log(`Room ${roomId} customized by ${socketUsername}`);
    } catch (error) {
      console.error('Error updating room customization:', error);
      socket.emit('command_error', { 
        message: 'Failed to update room customization. Please try again.' 
      });
    }
  });

  // Send message
  socket.on('send_message', async (data) => {
    try {
      const messageData = {
        roomId: data.roomId,
        username: socketUsername,
        content: sanitizeText(data.content),
        textColor: data.textColor || '#000000'
      };

      // Add reply information if it exists
      if (data.replyTo) {
        messageData.replyTo = {
          _id: data.replyTo._id,
          username: sanitizeText(data.replyTo.username),
          content: sanitizeText(data.replyTo.content)
        };
      }

      const message = await Message.create(messageData);
      io.to(data.roomId).emit('receive_message', message);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Get rooms
  socket.on('get_rooms', async () => {
    try {
      const rooms = await Room.find();
      socket.emit('rooms_list', rooms);
    } catch (error) {
      console.error('Error getting rooms:', error);
    }
  });

  // Get room data
  socket.on('get_room_data', async (roomId) => {
    try {
      const room = await Room.findById(roomId);
      if (room) {
        socket.emit('room_data', room);
      } else {
        socket.emit('error', { message: 'Room not found' });
      }
    } catch (error) {
      console.error('Error getting room data:', error);
      socket.emit('error', { message: 'Failed to get room data' });
    }
  });

  // Get room members
  socket.on('get_room_members', async (roomId) => {
    try {
      // Get all sockets in this room
      const socketsInRoom = await io.in(roomId).fetchSockets();
      
      // Extract usernames from socket data
      const members = socketsInRoom.map(socket => {
        const memberUsername = socketUsers.get(socket.id);
        return {
          id: socket.id,
          username: memberUsername,
          isActive: true
        };
      });
      
      // Add the current socket if not already in the list
      const currentUserAlreadyInList = members.some(
        member => member.username === socketUsername
      );
      
      if (!currentUserAlreadyInList) {
        members.push({
          id: socket.id,
          username: socketUsername,
          isActive: true
        });
      }
      
      // Send the members list to the requesting client
      socket.emit('room_members', members);
    } catch (error) {
      console.error('Error getting room members:', error);
      socket.emit('error', { message: 'Failed to get room members' });
    }
  });

  // Delete message (only for room owner or admin user 'xand3rr')
  socket.on('delete_message', async (data) => {
    try {
      const { messageId, roomId } = data;
      
      // Find the room
      const room = await Room.findById(roomId);
      
      if (!room) {
        return socket.emit('command_error', { 
          message: 'Room not found' 
        });
      }
      
      // Check if the user is the room owner or the admin user 'xand3rr'
      const isAdmin = socketUsername === 'xand3rr';
      if (room.owner !== socketUsername && !isAdmin) {
        return socket.emit('command_error', { 
          message: 'Only the room owner can delete messages' 
        });
      }
      
      // Delete the message
      await Message.findByIdAndDelete(messageId);
      
      // Notify all users in the room about the deleted message
      io.to(roomId).emit('message_deleted', { 
        messageId,
        deletedBy: socketUsername
      });
      
      // Send success response specifically to the user who deleted the message
      socket.emit('delete_message_response', { 
        success: true, 
        messageId,
        isAdmin
      });
      
      // Log the deletion with admin flag if applicable
      console.log(`Message ${messageId} deleted by ${isAdmin ? 'admin' : 'room owner'} ${socketUsername}`);
    } catch (error) {
      console.error('Error deleting message:', error);
      socket.emit('command_error', { 
        message: 'Failed to delete message. Please try again.' 
      });
    }
  });

  // Delete room (only for room owner or admin user 'xand3rr')
  socket.on('delete_room', async (data) => {
    try {
      const { roomId } = data;
      
      // Find the room
      const room = await Room.findById(roomId);
      
      if (!room) {
        return socket.emit('command_error', { 
          message: 'Room not found' 
        });
      }
      
      // Check if the user is the room owner or the admin user 'xand3rr'
      const isAdmin = socketUsername === 'xand3rr';
      if (room.owner !== socketUsername && !isAdmin) {
        return socket.emit('command_error', { 
          message: 'Only the room owner can delete the room' 
        });
      }
      
      // Delete all messages associated with the room
      await Message.deleteMany({ roomId });
      
      // Delete the room
      await Room.findByIdAndDelete(roomId);
      
      // Notify all users that the room has been deleted
      io.emit('room_deleted', { 
        roomId,
        deletedBy: socketUsername
      });
      
      // Send success response to the user who deleted the room
      socket.emit('delete_room_response', { 
        success: true, 
        roomId,
        isAdmin
      });
      
      // Log the deletion with admin flag if applicable
      console.log(`Room ${roomId} deleted by ${isAdmin ? 'admin' : 'room owner'} ${socketUsername}`);
    } catch (error) {
      console.error('Error deleting room:', error);
      socket.emit('command_error', { 
        message: 'Failed to delete room. Please try again.' 
      });
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    
    // Get the rooms this socket was in
    const rooms = Array.from(socket.rooms).filter(room => room !== socket.id);
    
    // Update the members list for each room
    rooms.forEach(roomId => {
      updateAndNotifyRoomMembers(roomId);
    });
    
    // Keep the username in the map for potential reconnection
    // socketUsers.delete(socket.id); - We don't delete it to maintain username across reconnection
    
    // Set a timeout to clean up if not reconnected within 1 hour
    setTimeout(() => {
      if (socketUsers.has(socket.id)) {
        console.log(`Cleaning up inactive socket: ${socket.id}`);
        socketUsers.delete(socket.id);
      }
    }, 3600000); // 1 hour
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 