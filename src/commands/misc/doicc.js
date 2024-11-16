const { serverGameName_base64encoded } = require('../../../config.json');
const { startWebSocket, stopWebSocket, broadcastMessage } = require('../../utils/websocketManager');
const serverGameName = Buffer.from(serverGameName_base64encoded, 'base64').toString('utf-8');

module.exports = {
  name: 'doicc',
  description: `Manages the Crowd Control server for ${serverGameName}.`,
  options: [
    {
      name: 'action',
      type: 3, // STRING
      description: 'Action to perform (start/stop/status/broadcast)',
      required: true,
    },
    {
      name: 'message',
      type: 3, // STRING
      description: 'Message to broadcast (only for broadcast)',
      required: false,
    },
  ],
  execute: async (client, interaction) => {
    if (!interaction.options) {
      return interaction.reply({
        content: 'Options are not available in this interaction.',
        ephemeral: true,
      });
    }

    const action = interaction.options.getString('action');
    const message = interaction.options.getString('message') || '';

    switch (action) {
      case 'start':
        startWebSocket(8080); // Start WebSocket server on port 8080
        await interaction.reply('WebSocket server started.');
        break;

      case 'stop':
        stopWebSocket();
        await interaction.reply('WebSocket server stopped.');
        break;

    case 'status':
        /*
        const status = global.wsServer ? 'running' : 'not running';
        await interaction.reply(`WebSocket server is currently ${status}.`);
        */
       
        // Full URL to the server, for example
        const serverUrl = 'http://localhost:8080';
        
        // Include the URL in the status reply
        const status = wsServer ? 'running' : 'not running';
        await interaction.reply(`WebSocket server is currently ${status}. Full URL: ${serverUrl}`);
        break;

      case 'broadcast':
        if (!global.wsServer) {
          await interaction.reply('WebSocket server is not running.');
          return;
        }
        broadcastMessage(message);
        await interaction.reply(`Broadcasted message: "${message}"`);
        break;

      default:
        await interaction.reply('Invalid action. Use start, stop, status, or broadcast.');
    }
  },
};
