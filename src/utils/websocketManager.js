const WebSocket = require('ws');

let wsServer = null;

function startWebSocket(port) {
  if (wsServer) {
    console.log('WebSocket server is already running.');
    return;
  }

  wsServer = new WebSocket.Server({ port }, () => {
    console.log(`WebSocket server started on port ${port}`);
  });

  // Store a reference globally for the status check
  global.wsServer = wsServer;

  wsServer.on('connection', (ws) => {
    console.log('A new client connected!');
    ws.on('message', (message) => {
      console.log(`Received: ${message}`);
    });
  });

  wsServer.on('close', () => {
    console.log('WebSocket server closed.');
    wsServer = null;
    global.wsServer = null; // Clean up the global reference
  });
}

function stopWebSocket() {
  if (wsServer) {
    wsServer.close();
    wsServer = null;
    global.wsServer = null; // Clean up the global reference
    console.log('WebSocket server stopped.');
  } else {
    console.log('WebSocket server is not running.');
  }
}

function broadcastMessage(message) {
  if (!wsServer) {
    console.log('WebSocket server is not running. Cannot broadcast message.');
    return;
  }

  wsServer.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

module.exports = { startWebSocket, stopWebSocket, broadcastMessage };
