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
const BuddyRelation = require('./models/BuddyRelation');
const DirectMessage = require('./models/DirectMessage');

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
// Store online users globally
const onlineUsers = new Set();
// Store active users per room (for room membership)
const activeUsersPerRoom = new Map();
// Store socket IDs for direct messaging
const userSocketMap = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected with ID:', socket.id);
  
  // Create a username variable scoped to this socket
  let socketUsername;
  let currentRoom = null;
  
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

  // Mark user as online when they connect
  onlineUsers.add(socketUsername);
  io.emit('user_online', { username: socketUsername });

  // Map username to socket for direct messaging
  socket.on('use_existing_username', (storedUsername) => {
    // Remove old username mappings
    onlineUsers.delete(socketUsername);
    userSocketMap.delete(socketUsername);
    
    socketUsername = storedUsername;
    socketUsers.set(socket.id, storedUsername);
    
    // Add new username mappings
    onlineUsers.add(storedUsername);
    userSocketMap.set(storedUsername, socket.id);
    io.emit('user_online', { username: storedUsername });
    
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
    
    // Remove old username from online users
    onlineUsers.delete(socketUsername);
    
    // Update the socket username
    const oldUsername = socketUsername;
    socketUsername = sanitizedNewUsername;
    
    // Update username in the socketUsers map and online users
    socketUsers.set(socket.id, sanitizedNewUsername);
    onlineUsers.add(sanitizedNewUsername);
    
    // Emit events to confirm the change and notify about online status
    socket.emit('username_changed', { 
      oldUsername, 
      newUsername: sanitizedNewUsername 
    });
    io.emit('user_online', { username: sanitizedNewUsername });
    io.emit('user_offline', { username: oldUsername });
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

  // Handle joining a room
  socket.on('join_room', async (roomId) => {
    // Leave previous room if any
    if (currentRoom) {
      socket.leave(currentRoom);
      // Remove user from active users in previous room
      const activeUsers = activeUsersPerRoom.get(currentRoom) || new Set();
      activeUsers.delete(socketUsername);
      activeUsersPerRoom.set(currentRoom, activeUsers);
      // Notify others in the previous room
      socket.to(currentRoom).emit('user_left', { username: socketUsername });
      // Update room members for the previous room
      io.to(currentRoom).emit('room_members', Array.from(activeUsers));
    }

    // Join new room
    socket.join(roomId);
    currentRoom = roomId;
    console.log(`User ${socketUsername} joined room ${roomId}`);

    // Add user to active users in new room
    const activeUsers = activeUsersPerRoom.get(roomId) || new Set();
    activeUsers.add(socketUsername);
    activeUsersPerRoom.set(roomId, activeUsers);

    // Load previous messages
    const messages = await Message.find({ roomId }).sort({ createdAt: -1 }).limit(50);
    socket.emit('load_messages', messages.reverse());

    // Notify others in the room
    socket.to(roomId).emit('user_joined', { username: socketUsername });
    // Update room members for everyone in the room
    io.to(currentRoom).emit('room_members', Array.from(activeUsers));
  });

  // Handle get_active_users request
  socket.on('get_active_users', (roomId) => {
    socket.emit('active_users', Array.from(onlineUsers));
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

  // Handle buddy requests
  socket.on('send_buddy_request', async (data) => {
    try {
      const recipientSocketId = userSocketMap.get(data.to);
      
      // Store the buddy request in the database
      const buddyRelation = new BuddyRelation({
        user1: socketUsername,
        user2: data.to,
        status: 'pending',
        requestedBy: socketUsername
      });
      await buddyRelation.save();

      if (recipientSocketId) {
        // Send the buddy request to the recipient
        io.to(recipientSocketId).emit('buddy_request', { 
          from: socketUsername,
          timestamp: Date.now()
        });
        console.log(`Buddy request sent from ${socketUsername} to ${data.to}`);
      } else {
        // Even if recipient is offline, request is stored in DB
        socket.emit('info', { message: 'User is offline but request will be saved' });
      }
    } catch (error) {
      if (error.code === 11000) {
        // Duplicate key error - request already exists
        socket.emit('error', { message: 'A buddy request already exists between these users' });
      } else {
        console.error('Error sending buddy request:', error);
        socket.emit('error', { message: 'Failed to send buddy request' });
      }
    }
  });

  // Handle buddy request responses
  socket.on('buddy_request_response', async (data) => {
    try {
      const recipientSocketId = userSocketMap.get(data.to);
      
      // Update the buddy relation in the database
      const buddyRelation = await BuddyRelation.findOne({
        $or: [
          { user1: socketUsername, user2: data.to },
          { user1: data.to, user2: socketUsername }
        ],
        status: 'pending'
      });

      if (!buddyRelation) {
        return socket.emit('error', { message: 'Buddy request not found' });
      }

      if (data.accepted) {
        buddyRelation.status = 'accepted';
        await buddyRelation.save();
      } else {
        await buddyRelation.delete();
      }

      if (recipientSocketId) {
        // Send the response to the original requester
        io.to(recipientSocketId).emit('buddy_request_response', { 
          from: socketUsername,
          accepted: data.accepted
        });
        console.log(`Buddy request ${data.accepted ? 'accepted' : 'declined'} by ${socketUsername} for ${data.to}`);
      }
    } catch (error) {
      console.error('Error sending buddy request response:', error);
      socket.emit('error', { message: 'Failed to send buddy request response' });
    }
  });

  // Load buddy list and pending requests
  socket.on('load_buddy_data', async () => {
    try {
      // Get accepted buddy relations
      const acceptedBuddies = await BuddyRelation.find({
        $or: [
          { user1: socketUsername },
          { user2: socketUsername }
        ],
        status: 'accepted'
      });

      // Get pending requests
      const pendingRequests = await BuddyRelation.find({
        user2: socketUsername,
        status: 'pending'
      });

      socket.emit('buddy_data_loaded', {
        buddies: acceptedBuddies.map(relation => 
          relation.user1 === socketUsername ? relation.user2 : relation.user1
        ),
        requests: pendingRequests.map(request => ({
          from: request.user1,
          timestamp: request.timestamp
        }))
      });
    } catch (error) {
      console.error('Error loading buddy data:', error);
      socket.emit('error', { message: 'Failed to load buddy data' });
    }
  });

  // Handle direct messages
  socket.on('send_direct_message', async (data) => {
    try {
      const { to, content, textColor, formatting } = data;
      
      // Create and save the message in the database
      const messageData = new DirectMessage({
        from: socketUsername,
        to: to,
        content: sanitizeText(content),
        textColor: textColor || '#000000',
        formatting: formatting || {}
      });
      await messageData.save();

      // Get recipient's socket ID
      const recipientSocketId = userSocketMap.get(to);
      
      if (recipientSocketId) {
        // Send to recipient and trigger chat window open
        io.to(recipientSocketId).emit('receive_direct_message', messageData);
        io.to(recipientSocketId).emit('open_chat_window', { from: socketUsername });
        // Send back to sender
        socket.emit('receive_direct_message', messageData);
      } else {
        // If recipient is offline, only send to sender with offline notice
        messageData.offlineNotice = true;
        socket.emit('receive_direct_message', messageData);
      }
    } catch (error) {
      console.error('Error sending direct message:', error);
      socket.emit('error', { message: 'Failed to send direct message' });
    }
  });

  // Load chat history
  socket.on('load_chat_history', async (data) => {
    try {
      const { buddy, limit = 50 } = data;
      
      // Get messages between these users (in both directions)
      const messages = await DirectMessage.find({
        $or: [
          { from: socketUsername, to: buddy },
          { from: buddy, to: socketUsername }
        ]
      })
      .sort({ createdAt: -1 })
      .limit(limit);

      socket.emit('chat_history_loaded', {
        buddy,
        messages: messages.reverse()
      });
    } catch (error) {
      console.error('Error loading chat history:', error);
      socket.emit('error', { message: 'Failed to load chat history' });
    }
  });

  // Handle typing status for direct messages
  socket.on('buddy_typing_start', (data) => {
    const recipientSocketId = userSocketMap.get(data.to);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('buddy_typing', { 
        username: socketUsername,
        isTyping: true 
      });
    }
  });

  socket.on('buddy_typing_stop', (data) => {
    const recipientSocketId = userSocketMap.get(data.to);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('buddy_typing', { 
        username: socketUsername,
        isTyping: false 
      });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Remove user from all mappings
    onlineUsers.delete(socketUsername);
    userSocketMap.delete(socketUsername);
    io.emit('user_offline', { username: socketUsername });
    
    if (currentRoom) {
      // Remove user from active users in their room
      const activeUsers = activeUsersPerRoom.get(currentRoom) || new Set();
      activeUsers.delete(socketUsername);
      activeUsersPerRoom.set(currentRoom, activeUsers);
      // Notify others in the room
      io.to(currentRoom).emit('user_left', { username: socketUsername });
      // Update room members
      io.to(currentRoom).emit('room_members', Array.from(activeUsers));
    }
    
    socketUsers.delete(socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 