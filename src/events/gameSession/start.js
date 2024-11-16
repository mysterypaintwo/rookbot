const { startWebSocket } = require('../../websocketManager');

module.exports = async (client) => {
  console.log('Starting WebSocket server for a new game session...');
  startWebSocket(8080); // Use the appropriate port
};
