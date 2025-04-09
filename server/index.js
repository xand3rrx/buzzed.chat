const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({
  origin: '*', // Allow requests from any origin
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: ["http://localhost:3000", process.env.FRONTEND_URL || "*"],
    methods: ["GET", "POST"],
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
  // User connected with ID logic
  
  // Create a username variable scoped to this socket
  let socketUsername;
  
  // Check if this socket already had a username assigned (from reconnection)
  if (socketUsers.has(socket.id)) {
    socketUsername = socketUsers.get(socket.id);
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
  });

  // Change username
  socket.on('change_username', async (data) => {
    // Check if this is a registered user by checking localStorage flag sent from client
    const isRegisteredUser = data.isRegistered || false;
    
    // If not a registered user, check if the requested username is already registered
    if (!isRegisteredUser) {
      try {
        const existingUser = await User.findOne({ username: data.newUsername });
        
        if (existingUser) {
          return socket.emit('command_error', { 
            message: `Username "${data.newUsername}" is already registered by another user.` 
          });
        }
      } catch (error) {
        console.error('Error checking username availability:', error);
      }
    }
    
    // Update the socket username
    const oldUsername = socketUsername;
    socketUsername = data.newUsername;
    
    // Update username in the socketUsers map
    socketUsers.set(socket.id, data.newUsername);
    
    // Emit event to confirm the change
    socket.emit('username_changed', { 
      oldUsername, 
      newUsername: data.newUsername 
    });
  });

  // Register username with password
  socket.on('register_username', async (data) => {
    try {
      // Check if username is already registered
      const existingUser = await User.findOne({ username: data.username });
      
      if (existingUser) {
        return socket.emit('command_error', { 
          message: `Username "${data.username}" is already registered.` 
        });
      }
      
      // Create new user
      const newUser = new User({ username: data.username });
      newUser.setPassword(data.password);
      await newUser.save();
      
      // Update the socket username
      const oldUsername = socketUsername;
      socketUsername = data.username;
      
      // Update username in the socketUsers map
      socketUsers.set(socket.id, data.username);
      
      socket.emit('username_registered', { username: data.username });
      
      // Emit register_success event for authentication tracking
      socket.emit('register_success', { username: data.username });
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
      // Find the user
      const user = await User.findOne({ username: data.username });
      
      if (!user) {
        return socket.emit('command_error', { 
          message: `Username "${data.username}" is not registered.` 
        });
      }
      
      // Validate the password
      if (!user.validatePassword(data.password)) {
        return socket.emit('command_error', { 
          message: 'Invalid password.' 
        });
      }
      
      // Update the socket username
      const oldUsername = socketUsername;
      socketUsername = data.username;
      
      // Update username in the socketUsers map
      socketUsers.set(socket.id, data.username);
      
      socket.emit('login_successful', { username: data.username });
      
      // Emit login_success event for authentication tracking
      socket.emit('login_success', { username: data.username });
    } catch (error) {
      console.error('Error logging in:', error);
      socket.emit('command_error', { 
        message: 'Failed to log in. Please try again.' 
      });
    }
  });

  // Handle logout
  socket.on('logout', () => {
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
    
    // Load previous messages
    const messages = await Message.find({ roomId }).sort({ createdAt: -1 }).limit(50);
    socket.emit('load_messages', messages.reverse());
    
    // Update room members for all users in the room
    updateRoomMembers(roomId);
  });

  // Function to update and notify room members
  async function updateRoomMembers(roomId) {
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

  // Create room
  socket.on('create_room', async (roomName) => {
    try {
      // Create a new room document
      const newRoom = new Room({
        name: roomName,
        owner: socketUsername,
        createdAt: new Date(),
        isPrivate: false,
        customization: {
          fontFamily: 'Arial, sans-serif',
          backgroundColor: '#ffffff',
          backgroundImage: '',
          backgroundAttachment: 'scroll',
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          customCursor: '',
          chatTheme: 'default',
        }
      });
      
      await newRoom.save();
      
      // Emit the new room to all connected clients
      io.emit('room_created', {
        _id: newRoom._id,
        name: newRoom.name,
        owner: newRoom.owner,
        createdAt: newRoom.createdAt,
        memberCount: 0,
      });
      
    } catch (error) {
      console.error('Error creating room:', error);
      socket.emit('error', { message: 'Failed to create room' });
    }
  });

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
        content: data.content,
        textColor: data.textColor || '#000000'
      };

      // Add reply information if it exists
      if (data.replyTo) {
        messageData.replyTo = {
          _id: data.replyTo._id,
          username: data.replyTo.username,
          content: data.replyTo.content
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

  // Delete message (only for room owner)
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
      
      // Check if the user is the room owner
      if (room.owner !== socketUsername) {
        return socket.emit('command_error', { 
          message: 'Only the room owner can delete messages' 
        });
      }
      
      // Delete the message
      await Message.findByIdAndDelete(messageId);
      
      // Notify all users in the room about the deleted message
      io.to(roomId).emit('message_deleted', { messageId });
      
    } catch (error) {
      console.error('Error deleting message:', error);
      socket.emit('command_error', { 
        message: 'Failed to delete message. Please try again.' 
      });
    }
  });

  // Handle disconnections
  socket.on('disconnect', () => {
    // Handle user disconnection logic here
    
    // Start a timer to clean up the socketUser after a delay
    // This allows for users who refresh the page to maintain their username
    setTimeout(() => {
      // Only clean up if the socket hasn't reconnected
      if (!io.sockets.sockets.has(socket.id)) {
        socketUsers.delete(socket.id);
      }
    }, 300000); // 5 minutes
    
    // Update room members lists
    const roomIds = Object.keys(socket.rooms).filter(id => id !== socket.id);
    roomIds.forEach(roomId => {
      updateRoomMembers(roomId);
    });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 