# Space Chat

A realtime chat application with a space theme, featuring username management, room customization, and more.

## Features

### User Management
- Random usernames are automatically assigned
- Change your username through the user menu in the top right corner
- Register your username with a password for future logins
- Log in with your registered username 

### Room Customization (Room Owners Only)
Room owners can customize their chat rooms:

- **Custom Background**: Select from preset backgrounds or enter a custom URL
- **Custom Mouse Cursor**: Choose from preset cursors or use your own custom cursor image

All customization options are available through the settings button in the room header when you are the room owner.

## Getting Started

### Setup
1. Install dependencies for both client and server:
   ```
   cd chat-app/server && npm install
   cd ../client && npm install
   ```

2. Start the server:
   ```
   cd chat-app/server && npm start
   ```

3. Start the client:
   ```
   cd chat-app/client && npm start
   ```

4. Open your browser to `http://localhost:3000`

## How to Use

### User Menu
Click the user icon in the top right corner to:
- Change your username
- Register your current username (with a password)
- Login with a registered username

### Room Customization (For Room Owners)
If you're the owner of a room (the person who created it):
1. Click the settings icon in the room header
2. Choose between background or cursor customization
3. Select from preset options or enter a custom URL
4. Click "Apply Changes" to update the room's appearance

### Creating a Room
1. Go to the home page
2. Enter a room name
3. Click "Create"
4. You'll automatically become the owner of this room

### Joining a Room
1. Find a room in the list on the home page
2. Click on the room to join it
3. Start chatting!

## Example Background and Cursor URLs

### Backgrounds
- Space: `https://images.unsplash.com/photo-1534796636912-3b95b3ab5986`
- Galaxy: `https://images.unsplash.com/photo-1462331940025-496dfbfc7564`
- Nebula: `https://images.unsplash.com/photo-1543722530-d2c3201371e7`

### Cursors
- Rocket: `https://cdn.custom-cursor.com/db/pointer/32/Rocket_Pointer.png`
- UFO: `https://cdn.custom-cursor.com/db/pointer/32/UFO_Pointer.png`
- Planet: `https://cdn.custom-cursor.com/db/pointer/32/Planet_Pointer.png`

## Deployment Guide

### Setting Up Environment Variables

1. For the server:
   - Rename `.env.example` to `.env` 
   - Fill in your MongoDB connection string and other sensitive data
   - Example:
     ```
     PORT=5000
     MONGODB_URI=mongodb+srv://yourusername:yourpassword@yourcluster.mongodb.net/yourdatabase
     ```

2. Never commit your actual `.env` files to GitHub as they contain sensitive information.

### GitHub Repository Setup

1. Initialize Git repository (if not already done):
   ```bash
   git init
   ```

2. Add your files to staging, respecting the .gitignore:
   ```bash
   git add .
   ```

3. Verify that sensitive files are not being tracked:
   ```bash
   git status
   ```
   
   You should NOT see `.env` files in the output.

4. Make your first commit:
   ```bash
   git commit -m "Initial commit"
   ```

5. Create a new GitHub repository at https://github.com/new

6. Link your local repository to GitHub:
   ```bash
   git remote add origin https://github.com/yourusername/your-repo-name.git
   ```

7. Push your code:
   ```bash
   git push -u origin main
   ```
   (Use `master` instead of `main` if your default branch is named differently)

### Deployment Options

1. **Vercel/Netlify** (Client):
   - Connect your GitHub repository
   - Set build command to `cd client && npm install && npm run build`
   - Set output directory to `client/build`

2. **Render/Railway** (Server):
   - Connect your GitHub repository
   - Set build command to `cd server && npm install`
   - Set start command to `cd server && node index.js`
   - Add your environment variables in the hosting platform's dashboard

3. **MongoDB Atlas**:
   - Make sure your MongoDB cluster allows connections from your deployment platform
   - Update network access settings in MongoDB Atlas to allow connections from anywhere (0.0.0.0/0) for testing, but limit to specific IPs for production

### Security Best Practices

1. Never store API keys, passwords, or sensitive data in your code
2. Always use environment variables for configuration
3. Keep your dependencies updated to avoid security vulnerabilities
4. Use HTTPS for all connections
5. Consider implementing rate limiting on your API endpoints

### Local Development After Cloning

When someone clones your repository, they should:

1. Install dependencies in both client and server folders:
   ```bash
   cd client && npm install
   cd server && npm install
   ```

2. Create their own `.env` file based on the `.env.example` template
3. Run the development servers for both client and server 

### Vercel Deployment

To properly deploy on Vercel:

1. **Frontend Deployment (Client):**
   - Deploy the repository root to Vercel
   - Override build settings:
     - Build Command: `cd client && npm install && npm run build`
     - Output Directory: `build` (not `client/build`)
   - Add the following environment variable in Vercel project settings:
     - `REACT_APP_SOCKET_SERVER`: Your backend server URL (e.g., `https://your-backend-server.onrender.com`)

2. **Backend Deployment (Server):**
   - Deploy to a service like Render, Railway, or Heroku
   - Add environment variables:
     - `PORT`: `5000` (or whatever port your service uses)
     - `MONGODB_URI`: Your MongoDB connection string
   - Make sure to enable CORS for your Vercel frontend domain

3. **Important CORS Configuration:**
   - Update your server's CORS configuration to allow requests from your Vercel frontend domain
   - In `server/index.js`, ensure your CORS settings include your Vercel domain

```javascript
const io = socketIO(server, {
  cors: {
    origin: ["https://your-vercel-app.vercel.app", "http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true
  }
});
``` 