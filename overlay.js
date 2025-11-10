const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;
const screen = electron.screen;
const path = require('path');
const MiaAI = require('./index');

console.log('Electron loaded successfully');
console.log('App object:', typeof app, app ? 'available' : 'not available');
console.log('BrowserWindow object:', typeof BrowserWindow, BrowserWindow ? 'available' : 'not available');

let mainWindow;
let mia;

function createWindow() {
  // Get screen dimensions
  let screenWidth = 1920;
  let screenHeight = 1080;

  try {
    const display = screen.getPrimaryDisplay();
    if (display && display.workAreaSize) {
      screenWidth = display.workAreaSize.width;
      screenHeight = display.workAreaSize.height;
    }
  } catch (error) {
    console.log('Could not get screen dimensions, using defaults');
  }

  // Create overlay window
  if (BrowserWindow) {
    mainWindow = new BrowserWindow({
      width: 350,
      height: 450,
      x: screenWidth - 370, // Position in bottom right
      y: screenHeight - 470,
      frame: false, // Remove window frame
      transparent: true, // Make window transparent
      alwaysOnTop: true, // Always on top
      skipTaskbar: true, // Don't show in taskbar
      resizable: false, // Prevent resizing
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true
      }
    });
  } else {
    console.error('BrowserWindow not available, cannot create overlay window');
    return;
  }

  // Load the overlay HTML
  mainWindow.loadFile(path.join(__dirname, 'overlay.html'));

  // Initialize Mia AI
  try {
    mia = new MiaAI();
    console.log('Mia AI initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Mia AI:', error.message);
    mia = null;
  }

  // Handle IPC messages from renderer
  ipcMain.on('chat-message', async (event, message) => {
    try {
      if (mia) {
        const response = await mia.generateResponse(message);
        event.reply('chat-response', response);
      } else {
        event.reply('chat-response', 'Mia is not available right now. Please try again later.');
      }
    } catch (error) {
      console.error('Error generating response:', error);
      event.reply('chat-response', 'Sorry, I encountered an error. Please try again.');
    }
  });

  // Handle window controls
  ipcMain.on('minimize-window', () => {
    mainWindow.minimize();
  });

  ipcMain.on('close-window', () => {
    mainWindow.close();
  });

  // Prevent window from being closed accidentally
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  // Show window when app is ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
}

if (app) {
  app.whenReady().then(createWindow);

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
} else {
  console.log('App not available, creating window directly');
  createWindow();
}

// Handle app quit
if (app) {
  app.on('before-quit', () => {
    app.isQuitting = true;
  });
}