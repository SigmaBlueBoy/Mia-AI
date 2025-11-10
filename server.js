const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const MiaAI = require('./index');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Serve the new interactive browser version at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'mia-browser.html'));
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve Socket.IO client files
app.use('/socket.io', express.static(path.join(__dirname, 'node_modules', 'socket.io', 'client-dist')));

// Initialize Mia AI
const mia = new MiaAI();
console.log('Mia AI initialized:', typeof mia);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected');

  socket.on('chat message', async (message) => {
    try {
      const response = await mia.generateResponse(message);
      socket.emit('chat response', response);
    } catch (error) {
      console.error('Error generating response:', error);
      socket.emit('chat response', 'Sorry, I encountered an error. Please try again.');
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });

  socket.on('model interaction', (data) => {
    console.log('Model interaction received:', data);
    // Handle model interaction - could trigger special responses
    const interactionResponse = `Mia reacts to being touched on her ${data.part}: ${data.response}`;
    socket.emit('model interaction response', {
      type: data.type,
      part: data.part,
      response: data.response
    });
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});